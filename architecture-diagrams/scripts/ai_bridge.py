#!/usr/bin/env python3
"""Local AI bridge: lets the diagram page ask Claude Code on this machine to edit a diagram.

Usage:
    python3 ai_bridge.py [--port 8765] [--host 127.0.0.1] [--claude PATH] [--model sonnet] [--timeout 240]
                         [--allow-origin ORIGIN ...] [--token-file PATH] [--new-token]

The editor page (https://quangdangle.github.io/architecture-diagrams-skill/, or a page built by this tool and opened
as a local file) sends the diagram and the request to http://127.0.0.1:8765/ask. The bridge runs the Claude Code
command line in print mode (claude -p) with the user's own sign-in, so a Claude seat (Team, Pro or Max) is enough and
no API key is needed, and it returns the answer as JSON. Install Claude Code and run claude once to sign in first.

    GET  /health  {"ok", "name", "version", "engine", "claude", "paired", "busy"}; needs no pairing code
    POST /ask     {"system": str, "prompt": str, "schema": JSON Schema, "model": str, "effort": "low" | "medium" | "high"}
                  (schema, model and effort are optional) -> {"ok": true, "data", "text", "model", "ms"}
                  Errors are {"ok": false, "error": ...}: 400 bad-json, bad-model or bad-request, 401 unpaired,
                  413 too-large, 429 busy, 502 claude (with "code" auth, quota or error, and "message"), 504 timeout.

Security model:
- Pairing code: /ask needs "Authorization: Bearer <code>". The code is made on the first start and kept in
  ~/.architecture-diagrams/bridge.json (folder 0700, file 0600). Paste it in the page's AI tab once, or open the page
  with #ai=8765:<code>. --new-token makes a new code; pages paired before must then pair again.
- Origin list: a browser request from any other web site gets 403 before anything runs. Allowed: null (a page opened
  from a file), https://quangdangle.github.io, http://localhost and http://127.0.0.1 on any port, and each
  --allow-origin. A sandboxed frame on any web site also sends null, one more reason the pairing code is required.
- No tools: Claude Code runs with --tools "" (every tool disabled), no settings files, no MCP servers, no slash
  commands and no saved session, in an empty temporary folder. It can only answer with text: it cannot read or change
  files or run commands. The prompt goes in on stdin, and the command is started from a list, never through a shell.
- The bridge listens on 127.0.0.1 only unless --host says otherwise, runs one answer at a time (429 busy), stops an
  answer after --timeout seconds (504), and logs one line per request, never what was asked or answered.
Standard library only, Python 3.9+.
"""

import argparse
import hmac
import json
import os
import re
import secrets
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.dont_write_bytecode = True

VERSION = "1.2.0"
NAME = "architecture-diagrams-ai-bridge"
TOKEN_FILE = Path.home() / ".architecture-diagrams" / "bridge.json"
MAX_BODY = 2 * 1024 * 1024  # bytes of one /ask body
MAX_SYSTEM, MAX_PROMPT = 60000, 400000  # characters
MAX_SCHEMA = 100000  # characters of the schema as JSON: it goes on the command line
DRAIN_LIMIT = 16 * 1024 * 1024  # a refused body up to this size is read first, so the browser sees the answer
MODELS = ("sonnet", "opus", "haiku")
MODEL_ID = re.compile(r"claude-[a-z0-9.-]{1,60}")
EFFORTS = ("low", "medium", "high")
PAGE_ORIGINS = ("https://quangdangle.github.io",)
LOCAL_ORIGIN = re.compile(r"http://(localhost|127\.0\.0\.1)(:\d{1,5})?")
LOCAL_HOSTS = ("127.0.0.1", "localhost")
TOKEN_SHAPE = re.compile(r"[A-Za-z0-9_-]{16,200}")
# "token" only as a whole word: "prompt is too long: 250000 tokens" is not a sign-in problem
AUTH_WORDS = re.compile(r"authenticat|oauth|\blog ?in\b|\btoken\b|\b401\b|api[ _-]?key", re.I)
QUOTA_WORDS = re.compile(r"\blimit|\busage|quota|\brate(?![a-z])|\b429\b|overload", re.I)
FENCE = re.compile(r"\s*```(?:json)?[ \t]*\n(.*?)\n\s*```\s*", re.S)
NOT_FOUND = {"ok": False, "error": "not-found"}
PRINT_LOCK = threading.Lock()


class BridgeError(Exception):
    def __init__(self, message, code=1):
        super().__init__(message)
        self.code = code


def say(line):
    with PRINT_LOCK:
        print(line, flush=True)


