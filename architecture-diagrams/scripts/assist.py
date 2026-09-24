#!/usr/bin/env python3
"""Patterns, quick fixes and suggestions from the command line, the same ones the editor offers.

Usage:
    python3 assist.py --patterns                                    list the ready-made patterns
    python3 assist.py SPEC --pattern sync2 [--near ff1] [-o OUT]    insert a pattern (wired to block ff1)
    python3 assist.py SPEC --suggest [--node ff1]                   problems with their fixes, and suggestions
    python3 assist.py SPEC --ops ops.json [-o OUT]                  apply editing operations
    add --diagram ID to pick a tab (default: the first block-diagram tab)

SPEC is a JSON spec. Operations (the "ops" format, see references/spec.md):
    {"ops": [{"op": "addNode", "node": {"id": "sync3", "shape": "dff"}, "near": "ff2"},
             {"op": "connect", "from": "ff2.Q", "to": "sync3.D"},
             {"op": "updateNode", "id": "ff2", "set": {"title": "capture"}}, {"op": "removeNode", "id": "buf1"},
             {"op": "disconnect", "from": "ff1.Q", "to": "buf1.A"}, {"op": "reverseEdge", "edge": 3}]}
Nothing changes when one operation fails. The work runs in the page's own code (assets/js/assist.js) inside a
headless Chrome, Chromium, Edge or Brave, so the result matches the editor exactly. Standard library only.
"""

import argparse
import json
import re
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build import VENDORED_DAGRE, patterns, render_page  # noqa: E402
from render_png import find_browser, run_browser  # noqa: E402


class AssistError(Exception):
    pass


def pattern_list(lang="en"):
    """The patterns with their title, description and the pins the tool wires to a selected block."""
    rows = []
    for p in patterns().get("patterns", []):
        text = lambda v: v.get(lang, v.get("en", "")) if isinstance(v, dict) else (v or "")
        rows.append({"id": p["id"], "category": p.get("cat"), "title": text(p.get("title")), "description": text(p.get("desc")),
                     "wiredByPin": bool(p.get("pins")), "blocks": [n["id"] for n in p.get("nodes", [])],
                     "inputs": [net.get("pins", []) for net in p.get("inputs", [])], "outputs": p.get("outputs", []),
                     "clocks": [c.get("pins", []) for c in p.get("clocks", [])], "entry": (p.get("entry") or {}).get("node"),
                     "outputLabels": [o["text"] for o in p.get("outLabels", [])], "typical": bool(p.get("top"))})
    return rows


def run(spec, command, timeout=180):
    """Runs one command in the page (see runCliAssist in assist.js) and returns its result as a dict."""
    if not isinstance(spec, dict):
        raise AssistError("the spec must be a JSON object")
    browser = find_browser()
    if not browser:
        raise AssistError("no Chrome, Chromium, Edge or Brave found; this needs one of them")
    dagre = str(VENDORED_DAGRE) if VENDORED_DAGRE.exists() else None
    page = render_page(spec, dagre)
    cmd = json.dumps(command, ensure_ascii=False).replace("<", "\\u003c")
    # the command must be in the page before the page script runs, so it goes in front of the spec
    tag = '<script type="application/json" id="diagram-spec">'
    page = page.replace(tag, f'<script type="application/json" id="assist-cmd">{cmd}</script>\n' + tag, 1)
    with tempfile.TemporaryDirectory() as tmp:
        html = Path(tmp) / "page.html"
        html.write_text(page, encoding="utf-8")
        with tempfile.TemporaryDirectory() as profile:
            dom = run_browser(browser, profile, 1400, 900, 1, html.as_uri() + "?theme=light&assist=1", timeout=timeout, budget=30000)
    match = re.search(r'data-export="([^"]*)"', dom or "")
    if not match:
        raise AssistError("the page did not finish (is the spec valid? try build.py first)")
    payload = match.group(1).replace("&amp;", "&").replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">")
    if payload.startswith("error:"):
        raise AssistError(unquote(payload[6:]))
    result = json.loads(unquote(payload))
    if result.get("error"):
        raise AssistError(result["error"])
    return result


def insert_pattern(spec, pattern, near=None, diagram=None, clock=None):
    return run(spec, {"action": "insertPattern", "pattern": pattern, "near": near, "diagram": diagram, "clock": clock})


