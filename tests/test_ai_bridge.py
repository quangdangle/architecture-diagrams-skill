"""The local AI bridge (scripts/ai_bridge.py): pairing, the origin list, and how it runs Claude Code.

No real Claude process starts: a fake claude records its arguments, stdin, process id and folder, and prints the
canned answer that FAKE_CLAUDE_MODE picks (the bridge passes its environment on unchanged)."""

import http.client
import json
import os
import re
import shlex
import signal
import stat
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "architecture-diagrams" / "scripts" / "ai_bridge.py"
sys.dont_write_bytecode = True
sys.path.insert(0, str(SCRIPT.parent))
import ai_bridge  # noqa: E402

FAKE_CLAUDE = r'''
import json, os, sys, time

if sys.argv[1:] == ["--version"]:
    print("2.1.99 (Claude Code)")
    sys.exit(0)
prompt = sys.stdin.buffer.read().decode("utf-8")
mode = os.environ.get("FAKE_CLAUDE_MODE", "ok")
with open(os.environ["FAKE_CLAUDE_RECORD"], "w", encoding="utf-8") as fh:
    json.dump({"argv": sys.argv[1:], "stdin": prompt, "pid": os.getpid(), "cwd": os.getcwd()}, fh)
if mode == "hang":
    time.sleep(60)
if mode == "gate":  # hold the run until the test opens the gate
    for _ in range(500):
        if os.path.exists(os.environ["FAKE_CLAUDE_GATE"]):
            break
        time.sleep(0.01)
if mode == "garbage":
    print("this is not JSON")
    print("Error: the fake broke", file=sys.stderr)
    sys.exit(3)
if mode in ("auth", "quota"):
    message = {"auth": "Failed to authenticate: OAuth session expired and could not be refreshed",
               "quota": "Claude AI usage limit reached|1760000000"}[mode]
    print(json.dumps({"type": "result", "subtype": "success", "is_error": True, "duration_ms": 41, "result": message}))
    sys.exit(1)
text = {"fenced": '```json\n{"ops": [], "note": "fenced"}\n```', "prose": "I would add a flip-flop."}.get(
    mode, json.dumps({"ops": [], "note": "from the text"}))
answer = {"type": "result", "subtype": "success", "is_error": False, "duration_ms": 2560, "num_turns": 1, "result": text,
          "session_id": "fake", "total_cost_usd": 0, "modelUsage": {"claude-sonnet-5": {"inputTokens": 12, "outputTokens": 34}}}
if mode in ("ok", "gate"):
    answer["structured_output"] = {"ops": [{"op": "addNode", "node": {"id": "sync3", "shape": "dff"}, "near": "ff2"}], "note": "structured"}
print(json.dumps(answer))
'''
STRUCTURED = {"ops": [{"op": "addNode", "node": {"id": "sync3", "shape": "dff"}, "near": "ff2"}], "note": "structured"}
SCHEMA = {"type": "object", "properties": {"ops": {"type": "array"}, "note": {"type": "string"}}, "required": ["ops"]}
FAKE_VARS = ("FAKE_CLAUDE_MODE", "FAKE_CLAUDE_RECORD", "FAKE_CLAUDE_GATE")


def write_fake(folder):
    """A claude command in folder that runs FAKE_CLAUDE with this Python."""
    script = folder / "fake_claude.py"
    script.write_text(FAKE_CLAUDE, encoding="utf-8")
    command = folder / "claude"
    command.write_text(f'#!/bin/sh\nexec {shlex.quote(sys.executable)} {shlex.quote(str(script))} "$@"\n', encoding="utf-8")
    command.chmod(0o755)
    return command


def request(port, method, path, body=None, headers=None):
    """One HTTP request. Returns (status, headers with lower-case names, the JSON body or None)."""
    if isinstance(body, dict):
        body = json.dumps(body, ensure_ascii=False).encode("utf-8")
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=20)
    try:
        conn.request(method, path, body=body, headers=headers or {})
        resp = conn.getresponse()
        raw = resp.read()
        return resp.status, {k.lower(): v for k, v in resp.getheaders()}, (json.loads(raw) if raw else None)
    finally:
        conn.close()