# ---------------------------------------------------------------------------- Claude Code
def find_claude(path=None):
    """The claude command: --claude, else the one on PATH, else the installers' folders. None when there is none."""
    if path:
        found = shutil.which(os.path.expanduser(path))
    else:
        found = shutil.which("claude") or next(
            (str(p) for p in (Path.home() / ".local" / "bin" / "claude", Path.home() / ".claude" / "local" / "claude")
             if p.is_file() and os.access(str(p), os.X_OK)), None)
    return os.path.abspath(found) if found else None  # absolute: the runs start in another folder


def claude_version(claude):
    """What claude --version prints (2.1.233 from "2.1.233 (Claude Code)"), or None when it does not run."""
    try:
        run = subprocess.run([claude, "--version"], capture_output=True, text=True, errors="replace", timeout=60,
                             stdin=subprocess.DEVNULL)
    except (OSError, subprocess.SubprocessError):
        return None
    if run.returncode != 0:
        return None
    first = (run.stdout.strip().splitlines() or ["unknown"])[0].strip()
    match = re.search(r"\d+(?:\.\d+)+\S*", first)
    return match.group(0) if match else first


def claude_argv(claude, job):
    """The command line for one answer. Never --bare: bare mode only takes an API key, not the user's sign-in."""
    argv = [claude, "-p", "--setting-sources", "", "--tools", "", "--strict-mcp-config", "--no-session-persistence",
            "--disable-slash-commands", "--model", job["model"], "--output-format", "json", "--system-prompt", job["system"]]
    if job.get("schema_json") is not None:
        argv += ["--json-schema", job["schema_json"]]
    if job.get("effort"):
        argv += ["--effort", job["effort"]]
    return argv


def kill_group(proc):
    """Stops a run and anything it started: each run has its own process group."""
    try:
        if os.name == "posix":
            os.killpg(proc.pid, signal.SIGKILL)
        else:
            proc.kill()
    except OSError:
        pass


def error_code(message):
    """auth (sign in to Claude Code again), quota (a usage limit or an overload: try later) or error."""
    if AUTH_WORDS.search(message):
        return "auth"
    if QUOTA_WORDS.search(message):
        return "quota"
    return "error"


def parse_result(out):
    """The result object that claude -p --output-format json prints, or None when stdout is not that."""
    lines = out.strip().splitlines()
    for candidate in (out, lines[-1] if lines else ""):
        try:
            value = json.loads(candidate)
        except (ValueError, RecursionError):
            continue
        if isinstance(value, list):  # the --verbose form: every message, the result last
            value = next((v for v in reversed(value) if isinstance(v, dict) and v.get("type") == "result"), None)
        if isinstance(value, dict) and (value.get("type") == "result" or "is_error" in value):
            return value
    return None


def json_in(text):
    """The JSON an answer's text holds, whole or in one ```json block; None when it holds none."""
    fenced = FENCE.fullmatch(text or "")
    for candidate in (text, fenced.group(1) if fenced else None):
        if candidate:
            try:
                return json.loads(candidate)
            except (ValueError, RecursionError):
                pass
    return None


def answer(stdout, stderr, model, started):
    """Turns what claude -p printed into the bridge's answer: (HTTP status, JSON). stdout counts even after exit 1."""
    out = stdout.decode("utf-8", "replace")
    result = parse_result(out)
    if result is None:
        detail = stderr.decode("utf-8", "replace").strip() or out.strip() or "Claude Code stopped without an answer"
        return 502, {"ok": False, "error": "claude", "code": "error", "message": detail[:500]}
    text = result.get("result")
    if result.get("is_error") or result.get("subtype", "success") != "success":
        errors = result.get("errors") if isinstance(result.get("errors"), list) else []
        message = text if isinstance(text, str) and text.strip() else "; ".join(map(str, errors)) or str(result.get("subtype") or "error")
        return 502, {"ok": False, "error": "claude", "code": error_code(message), "message": message[:500]}
    text = text if isinstance(text, str) else ""
    data = result.get("structured_output")
    if data is None:
        data = json_in(text)
    usage = result.get("modelUsage")
    ms = result.get("duration_ms")
    if not isinstance(ms, (int, float)) or isinstance(ms, bool):
        ms = (time.monotonic() - started) * 1000
    return 200, {"ok": True, "data": data, "text": text, "model": next(iter(usage)) if isinstance(usage, dict) and usage else model,
                 "ms": int(ms)}


