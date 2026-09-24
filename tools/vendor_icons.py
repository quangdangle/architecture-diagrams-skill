#!/usr/bin/env python3
"""Maintainer tool: refresh assets/js/icons.js from the Lucide icon set (ISC License).

Downloads the chosen icons at a pinned Lucide commit, converts every SVG element into one
absolute path (M, L, C, Q, A, Z only) and writes a small JS table the renderer can scale.
Not needed to use the skill. Run: python3 tools/vendor_icons.py
"""

import json
import math
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

LUCIDE_COMMIT = "f53e5bfff0f909f3f451933538744330650d3ce0"
BASE = f"https://raw.githubusercontent.com/lucide-icons/lucide/{LUCIDE_COMMIT}"
OUT = Path(__file__).resolve().parent.parent / "architecture-diagrams" / "assets" / "js" / "icons.js"

# name in our specs -> Lucide file name (grouped for the editor palette)
ICONS = {
    "infra": {
        "server": "server", "database": "database", "hard-drive": "hard-drive", "cpu": "cpu", "chip": "microchip",
        "memory": "memory-stick", "circuit-board": "circuit-board", "network": "network", "router": "router", "wifi": "wifi",
        "cloud": "cloud", "cloud-upload": "cloud-upload", "cloud-download": "cloud-download", "container": "container",
        "box": "box", "boxes": "boxes", "package": "package", "layers": "layers", "plug": "plug", "cable": "cable",
        "usb": "usb", "bluetooth": "bluetooth", "antenna": "antenna", "radio-tower": "radio-tower", "satellite": "satellite-dish",
        "monitor": "monitor", "laptop": "laptop", "smartphone": "smartphone", "tablet": "tablet", "printer": "printer",
        "keyboard": "keyboard", "globe": "globe", "zap": "zap", "battery": "battery", "power": "power", "gauge": "gauge",
        "activity": "activity", "thermometer": "thermometer", "waves": "audio-waveform", "binary": "binary",
    },
    "software": {
        "code": "code-xml", "braces": "braces", "terminal": "square-terminal", "file": "file", "file-text": "file-text",
        "file-code": "file-code", "files": "files", "folder": "folder", "folder-open": "folder-open", "git-branch": "git-branch",
        "git-commit": "git-commit-horizontal", "git-merge": "git-merge", "git-pull-request": "git-pull-request", "bug": "bug",
        "puzzle": "puzzle", "blocks": "blocks", "workflow": "workflow", "settings": "settings", "cog": "cog", "wrench": "wrench",
        "hammer": "hammer", "rocket": "rocket", "webhook": "webhook", "app-window": "app-window", "layout-dashboard": "layout-dashboard",
        "table": "table", "list": "list", "list-checks": "list-checks", "kanban": "kanban", "search": "search", "filter": "funnel",
        "chart-bar": "chart-column", "chart-line": "chart-line", "chart-pie": "chart-pie", "trending-up": "trending-up",
        "refresh": "refresh-cw", "repeat": "repeat", "shuffle": "shuffle", "split": "split", "merge": "merge", "link": "link",
        "share": "share-2", "download": "download", "upload": "upload", "save": "save", "trash": "trash", "archive": "archive",
        "clipboard": "clipboard", "inbox": "inbox", "send": "send", "calendar": "calendar", "clock": "clock", "timer": "timer",
        "bell": "bell", "hash": "hash", "variable": "variable", "function": "square-function", "sigma": "sigma",
    },
    "people": {
        "user": "user", "users": "users", "user-cog": "user-cog", "bot": "bot", "brain": "brain", "sparkles": "sparkles",
        "message": "message-square", "messages": "messages-square", "mail": "mail", "phone": "phone", "headphones": "headphones",
        "mic": "mic", "camera": "camera", "video": "video", "image": "image", "film": "film", "book": "book-open",
        "graduation-cap": "graduation-cap", "lightbulb": "lightbulb", "flask": "flask-conical", "id-card": "id-card",
        "log-in": "log-in", "log-out": "log-out", "eye": "eye", "house": "house", "building": "building", "factory": "factory",
        "warehouse": "warehouse", "truck": "truck", "store": "store", "shopping-cart": "shopping-cart", "map-pin": "map-pin",
    },
    "security": {
        "lock": "lock", "unlock": "lock-open", "key": "key-round", "shield": "shield", "shield-check": "shield-check",
        "fingerprint": "fingerprint-pattern", "scan": "scan-line", "qr-code": "qr-code", "credit-card": "credit-card",
        "wallet": "wallet", "dollar": "dollar-sign", "coins": "coins", "landmark": "landmark", "scale": "scale", "receipt": "receipt",
    },
    "status": {
        "check": "check", "check-circle": "circle-check", "x": "x", "x-circle": "circle-x", "alert": "triangle-alert",
        "info": "info", "help": "circle-question-mark", "play": "play", "pause": "pause", "stop": "square", "flag": "flag",
        "star": "star", "heart": "heart", "target": "target", "trophy": "trophy", "award": "award", "milestone": "milestone",
        "arrow-right": "arrow-right", "arrow-left-right": "arrow-left-right", "arrow-up-down": "arrow-up-down",
    },
}