def restore(saved):
    for key, value in saved.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value


class Answers(unittest.TestCase):
    """How the output of claude -p is read, without starting anything."""

    def test_error_codes(self):
        for message, code in (("Failed to authenticate. API Error: 401 {\"type\":\"error\"}", "auth"),
                              ("OAuth token has expired. Please obtain a new token or refresh your existing token.", "auth"),
                              ("Invalid API key · Please run /login", "auth"), ("Not logged in · Please run /login", "auth"),
                              ("Claude AI usage limit reached|1760000000", "quota"), ("5-hour limit reached ∙ resets 3pm", "quota"),
                              ("API Error: 429 rate_limit_error", "quota"), ("API Error: 529 Overloaded", "quota"),
                              ("Prompt is too long: 250000 tokens", "error"), ("Failed to generate a reply", "error")):
            with self.subTest(message=message):
                self.assertEqual(ai_bridge.error_code(message), code)

    def test_failed_runs(self):
        long = json.dumps({"type": "result", "subtype": "success", "is_error": True, "result": "Failed to authenticate. " + "x" * 2000})
        status, body = ai_bridge.answer(long.encode("utf-8"), b"", "sonnet", time.monotonic())
        self.assertEqual((status, body["error"], body["code"], len(body["message"])), (502, "claude", "auth", 500))
        retries = json.dumps({"type": "result", "subtype": "error_max_structured_output_retries", "is_error": False,
                              "errors": ["the answer did not match the schema"]})
        status, body = ai_bridge.answer(retries.encode("utf-8"), b"", "sonnet", time.monotonic())
        self.assertEqual((status, body["code"], body["message"]), (502, "error", "the answer did not match the schema"))
        status, body = ai_bridge.answer(b"", b"", "sonnet", time.monotonic())
        self.assertEqual((status, body["code"]), (502, "error"))


class Pairing(unittest.TestCase):
    def test_code_is_kept_replaced_on_request_and_never_lost(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "new-folder" / "bridge.json"
            first = ai_bridge.pairing(path, 8765)
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o600)
            self.assertEqual(stat.S_IMODE(path.parent.stat().st_mode), 0o700)
            self.assertRegex(first, r"^[A-Za-z0-9_-]{32}$")  # 24 random bytes
            self.assertEqual(ai_bridge.pairing(path, 8765), first)
            second = ai_bridge.pairing(path, 9000, new=True)
            self.assertNotEqual(second, first)
            self.assertEqual(json.loads(path.read_text(encoding="utf-8")), {"token": second, "port": 9000})
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o600)
            path.write_text("not json", encoding="utf-8")
            with self.assertRaises(ai_bridge.BridgeError):
                ai_bridge.pairing(path, 8765)  # a file it cannot read is left as it is
            self.assertEqual(path.read_text(encoding="utf-8"), "not json")
            self.assertNotIn(ai_bridge.pairing(path, 8765, new=True), (first, second))
            self.assertEqual([p.name for p in path.parent.iterdir()], ["bridge.json"])  # no temporary file left


