#!/usr/bin/env python3
"""Build one self-contained, interactive HTML diagram page from a JSON spec.

Usage:
    python3 build.py spec.json [-o diagram.html] [--cdn] [--force] [--editor]

The spec is validated first (see validate.py). The page embeds everything it needs,
including the dagre layout library (assets/vendor/dagre.min.js, MIT License), so it
works offline, on air-gapped machines too. --cdn loads dagre from a CDN instead for
a smaller file. A draw.io file (.drawio, .xml, .svg) can be given in place of a spec.
Standard library only, Python 3.8+.
"""

import argparse
import base64
import html
import json
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET
import zlib
from pathlib import Path

sys.dont_write_bytecode = True  # keep the skill folder free of __pycache__
sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate import validate_spec  # noqa: E402

SKILL_DIR = Path(__file__).resolve().parent.parent
TEMPLATE = SKILL_DIR / "assets" / "template.html"
JS_DIR = SKILL_DIR / "assets" / "js"
JS_ORDER = ("renderer.js", "icons.js", "symbols.js", "stencils.js", "drawio.js", "editor.js", "assist.js", "hier.js", "ai.js", "boot.js")
PATTERNS_FILE = SKILL_DIR / "assets" / "patterns.json"
STENCIL_DIR = SKILL_DIR / "assets" / "stencils"
VENDORED_DAGRE = SKILL_DIR / "assets" / "vendor" / "dagre.min.js"
CDN_URLS = (
    "https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js",
)

CDN_LOADER = """<script>
(function () {
  var urls = %s;
  var i = 0;
  function done(state) { window.__adDagre = state; if (window.__adBoot) window.__adBoot(); }
  function next() {
    if (i >= urls.length) { done("failed"); return; }
    var s = document.createElement("script");
    s.src = urls[i++];
    s.onload = function () { done(window.dagre ? "ready" : "failed"); };
    s.onerror = next;
    document.head.appendChild(s);
  }
  next();
})();
</script>""" % json.dumps(list(CDN_URLS))


def dagre_block(path):
    if path is None:
        return CDN_LOADER
    source = Path(path).read_text(encoding="utf-8").replace("</script", "<\\/script")
    return (
        "<script>\n/* dagre (MIT License, https://github.com/dagrejs/dagre), embedded for offline use */\n"
        + source
        + '\n</script>\n<script>window.__adDagre = window.dagre ? "ready" : "failed";</script>'
    )


def stencil_pack():
    """draw.io stencil libraries (Apache 2.0) as base64(deflate-raw(JSON {name: shape xml})).

    The page inflates this with DecompressionStream only when a diagram uses an mxgraph.* shape."""
    table = {}
    for path in sorted(STENCIL_DIR.glob("*.xml")):
        root = ET.parse(path).getroot()
        package = (root.get("name") or "").lower()
        for shape in root:
            if shape.tag == "shape" and shape.get("name"):
                key = package + "." + shape.get("name").replace(" ", "_").lower()
                table[key] = ET.tostring(shape, encoding="unicode")
    if not table:
        return ""
    raw = json.dumps(table, separators=(",", ":")).encode("utf-8")
    raw = urllib.parse.quote(raw.decode("utf-8"), safe="").encode("ascii")
    packer = zlib.compressobj(9, zlib.DEFLATED, -15)
    return base64.b64encode(packer.compress(raw) + packer.flush()).decode("ascii")


def ai_prompt():
    """The prompt behind the editor's "Copy prompt for AI" button: the spec format plus every symbol with its pins."""
    path = SKILL_DIR / "assets" / "ai-prompt.md"
    if not path.exists():
        return ""
    src = (JS_DIR / "symbols.js").read_text(encoding="utf-8")
    body = src[src.index("var SYMBOLS = {"):src.index("var SYMBOL_ALIAS")]
    lines, plain = [], []
    for m in re.finditer(r"^  '?([a-z][a-z0-9-]*)'?: \{ cat: '(\w+)'(.*)$", body, re.M):
        name, rest = m.group(1), m.group(3)
        pins = re.search(r"pins: (\[\[.*?\]\])", rest)
        if not pins:
            plain.append(name)
            continue
        cells = json.loads(pins.group(1).replace("'", '"'))
        lines.append("- " + name + ": " + ", ".join("%s(%s)@[%g, %g]" % (c[2], c[3], c[0], c[1]) for c in cells))
    text = path.read_text(encoding="utf-8")
    return text.replace("{{SYMBOLS}}", "\n".join(lines)).replace("{{PLAIN}}", ", ".join(plain))


def patterns():
    """The ready-made patterns (assets/patterns.json) behind the editor's Patterns list and diagram_insert_pattern."""
    if not PATTERNS_FILE.exists():
        return {"patterns": []}
    data = json.loads(PATTERNS_FILE.read_text(encoding="utf-8"))
    data.pop("about", None)
    return data


def js_bundle():
    """The page script: every module is concatenated into one closure, boot.js last."""
    parts = ["var STENCIL_PACK = %s;" % json.dumps(stencil_pack()), "var AI_PROMPT = %s;" % json.dumps(ai_prompt()),
             "var PATTERNS = %s;" % json.dumps(patterns(), ensure_ascii=False, separators=(",", ":"))]
    for name in JS_ORDER:
        path = JS_DIR / name
        if path.exists():
            parts.append(f"/* ---- {name} ---- */\n" + path.read_text(encoding="utf-8"))
    return "\n".join(parts).replace("</script", "<\\/script")