def fetch(path):
    with urllib.request.urlopen(f"{BASE}/{path}", timeout=30) as r:
        return r.read().decode("utf-8")


def num(v):
    s = f"{v:.3f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


TOKEN = re.compile(r"[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")


def path_to_abs(d):
    """Convert an SVG path to absolute M/L/C/Q/A/Z commands."""
    toks = TOKEN.findall(d)
    out, i, cmd = [], 0, None
    x = y = sx = sy = 0.0
    last_c = last_q = None

    def nums(n):
        nonlocal i
        vals = [float(t) for t in toks[i:i + n]]
        i += n
        return vals

    def flag():
        # arc flags may be written without separators ("a1 1 0 011 1"), so read one character
        nonlocal i
        t = toks[i]
        if len(t) > 1 and t[0] in "01" and not t.startswith("0."):
            toks[i] = t[1:]
            return float(t[0])
        i += 1
        return float(t)

    while i < len(toks):
        t = toks[i]
        if re.match(r"[A-Za-z]", t):
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append("Z")
                x, y = sx, sy
                last_c = last_q = None
                continue
        rel = cmd.islower()
        c = cmd.upper()
        if c == "M":
            dx, dy = nums(2)
            x, y = (x + dx, y + dy) if rel else (dx, dy)
            sx, sy = x, y
            out.append(f"M{num(x)} {num(y)}")
            cmd = "l" if rel else "L"
            last_c = last_q = None
        elif c == "L":
            dx, dy = nums(2)
            x, y = (x + dx, y + dy) if rel else (dx, dy)
            out.append(f"L{num(x)} {num(y)}")
            last_c = last_q = None
        elif c == "H":
            (dx,) = nums(1)
            x = x + dx if rel else dx
            out.append(f"L{num(x)} {num(y)}")
            last_c = last_q = None
        elif c == "V":
            (dy,) = nums(1)
            y = y + dy if rel else dy
            out.append(f"L{num(x)} {num(y)}")
            last_c = last_q = None
        elif c in "CS":
            if c == "C":
                x1, y1, x2, y2, ex, ey = nums(6)
                if rel:
                    x1, y1, x2, y2, ex, ey = x + x1, y + y1, x + x2, y + y2, x + ex, y + ey
            else:
                x2, y2, ex, ey = nums(4)
                if rel:
                    x2, y2, ex, ey = x + x2, y + y2, x + ex, y + ey
                x1, y1 = (2 * x - last_c[0], 2 * y - last_c[1]) if last_c else (x, y)
            out.append(f"C{num(x1)} {num(y1)} {num(x2)} {num(y2)} {num(ex)} {num(ey)}")
            last_c, last_q = (x2, y2), None
            x, y = ex, ey
        elif c in "QT":
            if c == "Q":
                x1, y1, ex, ey = nums(4)
                if rel:
                    x1, y1, ex, ey = x + x1, y + y1, x + ex, y + ey
            else:
                ex, ey = nums(2)
                if rel:
                    ex, ey = x + ex, y + ey
                x1, y1 = (2 * x - last_q[0], 2 * y - last_q[1]) if last_q else (x, y)
            out.append(f"Q{num(x1)} {num(y1)} {num(ex)} {num(ey)}")
            last_q, last_c = (x1, y1), None
            x, y = ex, ey
        elif c == "A":
            rx, ry, rot = nums(3)
            large = flag()
            sweep = flag()
            ex, ey = nums(2)
            if rel:
                ex, ey = x + ex, y + ey
            out.append(f"A{num(rx)} {num(ry)} {num(rot)} {int(large)} {int(sweep)} {num(ex)} {num(ey)}")
            x, y = ex, ey
            last_c = last_q = None
        else:
            raise ValueError(f"unsupported path command {cmd}")
    return "".join(out)