@unittest.skipUnless(os.name == "posix", "the fake claude is a shell script")
class Bridge(unittest.TestCase):
    SYSTEM = "You edit diagrams. Answer with ops."
    PROMPT = "Thêm một flip-flop sau ff2 ✓"

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.dir = Path(cls.tmp.name)
        cls.token_file = cls.dir / "config" / "bridge.json"
        args = ai_bridge.parse_args(["--port", "0", "--claude", str(write_fake(cls.dir)), "--token-file", str(cls.token_file),
                                     "--timeout", "2", "--allow-origin", "https://diagrams.example.com"])
        cls.log = []
        cls.server = ai_bridge.start(args, log=cls.log.append)
        cls.port, cls.token = cls.server.server_address[1], cls.server.token
        cls.thread = threading.Thread(target=cls.server.serve_forever, kwargs={"poll_interval": 0.05}, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(5)
        cls.tmp.cleanup()

    def setUp(self):
        self.addCleanup(restore, {key: os.environ.get(key) for key in FAKE_VARS})
        self.record = self.dir / (self._testMethodName + ".json")
        os.environ["FAKE_CLAUDE_RECORD"] = str(self.record)
        self.mode("ok")

    def mode(self, name):
        os.environ["FAKE_CLAUDE_MODE"] = name

    def call(self, method, path, body=None, headers=None, token=None):
        headers = dict(headers or {})
        if token:
            headers["Authorization"] = "Bearer " + token
        return request(self.port, method, path, body, headers)

    def ask(self, **fields):
        return self.call("POST", "/ask", dict({"system": self.SYSTEM, "prompt": self.PROMPT}, **fields), token=self.token)

    def ran(self):
        """What the fake claude got: its arguments, stdin, process id and folder."""
        return json.loads(self.record.read_text(encoding="utf-8"))

    def test_health_says_whether_the_page_is_paired(self):
        status, _, body = self.call("GET", "/health")
        self.assertEqual(status, 200)
        self.assertEqual(body, {"ok": True, "name": "architecture-diagrams-ai-bridge", "version": "1.2.0", "engine": "claude-code",
                                "claude": "2.1.99", "paired": False, "busy": False})
        self.assertTrue(self.call("GET", "/health", token=self.token)[2]["paired"])
        self.assertFalse(self.call("GET", "/health", token=self.token[:-1])[2]["paired"])

    def test_ask_needs_the_pairing_code(self):
        for headers in ({}, {"Authorization": "Bearer not-the-code"}, {"Authorization": "Basic " + self.token}, {"Authorization": self.token}):
            with self.subTest(headers=headers):
                status, _, body = self.call("POST", "/ask", {"system": "s", "prompt": "p"}, headers)
                self.assertEqual((status, body), (401, {"ok": False, "error": "unpaired"}))
        self.assertFalse(self.record.exists())  # Claude Code never ran

    def test_other_web_sites_are_refused(self):
        for origin in ("https://evil.example", "https://quangdangle.github.io.evil.example", "http://localhost.evil.example",
                       "https://localhost:5173", "http://127.0.0.1:5173/", ""):
            for method, path in (("GET", "/health"), ("OPTIONS", "/ask"), ("POST", "/ask")):
                with self.subTest(origin=origin, method=method):
                    body = {"system": "s", "prompt": "p"} if method == "POST" else None
                    status, headers, answer = self.call(method, path, body, {"Origin": origin}, token=self.token)
                    self.assertEqual((status, answer), (403, {"ok": False, "error": "origin"}))
                    self.assertEqual([h for h in headers if h.startswith("access-control-") or h == "vary"], [])
        self.assertFalse(self.record.exists())

    def test_cors_headers_for_the_pages_that_may_ask(self):
        for origin in ("null", "https://quangdangle.github.io", "http://localhost:5173", "http://127.0.0.1:8080", "http://localhost",
                       "https://diagrams.example.com"):
            with self.subTest(origin=origin):
                status, headers, body = self.call("OPTIONS", "/ask", headers={
                    "Origin": origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization, content-type"})
                self.assertEqual((status, body), (204, None))
                self.assertEqual(headers["access-control-allow-origin"], origin)
                self.assertEqual(headers["vary"], "Origin")
                self.assertEqual(headers["access-control-allow-headers"], "Authorization, Content-Type")
                self.assertEqual(headers["access-control-allow-methods"], "GET, POST, OPTIONS")
                self.assertEqual(headers["access-control-max-age"], "600")
                self.assertNotIn("access-control-allow-private-network", headers)
                status, headers, _ = self.call("GET", "/health", headers={"Origin": origin})
                self.assertEqual((status, headers["access-control-allow-origin"]), (200, origin))
        status, headers, _ = self.call("POST", "/ask", {"system": "s", "prompt": "p"}, {"Origin": "null"})
        self.assertEqual((status, headers["access-control-allow-origin"]), (401, "null"))  # the page can read the error

    def test_private_network_access_preflight(self):
        status, headers, _ = self.call("OPTIONS", "/ask", headers={
            "Origin": "https://quangdangle.github.io", "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization, content-type", "Access-Control-Request-Private-Network": "true"})
        self.assertEqual(status, 204)
        self.assertEqual(headers["access-control-allow-private-network"], "true")
        self.assertEqual(headers["access-control-allow-origin"], "https://quangdangle.github.io")

    def test_answer_comes_from_structured_output(self):
        status, headers, body = self.ask(schema=SCHEMA)
        self.assertEqual(status, 200, body)
        self.assertEqual(body, {"ok": True, "data": STRUCTURED, "text": json.dumps({"ops": [], "note": "from the text"}),
                                "model": "claude-sonnet-5", "ms": 2560})
        self.assertEqual(headers["content-type"], "application/json; charset=utf-8")

    def test_answer_without_structured_output_is_read_from_the_text(self):
        self.mode("text")
        self.assertEqual(self.ask()[2]["data"], {"ops": [], "note": "from the text"})
        self.mode("fenced")
        self.assertEqual(self.ask()[2]["data"], {"ops": [], "note": "fenced"})
        self.mode("prose")
        status, _, body = self.ask()
        self.assertEqual((status, body["ok"], body["data"], body["text"]), (200, True, None, "I would add a flip-flop."))

    def test_how_claude_code_is_run(self):
        self.assertEqual(self.ask()[0], 200)
        ran = self.ran()
        self.assertEqual(ran["argv"], ["-p", "--setting-sources", "", "--tools", "", "--strict-mcp-config", "--no-session-persistence",
                                       "--disable-slash-commands", "--model", "sonnet", "--output-format", "json",
                                       "--system-prompt", self.SYSTEM])
        self.assertEqual(ran["stdin"], self.PROMPT)  # the prompt goes in on stdin, never on the command line
        self.assertFalse(Path(ran["cwd"]).exists())  # it ran in an empty folder of its own, gone afterwards

        self.assertEqual(self.ask(schema=SCHEMA, model="claude-opus-5-5", effort="high")[0], 200)
        argv = self.ran()["argv"]
        self.assertEqual(argv[argv.index("--tools") + 1], "")
        self.assertEqual(argv[argv.index("--setting-sources") + 1], "")
        self.assertIn("--no-session-persistence", argv)
        self.assertEqual(argv[argv.index("--json-schema") + 1], json.dumps(SCHEMA))
        self.assertEqual(argv[argv.index("--model") + 1], "claude-opus-5-5")
        self.assertEqual(argv[argv.index("--effort") + 1], "high")
        self.assertNotIn("--bare", argv)

        self.assertEqual(self.ask(model="opus")[0], 200)
        argv = self.ran()["argv"]
        self.assertEqual(argv[argv.index("--model") + 1], "opus")
        self.assertNotIn("--json-schema", argv)
        self.assertNotIn("--bare", argv)

    def test_sign_in_usage_limit_and_broken_output(self):
        self.mode("auth")
        status, _, body = self.ask()
        self.assertEqual((status, body), (502, {"ok": False, "error": "claude", "code": "auth",
                                                "message": "Failed to authenticate: OAuth session expired and could not be refreshed"}))
        self.mode("quota")
        status, _, body = self.ask()
        self.assertEqual((status, body["error"], body["code"]), (502, "claude", "quota"))
        self.mode("garbage")
        status, _, body = self.ask()
        self.assertEqual((status, body), (502, {"ok": False, "error": "claude", "code": "error", "message": "Error: the fake broke"}))

    def test_a_slow_answer_is_stopped(self):
        self.mode("hang")
        started = time.monotonic()
        status, _, body = self.ask()
        self.assertEqual((status, body), (504, {"ok": False, "error": "timeout"}))
        self.assertLess(time.monotonic() - started, 10)
        with self.assertRaises(ProcessLookupError):
            os.kill(self.ran()["pid"], 0)  # the fake claude was killed, not left running
        self.assertFalse(self.call("GET", "/health")[2]["busy"])

    def test_one_answer_at_a_time(self):
        self.mode("gate")
        gate = self.dir / "gate"
        os.environ["FAKE_CLAUDE_GATE"] = str(gate)
        first = {}
        thread = threading.Thread(target=lambda: first.update(answer=self.ask()))
        thread.start()
        try:
            deadline = time.monotonic() + 10
            while not self.record.exists():  # the fake has the prompt: the first answer is running
                self.assertLess(time.monotonic(), deadline, "the first answer did not start")
                time.sleep(0.01)
            self.assertTrue(self.call("GET", "/health")[2]["busy"])
            status, _, body = self.ask()
            self.assertEqual((status, body), (429, {"ok": False, "error": "busy"}))
        finally:
            gate.write_text("open", encoding="utf-8")
            thread.join(10)
        self.assertEqual((first["answer"][0], first["answer"][2]["data"]), (200, STRUCTURED))
        self.assertFalse(self.call("GET", "/health")[2]["busy"])

    def test_body_over_2_mb_is_refused(self):
        body = json.dumps({"system": "s", "prompt": "x" * (2 * 1024 * 1024)}).encode("utf-8")
        status, _, answer = self.call("POST", "/ask", body, token=self.token)
        self.assertEqual((status, answer), (413, {"ok": False, "error": "too-large"}))
        self.assertFalse(self.record.exists())

    def test_bad_requests(self):
        status, _, body = self.call("POST", "/ask", b"{not json", token=self.token)
        self.assertEqual((status, body), (400, {"ok": False, "error": "bad-json"}))
        for model in ("gpt-5", "Sonnet", "sonnet --bare", "fable", "claude-", "claude-" + "a" * 61, "claude-opus/../x", "", 5):
            with self.subTest(model=model):
                status, _, body = self.ask(model=model)
                self.assertEqual((status, body), (400, {"ok": False, "error": "bad-model"}))
        for fields in ({"prompt": None}, {"system": ""}, {"prompt": " "}, {"prompt": "x" * 400001}, {"system": "x" * 60001},
                       {"schema": ["ops"]}, {"effort": "max"}):
            with self.subTest(fields=sorted(fields)):
                status, _, body = self.ask(**fields)
                self.assertEqual((status, body["error"]), (400, "bad-request"))
        status, _, body = self.call("POST", "/ask", b"[1, 2]", token=self.token)  # JSON, but not an object
        self.assertEqual((status, body["error"]), (400, "bad-request"))
        self.assertFalse(self.record.exists())

    def test_anything_else_is_not_found(self):
        for method, path in (("GET", "/"), ("GET", "/ask"), ("POST", "/health"), ("PUT", "/ask"), ("DELETE", "/ask"), ("GET", "/health/x")):
            with self.subTest(method=method, path=path):
                status, _, body = self.call(method, path, token=self.token)
                self.assertEqual((status, body), (404, {"ok": False, "error": "not-found"}))
        self.assertEqual(self.call("OPTIONS", "/anything")[0], 204)
        self.assertEqual(self.call("GET", "/health?x=1")[0], 200)

    def test_log_has_one_line_per_request_and_no_content(self):
        secret = "PRIVATE-DIAGRAM-7f3a"
        before = len(self.log)
        self.assertEqual(self.ask(system="S " + secret, prompt="P " + secret)[0], 200)
        self.call("GET", "/health?code=" + secret, token=self.token)
        lines = self.log[before:]
        self.assertEqual(len(lines), 2, lines)
        self.assertRegex(lines[0], r"^\d\d:\d\d:\d\d POST /ask 200 claude-sonnet-5 \d+ms$")
        self.assertRegex(lines[1], r"^\d\d:\d\d:\d\d GET /health 200$")
        everything = "\n".join(self.log)
        self.assertNotIn(secret, everything)
        self.assertNotIn(self.token, everything)

    def test_pairing_file_is_private(self):
        self.assertEqual(stat.S_IMODE(self.token_file.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.token_file.parent.stat().st_mode), 0o700)
        self.assertEqual(json.loads(self.token_file.read_text(encoding="utf-8")), {"token": self.token, "port": self.port})


@unittest.skipUnless(os.name == "posix", "the fake claude is a shell script")
class CommandLine(unittest.TestCase):
    ENV = dict(os.environ, PYTHONDONTWRITEBYTECODE="1", PYTHONIOENCODING="utf-8")

    def test_without_claude_code_it_says_to_install_it(self):
        with tempfile.TemporaryDirectory() as tmp:
            token_file = Path(tmp) / "bridge.json"
            run = subprocess.run([sys.executable, str(SCRIPT), "--claude", str(Path(tmp) / "no-claude"), "--token-file", str(token_file)],
                                 capture_output=True, text=True, encoding="utf-8", timeout=60, env=self.ENV)
            self.assertEqual(run.returncode, 2, run.stdout + run.stderr)
            self.assertIn("Install Claude Code", run.stdout)
            self.assertIn("Claude Code (lệnh claude)", run.stdout)
            self.assertFalse(token_file.exists())

    def test_start_pair_and_stop_with_ctrl_c(self):
        with tempfile.TemporaryDirectory() as tmp:
            token_file = Path(tmp) / "bridge.json"
            proc = subprocess.Popen([sys.executable, str(SCRIPT), "--port", "0", "--claude", str(write_fake(Path(tmp))),
                                     "--token-file", str(token_file)],
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", env=self.ENV)
            lines = []
            reader = threading.Thread(target=lambda: [lines.append(line.rstrip("\n")) for line in proc.stdout], daemon=True)
            reader.start()
            try:
                deadline = time.monotonic() + 30
                while len(lines) < 4 and proc.poll() is None and time.monotonic() < deadline:
                    time.sleep(0.02)
                self.assertGreaterEqual(len(lines), 4, lines)
                match = re.fullmatch(r"Architecture Diagrams AI bridge on http://127\.0\.0\.1:(\d+) \(Claude Code 2\.1\.99\)", lines[0])
                self.assertTrue(match, lines[0])
                port = int(match.group(1))
                token = json.loads(token_file.read_text(encoding="utf-8"))["token"]
                self.assertEqual(lines[1:4], [f"Pair a page once: paste this code in the AI tab: {token}   (or open the page with #ai={port}:{token})",
                                              f"Cầu nối AI đang chạy. Ghép trang một lần: dán mã này vào tab AI: {token}",
                                              "Stop with Ctrl-C."])
                status, _, body = request(port, "GET", "/health", headers={"Authorization": "Bearer " + token})
                self.assertEqual((status, body["paired"]), (200, True))
                proc.send_signal(signal.SIGINT)
                self.assertEqual(proc.wait(timeout=20), 0)
            finally:
                if proc.poll() is None:
                    proc.kill()
                    proc.wait()
                reader.join(5)
                errors = proc.stderr.read()
                proc.stdout.close()
                proc.stderr.close()
            self.assertEqual(errors, "")
            self.assertRegex(lines[4], r"^\d\d:\d\d:\d\d GET /health 200$")
            self.assertEqual(lines[-1], "Stopped.")


if __name__ == "__main__":
    unittest.main()