def render_page(spec, dagre_path=None):
    """Return the full HTML page for a spec (also used by export.py)."""
    lang = spec.get("lang") if spec.get("lang") in ("en", "vi") else "en"
    replacements = {
        "LANG": lang,
        "TITLE": html.escape(str(spec.get("title") or "Diagram")),
        "DAGRE": dagre_block(dagre_path),
        "SPEC": embed_json(spec),
        "JS": js_bundle(),
    }
    template = TEMPLATE.read_text(encoding="utf-8")
    return re.sub(r"@@(LANG|TITLE|DAGRE|SPEC|JS)@@", lambda m: replacements[m.group(1)], template)


def embed_json(spec):
    # "<" is escaped so the data can never close the surrounding <script> tag.
    return json.dumps(spec, ensure_ascii=False, indent=2).replace("<", "\\u003c")


def drawio_spec(text, name, lang=None):
    """A page spec that converts a draw.io file when the page opens (see assets/js/drawio.js)."""
    if "mxfile" not in text and "mxGraphModel" not in text:
        raise ValueError("this file does not contain a draw.io diagram")
    if not lang:
        lang = "vi" if re.search(r"[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]", text, re.I) else "en"
    return {"title": re.sub(r"\.(drawio|xml|svg|dio)$", "", name, flags=re.I), "lang": lang, "drawio": text, "name": name}


def count(spec):
    diagrams = spec["diagrams"] if isinstance(spec.get("diagrams"), list) else [spec]
    nodes = sum(len(d.get("nodes") or []) for d in diagrams if isinstance(d, dict))
    edges = sum(len(d.get("edges") or []) for d in diagrams if isinstance(d, dict))
    return len(diagrams), nodes, edges


def main():
    ap = argparse.ArgumentParser(description="Build an interactive HTML diagram from a JSON spec or a draw.io file.")
    ap.add_argument("spec", nargs="?", help="path to the JSON spec, or a .drawio / .xml / .svg file saved by draw.io")
    ap.add_argument("--lang", choices=("en", "vi"), help="page language for a draw.io file (default: guessed from its text)")
    ap.add_argument("-o", "--output", help="output HTML path (default: next to the spec, .html)")
    ap.add_argument("--dagre", help="another dagre.min.js to embed (default: assets/vendor/dagre.min.js)")
    ap.add_argument("--cdn", action="store_true", help="load the layout library from a CDN instead of embedding it (smaller page, needs internet)")
    ap.add_argument("--force", action="store_true", help="build even if validation finds errors")
    ap.add_argument("--editor", action="store_true", help="make an editor page that opens with the tables and drag-and-drop editing; the spec (optional) is its starting diagram")
    ap.add_argument("--prompt", action="store_true", help="print the prompt for chat AIs (spec format, symbols with pins, wiring rules) and exit")
    args = ap.parse_args()
    if args.prompt:
        sys.stdout.write(ai_prompt())
        return 0
    if not args.spec and not args.editor:
        ap.error("give a spec file, or --editor to make an empty editor page")
    if args.editor and not args.spec:
        out = Path(args.output or "editor.html")
        dagre_path = None if args.cdn else args.dagre or (str(VENDORED_DAGRE) if VENDORED_DAGRE.exists() else None)
        out.write_text(render_page({"editor": True, "lang": args.lang or "vi", "title": "Architecture diagrams"}, dagre_path), encoding="utf-8")
        print(f"Built the editor page {out} ({out.stat().st_size // 1024} KB).")
        return 0

    spec_path = Path(args.spec)
    try:
        text = spec_path.read_text(encoding="utf-8")
        if spec_path.suffix.lower() in (".drawio", ".xml", ".svg", ".dio"):
            spec = drawio_spec(text, spec_path.name, args.lang)
        else:
            spec = json.loads(text)
    except (OSError, ValueError) as exc:
        print(f"ERROR: cannot read {spec_path}: {exc}")
        return 2

    errors, warnings = validate_spec(spec) if "drawio" not in spec else ([], [])
    if args.editor:
        spec = {"editor": True, "lang": spec.get("lang") or args.lang or "vi", "title": spec.get("title") or "Architecture diagrams", "example": spec}
    for w in warnings:
        print(f"WARNING: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    if errors and not args.force:
        print(f"Not built: fix the {len(errors)} error(s) above, or pass --force.")
        return 1

    dagre_path = None if args.cdn else args.dagre or (str(VENDORED_DAGRE) if VENDORED_DAGRE.exists() else None)
    if dagre_path and not Path(dagre_path).exists():
        print(f"ERROR: dagre file not found: {dagre_path}")
        return 2

    page = render_page(spec, dagre_path)

    out = Path(args.output) if args.output else spec_path.with_suffix(".html")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")

    if "drawio" in spec:
        print(f"Built {out} ({out.stat().st_size // 1024} KB) from the draw.io file {spec_path.name}; it is converted when the page opens.")
        return 0
    n_diagrams, n_nodes, n_edges = count(spec)
    source = "embedded (works offline)" if dagre_path else "loaded from a CDN when the page opens"
    print(
        f"Built {out} ({out.stat().st_size // 1024} KB): {n_diagrams} diagram(s), "
        f"{n_nodes} nodes, {n_edges} edges. Layout library: {source}."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
