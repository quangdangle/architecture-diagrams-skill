#!/usr/bin/env python3
"""MCP server for architecture-diagrams (Model Context Protocol, stdio transport).

Any MCP client can use it: Claude Code, Claude Desktop, Codex CLI, Cursor, VS Code, Gemini CLI and others.
The agent gets tools to read the spec format, validate a spec (wiring checks included), build the interactive
page, open the editor, export to draw.io / SVG / PNG / Mermaid / CSV, import draw.io files and scan source code.

Register it with your client, for example:
    claude mcp add architecture-diagrams -- python3 /path/to/architecture-diagrams/scripts/mcp_server.py
    codex mcp add architecture-diagrams -- python3 /path/to/architecture-diagrams/scripts/mcp_server.py
or in a JSON config (Claude Desktop, Cursor, VS Code, Gemini CLI):
    {"mcpServers": {"architecture-diagrams": {"command": "python3", "args": ["/path/to/.../scripts/mcp_server.py"]}}}

Output files go to the "output" path given in a call, next to the input file, or else to the folder in
ARCHITECTURE_DIAGRAMS_OUT (default: <temp>/architecture-diagrams). Standard library only, Python 3.8+.
Export and draw.io import need Chrome, Chromium, Edge or Brave, the same as export.py.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import time
import traceback
import unicodedata
import webbrowser
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
sys.path.insert(0, str(HERE))
import assist  # noqa: E402
from build import ai_prompt  # noqa: E402
from validate import SYMBOL_ALIASES, SYMBOL_PINS, SYMBOL_SIZES, validate_spec  # noqa: E402

VERSION = "1.1.0"
PROTOCOLS = ("2025-06-18", "2025-03-26", "2024-11-05")
FORMATS = ("drawio", "svg", "png", "mermaid", "csv", "html", "spec", "library")
DRAWIO_SUFFIXES = (".drawio", ".xml", ".svg", ".dio")
INSTRUCTIONS = (
    "Diagrams for software and chip design: block diagrams, flows, state machines, clock trees, schematics with named pins, "
    "timing diagrams, register maps, address maps, datasheet chip diagrams and pinouts. Call diagram_guide first for the JSON "
    "format, write the spec, call diagram_validate and fix what it reports, then diagram_build (or diagram_open_editor so the "
    "user can adjust it by hand) and diagram_export for draw.io, SVG or PNG. Use diagram_import_drawio to edit an existing "
    "draw.io file and diagram_scan_code to start from a source repository. To change a diagram in small steps, use "
    "diagram_apply_ops (add, update, remove, connect pin to pin) and diagram_insert_pattern (ready-made circuits and "
    "architectures, wired to a block's pins); diagram_suggest lists what is wrong with a fix for each, likely next blocks, and the next steps for the whole tab."
)

SPEC_OR_PATH = {
    "spec": {"type": ["object", "string"], "description": "The diagram spec as a JSON object (or JSON text)."},
    "path": {"type": "string", "description": "Or a file: a .json spec, a page built by this tool, or a draw.io file."},
}
TOOLS = [
    {"name": "diagram_guide",
     "description": "The spec format for every diagram type, every symbol with its named pins and pin positions, and the wiring rules. Read it before writing or editing a spec.",
     "inputSchema": {"type": "object", "properties": {}}},
    {"name": "diagram_validate",
     "description": "Check a spec before building it. Returns errors (must fix) and warnings (wiring mistakes such as reversed wires, two outputs joined, a flip-flop without a clock, stacked blocks, and readability hints).",
     "inputSchema": {"type": "object", "properties": dict(SPEC_OR_PATH)}},
    {"name": "diagram_build",
     "description": "Build the interactive HTML page from a spec or a draw.io file. The page shows the diagram with zoom, search, steps and downloads, and has an editor (tables, drag and drop, draw.io export). Returns the file path.",
     "inputSchema": {"type": "object", "properties": dict(SPEC_OR_PATH, output={"type": "string", "description": "Where to write the .html file."},
                                                          force={"type": "boolean", "description": "Build even when validation finds errors."})}},
    {"name": "diagram_open_editor",
     "description": "Build a page that opens with the editor (tables with required fields and checks, drag and drop, pin-aware wiring) and open it in the user's browser, so the user can adjust the diagram by hand.",
     "inputSchema": {"type": "object", "properties": dict(SPEC_OR_PATH, output={"type": "string", "description": "Where to write the .html file."},
                                                          open={"type": "boolean", "description": "Open it in the default browser (default true)."})}},
    {"name": "diagram_export",
     "description": "Convert a spec, a built page or a draw.io file: drawio (editable in draw.io, every tab a page), svg, png, mermaid, csv (register, address-map or pinout tabs), html, spec (JSON) or library (the symbols as a draw.io shape library).",
     "inputSchema": {"type": "object", "required": ["format"],
                     "properties": dict(SPEC_OR_PATH, format={"type": "string", "enum": list(FORMATS)},
                                        diagram={"type": "string", "description": "Tab id for svg, png, mermaid and csv (default: the first tab)."},
                                        output={"type": "string", "description": "Output file path."},
                                        theme={"type": "string", "enum": ["light", "dark"]})}},
    {"name": "diagram_import_drawio",
     "description": "Read a draw.io file (.drawio, .xml, .svg, .dio) and return it as a spec that can be edited, validated and built. Shapes, groups, connections, pins and styles are kept, so exporting back to draw.io keeps the file as it was.",
     "inputSchema": {"type": "object", "required": ["path"], "properties": {
         "path": {"type": "string"}, "lang": {"type": "string", "enum": ["en", "vi"]},
         "max_chars": {"type": "integer", "description": "Return the JSON inline up to this size (default 120000); larger specs are only written to a file."}}}},
    {"name": "diagram_scan_code",
     "description": "Scan a source folder (Python, JavaScript/TypeScript, Go, Java/Kotlin, C/C++, Verilog/SystemVerilog with module ports) and return a draft spec: an overview of folders and imports, drill-downs, and an RTL module hierarchy.",
     "inputSchema": {"type": "object", "required": ["path"], "properties": {
         "path": {"type": "string"}, "lang": {"type": "string", "enum": ["en", "vi"]}, "title": {"type": "string"},
         "max_nodes": {"type": "integer"}, "details": {"type": "integer"}, "include_tests": {"type": "boolean"}}}},
    {"name": "diagram_symbols",
     "description": "List the symbols (logic gates, flip-flops, mux, PLL, ADC, passives, transistors, software icons and shapes) with their pins. Filter by text or category.",
     "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}, "category": {"type": "string"}}}},
    {"name": "diagram_patterns",
     "description": "List the 30 ready-made patterns in four groups: digital circuits (synchronizers, clock gate, divider, edge detector, shift register, LFSR…), SoC, IP and verification (minimal RISC-V SoC, AXI/APB, TL-UL, async FIFO, UART, SPI, clock tree, UVM testbench), software (web, microservices, events, serverless, data and ML pipelines, Kubernetes, CI/CD) and flowcharts or state machines. Shows the pins each one wires to a selected block.",
     "inputSchema": {"type": "object", "properties": {"lang": {"type": "string", "enum": ["en", "vi"]}}}},
    {"name": "diagram_insert_pattern",
     "description": "Insert a ready-made pattern into a block-diagram tab. With near, it goes next to that block and is wired to its pins (for example the block's Q pin into the synchronizer's D pin, or a clock into the pattern's clock pins). Returns the new spec and what the checks still find, each problem with a fix.",
     "inputSchema": {"type": "object", "required": ["pattern"], "properties": dict(SPEC_OR_PATH, pattern={"type": "string", "description": "Pattern id from diagram_patterns."},
                                                                               near={"type": "string", "description": "Block id to place it next to and wire it to."},
                                                                               clock={"type": "string", "description": "Clock source block for the pattern's clock pins; for a synchronizer, the clock of the destination domain."},
                                                                               diagram={"type": "string", "description": "Tab id (default: the first block-diagram tab)."},
                                                                               output={"type": "string", "description": "Where to write the changed spec (.json)."})}},
    {"name": "diagram_apply_ops",
     "description": 'Change a block-diagram tab with editing operations instead of rewriting the spec: addNode {node, near?, side?}, updateNode {id, set, unset}, removeNode {id}, renameNode {id, to}, connect {from, to, kind?, label?} where an end is "block" or "block.PIN", disconnect {from, to} or {edge}, reverseEdge {edge}, updateEdge {edge, set}, addGroup {group}, updateGroup {id, set}, removeStep {index}, updateDiagram {set: {layout, route, direction, title}}. All or nothing: one failing operation changes nothing and the errors say why.',
     "inputSchema": {"type": "object", "required": ["ops"], "properties": dict(SPEC_OR_PATH, ops={"type": ["array", "object"], "description": 'The operations, or {"ops": [...]}.'},
                                                                           diagram={"type": "string", "description": "Tab id (default: the first block-diagram tab)."},
                                                                           output={"type": "string", "description": "Where to write the changed spec (.json)."})}},
    {"name": "diagram_suggest",
     "description": "What the editor would suggest: every problem on a block-diagram tab (reversed wires, missing clocks, stacked blocks, unknown shapes…) with ready-to-apply fixes as operations, likely next blocks for each block or for one block (node), and without node the next steps for the whole tab (up to five, most useful first).",
     "inputSchema": {"type": "object", "properties": dict(SPEC_OR_PATH, node={"type": "string", "description": "Only suggestions for this block."},
                                                          diagram={"type": "string", "description": "Tab id (default: the first block-diagram tab)."})}},
]
RESOURCES = [
    {"uri": "architecture-diagrams://guide", "name": "Spec format and symbols", "mimeType": "text/markdown",
     "description": "What diagram_guide returns: every diagram type, every symbol with its pins, the wiring rules."},
    {"uri": "architecture-diagrams://spec-reference", "name": "Full spec reference", "mimeType": "text/markdown",
     "description": "references/spec.md: every field of every diagram type."},
    {"uri": "architecture-diagrams://symbols", "name": "Symbol catalog", "mimeType": "application/json",
     "description": "Every symbol with category, default size and pins."},
]


class ToolError(Exception):
    pass


STATE = {"protocol": PROTOCOLS[0]}


def out_dir():
    folder = Path(os.environ.get("ARCHITECTURE_DIAGRAMS_OUT") or (Path(tempfile.gettempdir()) / "architecture-diagrams"))
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def slug(text):
    s = unicodedata.normalize("NFKD", str(text or "diagram").replace("đ", "d").replace("Đ", "D"))
    s = re.sub(r"[^A-Za-z0-9]+", "-", "".join(ch for ch in s if not unicodedata.combining(ch))).strip("-").lower()
    return (s or "diagram")[:60]


def load_input(args):
    """Returns (source file path, spec dict or None). A spec object is written to a file so the scripts can read it."""
    spec, path = args.get("spec"), args.get("path")
    if spec is not None:
        if isinstance(spec, str):
            try:
                spec = json.loads(spec)
            except ValueError as exc:
                raise ToolError(f"spec is not valid JSON: {exc}")
        if not isinstance(spec, dict):
            raise ToolError("spec must be a JSON object")
        target = out_dir() / f"{slug(spec.get('title'))}-{int(time.time() * 1000)}.json"
        target.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
        return target, spec
    if not path:
        raise ToolError('give "spec" (the JSON object) or "path" (a file)')
    p = Path(path).expanduser()
    if not p.is_file():
        raise ToolError(f"file not found: {p}")
    if p.suffix.lower() == ".json":
        try:
            return p, json.loads(p.read_text(encoding="utf-8"))
        except ValueError as exc:
            raise ToolError(f"{p} is not valid JSON: {exc}")
    return p, None


def run(script, argv, timeout=300):
    proc = subprocess.run([sys.executable, str(HERE / script)] + argv, capture_output=True, text=True, timeout=timeout,
                          stdin=subprocess.DEVNULL, env=dict(os.environ, PYTHONDONTWRITEBYTECODE="1"))
    return proc.returncode, (proc.stdout + ("\n" + proc.stderr if proc.stderr.strip() else "")).strip()


def output_for(args, source, suffix):
    if args.get("output"):
        out = Path(args["output"]).expanduser()
        out.parent.mkdir(parents=True, exist_ok=True)
        return out
    if source.parent == out_dir():
        return source.with_suffix(suffix)
    return source.with_name(source.stem + suffix) if source.suffix.lower() != suffix else source.with_name(source.stem + "-export" + suffix)


def symbol_catalog():
    src = (SKILL / "assets" / "js" / "symbols.js").read_text(encoding="utf-8")
    body = src[src.index("var SYMBOLS = {"):src.index("var SYMBOL_ALIAS")]
    aliases = {}
    for alias, name in SYMBOL_ALIASES.items():
        aliases.setdefault(name, []).append(alias)
    out = []
    for m in re.finditer(r"^  '?([a-z][a-z0-9-]*)'?: \{ cat: '(\w+)'", body, re.M):
        name = m.group(1)
        pins = [{"name": p[2], "dir": p[3], "x": p[0], "y": p[1]} for p in SYMBOL_PINS.get(name, [])]
        size = SYMBOL_SIZES.get(name)
        out.append({"name": name, "category": m.group(2), "size": list(size) if size else None, "pins": pins, "aliases": sorted(aliases.get(name, []))})
    return out


# ---------------------------------------------------------------------------- tools
def tool_guide(args):
    return ai_prompt()


def tool_validate(args):
    source, spec = load_input(args)
    if spec is None:
        raise ToolError("validate reads JSON specs; for a draw.io file call diagram_import_drawio first")
    errors, warnings = validate_spec(spec)
    lines = [f"ERROR: {e}" for e in errors] + [f"WARNING: {w}" for w in warnings]
    lines.append(f"{len(errors)} error(s), {len(warnings)} warning(s)." if errors else f"OK: no errors, {len(warnings)} warning(s).")
    return "\n".join(lines), {"errors": errors, "warnings": warnings}


def tool_build(args, editor=False):
    source, spec = load_input(args)
    out = output_for(args, source, ".html")
    argv = [str(source), "-o", str(out)]
    if args.get("force"):
        argv.append("--force")
    if editor:
        argv.append("--editor")
    code, text = run("build.py", argv)
    if code != 0:
        raise ToolError(text or "build failed")
    return text + f"\nFile: {out}\nOpen: {out.resolve().as_uri()}", {"path": str(out.resolve())}


def tool_open_editor(args):
    text, data = tool_build(args, editor=True)
    if args.get("open", True):
        try:
            opened = webbrowser.open(Path(data["path"]).as_uri())
        except webbrowser.Error:
            opened = False
        text += "\nOpened in the default browser." if opened else "\nCould not open a browser; open the file above by hand."
    return text, data


def tool_export(args):
    fmt = args.get("format")
    if fmt not in FORMATS:
        raise ToolError(f'format must be one of {", ".join(FORMATS)}')
    source, spec = load_input(args)
    ext = {"drawio": ".drawio", "svg": ".svg", "png": ".png", "mermaid": ".mmd", "csv": ".csv", "html": ".html", "spec": ".json", "library": ".xml"}[fmt]
    out = output_for(args, source, ext)
    argv = [str(source), "--format", fmt, "-o", str(out), "--theme", args.get("theme") or "light"]
    if args.get("diagram"):
        argv += ["--diagram", str(args["diagram"])]
    code, text = run("export.py", argv)
    if code != 0:
        raise ToolError(text or "export failed")
    result = text + f"\nFile: {out.resolve()}"
    if fmt in ("mermaid", "csv") and out.exists() and out.stat().st_size < 60000:
        result += "\n\n" + out.read_text(encoding="utf-8")
    return result, {"path": str(out.resolve())}


def tool_import_drawio(args):
    p = Path(str(args.get("path", ""))).expanduser()
    if not p.is_file():
        raise ToolError(f"file not found: {p}")
    if p.suffix.lower() not in DRAWIO_SUFFIXES:
        raise ToolError("expected a .drawio, .xml, .svg or .dio file saved by draw.io")
    out = out_dir() / f"{slug(p.stem)}-{int(time.time() * 1000)}.json"
    argv = [str(p), "--format", "spec", "-o", str(out)]
    if args.get("lang"):
        argv += ["--lang", args["lang"]]
    code, text = run("export.py", argv)
    if code != 0 or not out.exists():
        raise ToolError(text or "import failed")
    body = out.read_text(encoding="utf-8")
    limit = int(args.get("max_chars") or 120000)
    spec = json.loads(body)
    counts = [f'{d.get("id")}: {len(d.get("nodes") or [])} shapes, {len(d.get("edges") or [])} connections' for d in spec.get("diagrams", [])]
    head = f"Imported {p.name} into {out} ({len(body) // 1024} KB).\nPages: " + "; ".join(counts)
    if len(body) <= limit:
        return head + "\n\n" + body, {"path": str(out)}
    return head + f"\nThe spec is larger than {limit} characters, so it is only in the file above.", {"path": str(out)}


def tool_scan_code(args):
    root = Path(str(args.get("path", ""))).expanduser()
    if not root.is_dir():
        raise ToolError(f"folder not found: {root}")
    out = out_dir() / f"{slug(root.name)}-architecture-{int(time.time() * 1000)}.json"
    argv = [str(root), "-o", str(out), "--lang", args.get("lang") or "en"]
    if args.get("title"):
        argv += ["--title", str(args["title"])]
    if args.get("max_nodes"):
        argv += ["--max-nodes", str(int(args["max_nodes"]))]
    if args.get("details") is not None:
        argv += ["--details", str(int(args["details"]))]
    if args.get("include_tests"):
        argv.append("--include-tests")
    code, text = run("scan_code.py", argv, timeout=600)
    if code != 0 or not out.exists():
        raise ToolError(text or "scan failed")
    body = out.read_text(encoding="utf-8")
    return text + f"\nSpec: {out}\n\n" + body, {"path": str(out)}


def tool_symbols(args):
    q = str(args.get("query") or "").lower().strip()
    cat = str(args.get("category") or "").lower().strip()
    rows = [s for s in symbol_catalog() if (not cat or s["category"] == cat) and
            (not q or q in s["name"] or any(q in a for a in s["aliases"]))]
    lines = []
    for s in rows:
        pins = ", ".join(f'{p["name"]}({p["dir"]})@[{p["x"]:g}, {p["y"]:g}]' for p in s["pins"]) or "no pins"
        lines.append(f'{s["name"]} [{s["category"]}]: {pins}' + (f' (also: {", ".join(s["aliases"])})' if s["aliases"] else ""))
    return "\n".join(lines) or "No symbol matches.", {"symbols": rows}


def tool_patterns(args):
    rows = assist.pattern_list(args.get("lang") or "en")
    lines = []
    for p in rows:
        wires = []
        if p["inputs"]:
            wires.append("input " + " + ".join(p["inputs"][0]))
        if p["outputs"]:
            wires.append("output " + p["outputs"][0])
        if p["clocks"]:
            wires.append("clock " + " + ".join(p["clocks"][0]))
        if p.get("entry"):
            wires.append("a selected block feeds " + p["entry"])
        lines.append(f'{p["id"]} [{p["category"]}] {p["title"]}: {p["description"]}' + (f' ({"; ".join(wires)})' if wires else ""))
    return "\n".join(lines), {"patterns": rows}


def edited(args, source, result):
    """Writes the changed spec and returns the report, with the spec inline while it is small."""
    if args.get("output"):
        out = Path(args["output"]).expanduser()
        out.parent.mkdir(parents=True, exist_ok=True)
    elif source.parent == out_dir():
        out = source
    else:
        out = source.with_name(source.stem + "-edited.json")
    body = json.dumps(result["spec"], ensure_ascii=False, indent=2)
    out.write_text(body, encoding="utf-8")
    text = assist.describe(result) + f"\nSpec: {out}"
    if len(body) <= 60000:
        text += "\n\n" + body
    return text, {"path": str(out.resolve()), "checks": result.get("checks", []), "added": result.get("added", [])}


def assist_input(args):
    source, spec = load_input(args)
    if spec is None:
        raise ToolError("this tool reads JSON specs; for a draw.io file call diagram_import_drawio first")
    return source, spec


def tool_insert_pattern(args):
    source, spec = assist_input(args)
    try:
        result = assist.insert_pattern(spec, str(args.get("pattern") or ""), args.get("near"), args.get("diagram"), args.get("clock"))
    except assist.AssistError as exc:
        raise ToolError(str(exc))
    return edited(args, source, result)


def tool_apply_ops(args):
    source, spec = assist_input(args)
    ops = args.get("ops")
    if isinstance(ops, str):
        try:
            ops = json.loads(ops)
        except ValueError as exc:
            raise ToolError(f"ops is not valid JSON: {exc}")
    try:
        result = assist.apply_ops(spec, ops, args.get("diagram"))
    except assist.AssistError as exc:
        raise ToolError(str(exc))
    return edited(args, source, result)


def tool_suggest(args):
    source, spec = assist_input(args)
    try:
        result = assist.suggest(spec, args.get("node"), args.get("diagram"))
    except assist.AssistError as exc:
        raise ToolError(str(exc))
    return assist.describe(result), {"checks": result.get("checks", []), "nextSteps": result.get("nextSteps", []), "suggestions": result.get("suggestions", []),
                                     "truncated": bool(result.get("truncated"))}


HANDLERS = {"diagram_guide": tool_guide, "diagram_validate": tool_validate, "diagram_build": tool_build,
            "diagram_open_editor": tool_open_editor, "diagram_export": tool_export, "diagram_import_drawio": tool_import_drawio,
            "diagram_scan_code": tool_scan_code, "diagram_symbols": tool_symbols, "diagram_patterns": tool_patterns,
            "diagram_insert_pattern": tool_insert_pattern, "diagram_apply_ops": tool_apply_ops, "diagram_suggest": tool_suggest}


def read_resource(uri):
    if uri == "architecture-diagrams://guide":
        return "text/markdown", ai_prompt()
    if uri == "architecture-diagrams://spec-reference":
        return "text/markdown", (SKILL / "references" / "spec.md").read_text(encoding="utf-8")
    if uri == "architecture-diagrams://symbols":
        return "application/json", json.dumps(symbol_catalog(), indent=1)
    raise ToolError(f"unknown resource {uri}")


# ---------------------------------------------------------------------------- JSON-RPC over stdio
def reply(msg_id, result=None, error=None):
    msg = {"jsonrpc": "2.0", "id": msg_id}
    if error is not None:
        msg["error"] = error
    else:
        msg["result"] = result
    sys.stdout.write(json.dumps(msg, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def handle(msg):
    method, params, msg_id = msg.get("method"), msg.get("params") or {}, msg.get("id")
    if msg_id is None:
        return  # notifications (initialized, cancelled) need no answer
    if method == "initialize":
        asked = params.get("protocolVersion")
        STATE["protocol"] = asked if asked in PROTOCOLS else PROTOCOLS[0]
        reply(msg_id, {"protocolVersion": STATE["protocol"],
                       "capabilities": {"tools": {"listChanged": False}, "resources": {"listChanged": False}},
                       "serverInfo": {"name": "architecture-diagrams", "version": VERSION},
                       "instructions": INSTRUCTIONS})
    elif method == "ping":
        reply(msg_id, {})
    elif method == "tools/list":
        reply(msg_id, {"tools": TOOLS})
    elif method == "tools/call":
        name, args = params.get("name"), params.get("arguments") or {}
        fn = HANDLERS.get(name)
        if not fn:
            reply(msg_id, error={"code": -32602, "message": f"unknown tool {name}"})
            return
        try:
            out = fn(args)
            text, data = out if isinstance(out, tuple) else (out, None)
            result = {"content": [{"type": "text", "text": text}], "isError": False}
            if data is not None and STATE["protocol"] >= "2025-06-18":
                result["structuredContent"] = data
            reply(msg_id, result)
        except ToolError as exc:
            reply(msg_id, {"content": [{"type": "text", "text": f"ERROR: {exc}"}], "isError": True})
        except subprocess.TimeoutExpired:
            reply(msg_id, {"content": [{"type": "text", "text": "ERROR: the tool took too long and was stopped."}], "isError": True})
        except Exception as exc:  # report, keep serving
            traceback.print_exc(file=sys.stderr)
            reply(msg_id, {"content": [{"type": "text", "text": f"ERROR: {type(exc).__name__}: {exc}"}], "isError": True})
    elif method == "resources/list":
        reply(msg_id, {"resources": RESOURCES})
    elif method == "resources/read":
        try:
            mime, text = read_resource(params.get("uri"))
            reply(msg_id, {"contents": [{"uri": params.get("uri"), "mimeType": mime, "text": text}]})
        except ToolError as exc:
            reply(msg_id, error={"code": -32002, "message": str(exc)})
    elif method in ("prompts/list",):
        reply(msg_id, {"prompts": []})
    else:
        reply(msg_id, error={"code": -32601, "message": f"method not found: {method}"})


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except ValueError:
            reply(None, error={"code": -32700, "message": "parse error"})
            continue
        for item in msg if isinstance(msg, list) else [msg]:
            if isinstance(item, dict):
                handle(item)
    return 0


if __name__ == "__main__":
    sys.exit(main())
