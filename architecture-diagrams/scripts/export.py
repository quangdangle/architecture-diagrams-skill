#!/usr/bin/env python3
"""Convert a diagram without opening a browser window.

Usage:
    python3 export.py INPUT [--format FORMAT] [--diagram ID] [-o OUTPUT] [--theme light|dark] [--lang en|vi]

INPUT is a JSON spec, a page built by build.py, or a draw.io file (.drawio, .xml, .svg, or a .png saved with the diagram inside).
FORMAT is one of:
    drawio   editable draw.io file (every tab becomes a page)       [default]
    svg      vector image of one tab (--diagram picks the tab)
    png      picture of one tab, twice the screen resolution
    mermaid  Mermaid text of one block-diagram tab
    csv      table of a register, address-map or pinout tab
    html     interactive page (same as build.py; handy for .drawio files)
    spec     the JSON spec (turns a draw.io file into data an AI or the editor can change)
    library  draw.io shape library with this skill's symbols (File > Open Library in draw.io)

Needs Chrome, Chromium, Edge or Brave (the same lookup as render_png.py). Standard library only.
"""

import argparse
import base64
import json
import re
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build import DRAWIO_SUFFIXES, VENDORED_DAGRE, drawio_spec, read_drawio_text, render_page  # noqa: E402
from render_png import find_browser, run_browser  # noqa: E402

EXT = {"drawio": ".drawio", "svg": ".svg", "png": ".png", "mermaid": ".mmd", "csv": ".csv", "html": ".html", "spec": ".json", "library": ".xml"}


def load_page(path, lang):
    """Return the HTML text of a page for any supported input."""
    suffix = path.suffix.lower()
    dagre = str(VENDORED_DAGRE) if VENDORED_DAGRE.exists() else None
    if suffix in DRAWIO_SUFFIXES:
        return render_page(drawio_spec(read_drawio_text(path), path.name, lang), dagre)
    text = path.read_text(encoding="utf-8")
    if suffix in (".html", ".htm"):
        return text
    return render_page(json.loads(text), dagre)


def main():
    ap = argparse.ArgumentParser(description="Export a diagram to draw.io, SVG, PNG, Mermaid, CSV, HTML or JSON.")
    ap.add_argument("input", help="JSON spec, built .html page, or draw.io file")
    ap.add_argument("--format", "-f", default="drawio", choices=sorted(EXT))
    ap.add_argument("--diagram", help="tab id for svg, png, mermaid and csv (default: the first tab)")
    ap.add_argument("-o", "--output", help="output path (default: next to the input)")
    ap.add_argument("--theme", choices=("light", "dark"), default="light")
    ap.add_argument("--lang", choices=("en", "vi"), help="page language when the input is a draw.io file")
    args = ap.parse_args()

    src = Path(args.input)
    try:
        page = load_page(src, args.lang)
    except (OSError, ValueError) as exc:
        print(f"ERROR: cannot read {src}: {exc}")
        return 2
    out = Path(args.output) if args.output else src.with_name(src.stem + ("-export" if src.suffix.lower() == EXT[args.format] else "") + EXT[args.format])
    if args.format == "html":
        out.write_text(page, encoding="utf-8")
        print(f"Wrote {out} ({out.stat().st_size // 1024} KB).")
        return 0

    browser = find_browser()
    if not browser:
        print("ERROR: no Chrome, Chromium, Edge or Brave found; export needs one of them.")
        return 2
    with tempfile.TemporaryDirectory() as tmp:
        html = Path(tmp) / "page.html"
        html.write_text(page, encoding="utf-8")
        query = f"?theme={args.theme}&export={args.format}" + (f"&diagram={args.diagram}" if args.diagram else "")
        with tempfile.TemporaryDirectory() as profile:
            dom = run_browser(browser, profile, 1400, 900, 1, html.as_uri() + query, timeout=180, budget=30000)
    match = re.search(r'data-export="([^"]*)"', dom or "")
    if not match:
        print("ERROR: the page did not finish exporting (is the input valid? try build.py first).")
        return 1
    payload = match.group(1).replace("&amp;", "&").replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">")
    if payload.startswith("error:"):
        print("ERROR: " + unquote(payload[6:]))
        return 1
    if args.format == "png":
        data = payload.split(",", 1)[1] if payload.startswith("data:") else payload
        out.write_bytes(base64.b64decode(data))
    else:
        out.write_text(unquote(payload), encoding="utf-8")
    print(f"Wrote {out} ({max(1, out.stat().st_size // 1024)} KB, {args.format}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