def parse_ask(req, default_model):
    """Checks an /ask body. Returns (error answer, None) or (None, the settings of the run)."""
    def bad(message):
        return {"ok": False, "error": "bad-request", "message": message}, None

    if not isinstance(req, dict):
        return bad("the body must be a JSON object")
    job = {}
    for key, limit in (("system", MAX_SYSTEM), ("prompt", MAX_PROMPT)):
        value = req.get(key)
        if not isinstance(value, str) or not value.strip() or len(value) > limit or "\x00" in value:
            return bad(f'"{key}" must be text of 1 to {limit} characters')
        job[key] = value
    schema = req.get("schema")
    job["schema_json"] = None
    if schema is not None:
        try:
            job["schema_json"] = json.dumps(schema) if isinstance(schema, dict) else None
        except (ValueError, RecursionError):
            pass
        if job["schema_json"] is None or len(job["schema_json"]) > MAX_SCHEMA:
            return bad(f'"schema" must be a JSON Schema object of at most {MAX_SCHEMA} characters')
    model = req.get("model")
    if model is None:
        model = default_model
    elif not (isinstance(model, str) and (model in MODELS or MODEL_ID.fullmatch(model))):
        return {"ok": False, "error": "bad-model"}, None
    job["model"] = model
    job["effort"] = req.get("effort")
    if job["effort"] is not None and job["effort"] not in EFFORTS:
        return bad('"effort" must be "low", "medium" or "high"')
    return None, job


# ---------------------------------------------------------------------------- pairing code
def write_private(path, data):
    """Writes JSON only this user can read: the file 0600, a folder it makes (or the default folder) 0700."""
    folder = path.parent
    if not folder.is_dir():
        folder.mkdir(parents=True)
        os.chmod(folder, 0o700)
    elif folder == TOKEN_FILE.parent:
        os.chmod(folder, 0o700)
    fd, tmp = tempfile.mkstemp(prefix=".bridge-", suffix=".tmp", dir=str(folder))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(json.dumps(data, indent=2) + "\n")
        os.chmod(tmp, 0o600)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def pairing(path, port, new=False):
    """The pairing code kept in the token file; makes one (and the file) when there is none, or a new one on request."""
    data = {}
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                raise ValueError("it is not a JSON object")
        except (OSError, ValueError) as exc:
            if not new:
                raise BridgeError(f"ERROR: cannot read the pairing file {path} ({exc}). Fix it, or start with --new-token to replace it.")
            data = {}
    token = data.get("token")
    if new or not (isinstance(token, str) and TOKEN_SHAPE.fullmatch(token)):
        token = secrets.token_urlsafe(24)
    wanted = dict(data, token=token, port=port)
    if wanted != data:
        write_private(path, wanted)
    elif os.name == "posix" and path.stat().st_mode & 0o077:
        os.chmod(path, 0o600)
    return token