def element_to_path(el):
    tag = el.tag.split("}")[-1]
    a = {k: float(v) if re.match(r"^-?[\d.]+$", v) else v for k, v in el.attrib.items()}
    if tag == "path":
        return path_to_abs(el.attrib["d"])
    if tag == "line":
        return f"M{num(a['x1'])} {num(a['y1'])}L{num(a['x2'])} {num(a['y2'])}"
    if tag in ("polyline", "polygon"):
        pts = [float(v) for v in re.findall(r"-?[\d.]+", el.attrib["points"])]
        s = "".join(("M" if k == 0 else "L") + f"{num(pts[k])} {num(pts[k + 1])}" for k in range(0, len(pts), 2))
        return s + ("Z" if tag == "polygon" else "")
    if tag in ("circle", "ellipse"):
        cx, cy = a.get("cx", 0.0), a.get("cy", 0.0)
        rx = a.get("r", a.get("rx", 0.0))
        ry = a.get("r", a.get("ry", rx))
        return (f"M{num(cx - rx)} {num(cy)}A{num(rx)} {num(ry)} 0 1 1 {num(cx + rx)} {num(cy)}"
                f"A{num(rx)} {num(ry)} 0 1 1 {num(cx - rx)} {num(cy)}Z")
    if tag == "rect":
        x, y, w, h = a.get("x", 0.0), a.get("y", 0.0), a["width"], a["height"]
        r = min(a.get("rx", a.get("ry", 0.0)), w / 2, h / 2)
        if not r:
            return f"M{num(x)} {num(y)}L{num(x + w)} {num(y)}L{num(x + w)} {num(y + h)}L{num(x)} {num(y + h)}Z"
        return (f"M{num(x + r)} {num(y)}L{num(x + w - r)} {num(y)}A{num(r)} {num(r)} 0 0 1 {num(x + w)} {num(y + r)}"
                f"L{num(x + w)} {num(y + h - r)}A{num(r)} {num(r)} 0 0 1 {num(x + w - r)} {num(y + h)}"
                f"L{num(x + r)} {num(y + h)}A{num(r)} {num(r)} 0 0 1 {num(x)} {num(y + h - r)}"
                f"L{num(x)} {num(y + r)}A{num(r)} {num(r)} 0 0 1 {num(x + r)} {num(y)}Z")
    raise ValueError(f"unsupported element {tag}")


def main():
    table, groups = {}, {}
    for group, icons in ICONS.items():
        groups[group] = list(icons)
        for name, lucide in icons.items():
            svg = ET.fromstring(fetch(f"icons/{lucide}.svg"))
            parts = [element_to_path(el) for el in svg]
            table[name] = "".join(parts)
            if not math.isfinite(len(table[name])):
                sys.exit(f"bad icon {name}")
    license_text = fetch("LICENSE").strip()
    header = ("/* Icons from Lucide (https://lucide.dev), " + f"commit {LUCIDE_COMMIT[:12]}, converted to absolute paths "
              "on a 24 x 24 grid.\n\n" + "\n".join("   " + line if line else "" for line in license_text.splitlines()) + "\n*/\n")
    body = "var ICONS = " + json.dumps(table, indent=0, ensure_ascii=False).replace("\n", "") + ";\n"
    body += "var ICON_GROUPS = " + json.dumps(groups, ensure_ascii=False) + ";\n"
    OUT.write_text(header + body, encoding="utf-8")
    print(f"Wrote {OUT} ({len(table)} icons, {OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