def apply_ops(spec, ops, diagram=None):
    if isinstance(ops, dict):
        ops = ops.get("ops")
    if not isinstance(ops, list):
        raise AssistError('ops must be a list of operations, or {"ops": [...]}')
    return run(spec, {"action": "applyOps", "ops": ops, "diagram": diagram})


def suggest(spec, node=None, diagram=None):
    return run(spec, {"action": "suggest", "node": node, "diagram": diagram})


def describe(result):
    """A short text report: what changed, what is left in Checks (with its fixes), the suggestions."""
    lines = []
    if result.get("added"):
        lines.append("Added blocks: " + ", ".join(result["added"]))
    for note in result.get("notes") or []:
        lines.append("Note: " + note)
    checks = result.get("checks") or []
    lines.append(f"Checks on tab {result.get('tab')}: " + (f"{len(checks)} problem(s)" if checks else "no problems"))
    for c in checks:
        lines.append("- " + c["text"])
        for f in c.get("fixes", []):
            lines.append(f"    fix{' (safe)' if f.get('safe') else ''}: {f['label']} -> " + json.dumps(f["ops"], ensure_ascii=False))
    how_of = lambda s: (f'diagram_insert_pattern pattern={s["pattern"]} near={s["node"]}' + (f' clock={s["clock"]}' if s.get("clock") else "")) if s.get("pattern") else json.dumps(s.get("ops"), ensure_ascii=False)
    for s in result.get("nextSteps") or []:
        lines.append(f'Next step: {s["label"]} -> {how_of(s)}')
    for s in result.get("suggestions") or []:
        how = (f'diagram_insert_pattern pattern={s["pattern"]} near={s["node"]}' + (f' clock={s["clock"]}' if s.get("clock") else "")) if s.get("pattern") else json.dumps(s.get("ops"), ensure_ascii=False)
        lines.append(f'Suggestion for {s["node"]}: {s["label"]} -> {how}')
    if result.get("truncated"):
        lines.append(f'(Only the first {len(result.get("suggestions") or [])} suggestions; ask for one block with node to see all of its own.)')
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description="Insert patterns, apply editing operations and list fixes and suggestions for a diagram spec.")
    ap.add_argument("spec", nargs="?", help="JSON spec")
    ap.add_argument("--patterns", action="store_true", help="list the ready-made patterns and exit")
    ap.add_argument("--pattern", help="insert this pattern (see --patterns)")
    ap.add_argument("--near", help="block to put the pattern next to and wire it to")
    ap.add_argument("--clock", help="clock source for the pattern's clock pins (for a synchronizer: the clock of the destination domain)")
    ap.add_argument("--ops", help="JSON file with operations to apply")
    ap.add_argument("--suggest", action="store_true", help="list the problems with their fixes, and suggestions")
    ap.add_argument("--node", help="with --suggest: only suggestions for this block")
    ap.add_argument("--diagram", help="tab id (default: the first block-diagram tab)")
    ap.add_argument("--lang", choices=("en", "vi"), default="en", help="language of --patterns")
    ap.add_argument("-o", "--output", help="where to write the changed spec (default: next to SPEC, -edited.json)")
    args = ap.parse_args()
    if args.patterns:
        for p in pattern_list(args.lang):
            print(f'{p["id"]:10} [{p["category"]}] {p["title"]}: {p["description"]}')
        return 0
    if not args.spec or not (args.pattern or args.ops or args.suggest):
        ap.error("give a spec and one of --pattern, --ops or --suggest (or --patterns alone)")
    src = Path(args.spec)
    try:
        spec = json.loads(src.read_text(encoding="utf-8"))
        if args.pattern:
            result = insert_pattern(spec, args.pattern, args.near, args.diagram, args.clock)
        elif args.ops:
            result = apply_ops(spec, json.loads(Path(args.ops).read_text(encoding="utf-8")), args.diagram)
        else:
            result = suggest(spec, args.node, args.diagram)
    except (OSError, ValueError, AssistError) as exc:
        print(f"ERROR: {exc}")
        return 1
    if result.get("spec") is not None:
        out = Path(args.output) if args.output else src.with_name(src.stem + "-edited.json")
        out.write_text(json.dumps(result["spec"], ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {out}.")
    print(describe(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