# ---------------------------------------------------------------------------- HTTP
class Handler(BaseHTTPRequestHandler):
    timeout = 30  # seconds a client may take to send its request

    def setup(self):
        super().setup()
        self.body_done, self.log_model, self.log_ms = False, None, None

    def version_string(self):
        return f"{NAME}/{VERSION}"

    def route(self):
        return self.path.split("?", 1)[0].split("#", 1)[0]

    def do_OPTIONS(self):
        if self.origin_ok():
            self.reply(204)

    def do_GET(self):
        if not self.origin_ok():
            return
        if self.route() != "/health":
            return self.reply(404, NOT_FOUND)
        self.reply(200, {"ok": True, "name": NAME, "version": VERSION, "engine": "claude-code", "claude": self.server.version,
                         "paired": self.paired(), "busy": self.server.run_lock.locked()})

    def do_POST(self):
        if not self.origin_ok():
            return
        if self.route() != "/ask":
            return self.reply(404, NOT_FOUND)
        started = time.monotonic()
        try:
            length = max(int(self.headers.get("Content-Length") or 0), 0)
        except ValueError:
            length = 0
        if not self.paired():
            return self.reply(401, {"ok": False, "error": "unpaired"})
        if length > MAX_BODY:
            return self.reply(413, {"ok": False, "error": "too-large"})
        try:
            request = json.loads(self.read_body(length))
        except (ValueError, RecursionError):
            return self.reply(400, {"ok": False, "error": "bad-json"})
        problem, job = parse_ask(request, self.server.model)
        if problem:
            return self.reply(400, problem)
        if not self.server.run_lock.acquire(blocking=False):
            return self.reply(429, {"ok": False, "error": "busy"})
        try:
            status, payload = self.server.run(job)
        finally:
            self.server.run_lock.release()
        self.log_model = payload.get("model") or job["model"]
        self.log_ms = int((time.monotonic() - started) * 1000)
        self.reply(status, payload)

    def do_other(self):
        if self.origin_ok():
            self.reply(404, NOT_FOUND)

    do_PUT = do_PATCH = do_DELETE = do_HEAD = do_other

    def paired(self):
        scheme, _, code = (self.headers.get("Authorization") or "").strip().partition(" ")
        return scheme.lower() == "bearer" and hmac.compare_digest(code.strip().encode("utf-8", "replace"), self.server.token.encode("utf-8"))

    def origin_ok(self):
        """False, after answering 403, for a browser request from a web site that is not on the list."""
        origin = self.headers.get("Origin")
        if origin is None or self.server.origin_allowed(origin):
            return True
        self.reply(403, {"ok": False, "error": "origin"})
        return False

    def read_body(self, length):
        self.body_done = True
        if length <= 0:
            return b""
        try:
            return self.rfile.read(length)
        except OSError:  # the client stopped sending
            self.close_connection = True
            return b""

    def discard_body(self):
        """Reads a body nobody will use, so the browser gets the answer instead of a reset connection."""
        if self.body_done:
            return
        self.body_done = True
        try:
            left = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return
        if left > DRAIN_LIMIT:
            return
        try:
            while left > 0:
                chunk = self.rfile.read(min(left, 65536))
                if not chunk:
                    return
                left -= len(chunk)
        except OSError:
            self.close_connection = True

    def reply(self, status, payload=None):
        self.discard_body()
        body = b"" if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        try:
            self.send_response(status)
            origin = self.headers.get("Origin")
            if origin is not None and self.server.origin_allowed(origin):
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
                self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Max-Age", "600")
                if (self.headers.get("Access-Control-Request-Private-Network") or "").strip().lower() == "true":
                    self.send_header("Access-Control-Allow-Private-Network", "true")  # Chrome, public page -> 127.0.0.1
            if payload is not None:
                self.send_header("Content-Type", "application/json; charset=utf-8")
            if status != 204:
                self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if body and self.command != "HEAD":
                self.wfile.write(body)
        except OSError:  # the page went away
            self.close_connection = True

    def log_request(self, code="-", size="-"):
        parts = [time.strftime("%H:%M:%S"), self.command or "-", (getattr(self, "path", None) or "-").split("?", 1)[0][:200],
                 str(int(code)) if isinstance(code, int) else str(code)]
        if self.log_model:
            parts.append(self.log_model)
        if self.log_ms is not None:
            parts.append(f"{self.log_ms}ms")
        self.server.log(re.sub(r"[^\x20-\x7e]", "?", " ".join(parts)))

    def log_message(self, format, *args):  # noqa: A002 (the base class names it so)
        pass  # the default line has the client address and the whole request line, query string included


class Bridge(ThreadingHTTPServer):
    """The HTTP server, with what the requests need: Claude Code, the pairing code, the origin list, the one run."""

    daemon_threads = True
    block_on_close = False  # Ctrl-C must not wait for an idle browser connection

    def __init__(self, address, claude, version, model="sonnet", timeout=240, origins=(), log=None):
        super().__init__(address, Handler)
        self.claude, self.version, self.model, self.timeout = claude, version, model, timeout
        self.token = ""
        self.origins = {o.strip().rstrip("/").lower() for o in PAGE_ORIGINS + tuple(origins) if o.strip()}
        self.log = log or say
        self.run_lock = threading.Lock()
        self.current = None

    def origin_allowed(self, origin):
        origin = origin.strip().lower()
        return origin == "null" or origin in self.origins or bool(LOCAL_ORIGIN.fullmatch(origin))

    def handle_error(self, request, client_address):
        if isinstance(sys.exc_info()[1], (ConnectionError, socket.timeout)):
            return  # a page that went away in the middle of a request
        super().handle_error(request, client_address)

    def run(self, job):
        """Runs Claude Code for one /ask. Returns (HTTP status, JSON answer)."""
        started = time.monotonic()
        with tempfile.TemporaryDirectory(prefix="ai-bridge-") as work:
            try:
                proc = subprocess.Popen(claude_argv(self.claude, job), stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE, cwd=work, start_new_session=os.name == "posix")
            except (OSError, ValueError) as exc:
                return 502, {"ok": False, "error": "claude", "code": "error", "message": f"cannot start Claude Code: {exc}"[:500]}
            self.current = proc
            try:
                out, err = proc.communicate(job["prompt"].encode("utf-8", "replace"), timeout=self.timeout)
            except subprocess.TimeoutExpired:
                kill_group(proc)
                try:
                    proc.communicate(timeout=5)
                except (subprocess.TimeoutExpired, OSError, ValueError):
                    pass
                return 504, {"ok": False, "error": "timeout"}
            finally:
                self.current = None
        return answer(out, err, job["model"], started)


def start(args, log=None):
    """Checks Claude Code, opens the port and loads or makes the pairing code. Returns the server, not yet serving."""
    claude = find_claude(args.claude)
    version = claude_version(claude) if claude else None
    if not version:
        what = (f"at {claude} did not answer claude --version" if claude else
                f"was not found at {args.claude}" if args.claude else "was not found (not on PATH, not in ~/.local/bin)")
        raise BridgeError(f"ERROR: Claude Code (the claude command) {what}. Install Claude Code, run claude once in a terminal to sign in, "
                          "then start the bridge again (give its path with --claude if it is somewhere else).\n"
                          "Chưa chạy được Claude Code (lệnh claude) trên máy này. Hãy cài Claude Code, mở Terminal chạy lệnh claude "
                          "một lần để đăng nhập, rồi mở lại cầu nối.", 2)
    token_file = Path(args.token_file).expanduser() if args.token_file else TOKEN_FILE
    try:
        server = Bridge((args.host, args.port), claude, version, args.model, args.timeout, args.allow_origin or (), log)
    except OSError as exc:
        raise BridgeError(f"ERROR: cannot listen on {args.host}:{args.port} ({exc.strerror or exc}). "
                          "Is the bridge already running? Stop it, or pick another --port.")
    try:
        server.token = pairing(token_file, server.server_address[1], args.new_token)
    except OSError as exc:
        server.server_close()
        raise BridgeError(f"ERROR: cannot write the pairing file {token_file}: {exc}")
    except BridgeError:
        server.server_close()
        raise
    return server


def banner(server, host):
    port, token = server.server_address[1], server.token
    lines = [f"Architecture Diagrams AI bridge on http://{host}:{port} (Claude Code {server.version})"]
    if host not in LOCAL_HOSTS:
        lines.append(f"WARNING: listening on {host} lets other machines reach the bridge; only the pairing code protects it. "
                     "Leave out --host unless you need this.")
    return lines + [f"Pair a page once: paste this code in the AI tab: {token}   (or open the page with #ai={port}:{token})",
                    f"Cầu nối AI đang chạy. Ghép trang một lần: dán mã này vào tab AI: {token}",
                    "Stop with Ctrl-C."]


def parse_args(argv=None):
    ap = argparse.ArgumentParser(description="Let the diagram page ask Claude Code on this machine to edit a diagram (a small local HTTP server).")
    ap.add_argument("--port", type=int, default=8765, help="port to listen on (default 8765)")
    ap.add_argument("--host", default="127.0.0.1", help="address to listen on (default 127.0.0.1: this machine only)")
    ap.add_argument("--claude", metavar="PATH", help="the claude command (default: the one on PATH, or in ~/.local/bin)")
    ap.add_argument("--model", default="sonnet", help="model when the page names none (default sonnet)")
    ap.add_argument("--timeout", type=float, default=240, help="seconds an answer may take before it is stopped (default 240)")
    ap.add_argument("--allow-origin", action="extend", nargs="+", metavar="ORIGIN",
                    help="also accept pages from this origin, for example https://diagrams.example.com")
    ap.add_argument("--token-file", metavar="PATH", help="where the pairing code is kept (default ~/.architecture-diagrams/bridge.json)")
    ap.add_argument("--new-token", action="store_true", help="make a new pairing code; pages paired before must pair again")
    args = ap.parse_args(argv)
    if not 0 <= args.port <= 65535:
        ap.error("--port must be 0 to 65535")
    if args.timeout <= 0:
        ap.error("--timeout must be more than 0 seconds")
    return args


def main(argv=None):
    args = parse_args(argv)
    try:
        sys.stdout.reconfigure(line_buffering=True, errors="replace")
    except (AttributeError, ValueError):
        pass
    try:
        server = start(args)
    except BridgeError as exc:
        print(exc)
        return exc.code
    except KeyboardInterrupt:
        return 130

    def stop(signum, frame):
        raise KeyboardInterrupt

    signal.signal(signal.SIGINT, signal.default_int_handler)  # Ctrl-C works even when started with SIGINT ignored
    signal.signal(signal.SIGTERM, stop)
    if hasattr(signal, "SIGHUP") and signal.getsignal(signal.SIGHUP) == signal.SIG_DFL:  # closing the terminal; nohup keeps it
        signal.signal(signal.SIGHUP, stop)
    for line in banner(server, args.host):
        print(line)
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        pass
    finally:
        if server.current is not None:
            kill_group(server.current)
        server.server_close()
    print("Stopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
