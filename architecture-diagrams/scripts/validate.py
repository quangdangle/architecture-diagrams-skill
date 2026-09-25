#!/usr/bin/env python3
"""Check an architecture-diagrams JSON spec before building it.

Usage:
    python3 validate.py spec.json

Prints errors (the diagram cannot be built correctly) and warnings (it builds,
but readers will probably struggle). Exit code: 0 = no errors, 1 = errors,
2 = the file could not be read. Standard library only, Python 3.8+.
"""

import difflib
import json
import re
import sys
from pathlib import Path

COLORS = ("blue", "teal", "green", "amber", "red", "violet", "slate")
KINDS = ("normal", "main", "async", "storage", "ok", "fail", "feedback", "bus", "clock", "reset")
SIZES = ("sm", "md", "lg")
CORE_SHAPES = ("card", "decision", "state")
DIRS = ("forward", "back", "both", "none")
TYPES = {"graph": "graph", "wave": "wave", "timing": "wave", "register": "register", "registers": "register",
         "memory": "memory", "memory-map": "memory", "memmap": "memory", "chip": "chip", "pinout": "pinout"}
WAVE_CHARS = set("01xzpnPNhlHLud=23456789.|")
ACCESS = ("RW", "RO", "WO", "W1C", "W1S", "RC", "RS")
PIN_TYPES = ("io", "power", "ground", "analog", "clock", "reset", "debug", "config", "nc")
PACKAGE_STYLES = ("qfp", "qfn", "dip", "soic", "bga")
DIRECTIONS = ("TB", "LR", "BT", "RL")
THEMES = ("auto", "light", "dark")
LANGS = ("en", "vi")
ID_RE = re.compile(r"^[A-Za-z0-9_.-]{1,64}$")
NODE_ID_RE = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")
ROUTES = ("curved", "spline", "straight", "orthogonal", "elbow", "segment")
LABEL_POS = ("center", "top", "bottom", "left", "right", "none")
ARROWS = ("none", "classic", "block", "open", "oval", "diamond", "classicThin", "blockThin", "openThin", "dash", "cross")
NOTE_KINDS = ("note", "constraint", "reason", "change", "question", "todo", "legend")
PORT_DIRS = ("in", "out", "inout")
HEX_RE = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
DATE_RE = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}")
ASSETS = Path(__file__).resolve().parent.parent / "assets"


def _load_symbols():
    """Symbol names and aliases come from assets/js/symbols.js so the two never drift apart."""
    try:
        src = (ASSETS / "js" / "symbols.js").read_text(encoding="utf-8")
    except OSError:
        return set(), {}
    body = src[src.index("var SYMBOLS = {"):src.index("var SYMBOL_ALIAS")]
    names = set(re.findall(r"^  '?([a-z][a-z0-9-]*)'?: \{ cat: '", body, re.M))
    alias_src = src[src.index("var SYMBOL_ALIAS = {"):src.index("var SYMBOL_CATS")]
    aliases = dict(re.findall(r"'?([a-z0-9-]+)'?: '([a-z0-9-]+)'", alias_src))
    return names, aliases


def _load_icons():
    try:
        src = (ASSETS / "js" / "icons.js").read_text(encoding="utf-8")
        table = src[src.index("var ICONS = ") + len("var ICONS = "):src.index(";\nvar ICON_GROUPS")]
        return set(json.loads(table))
    except (OSError, ValueError):
        return set()


def _load_stencils():
    import xml.etree.ElementTree as ET
    names = set()
    for path in sorted((ASSETS / "stencils").glob("*.xml")):
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError:
            continue
        package = (root.get("name") or "").lower()
        for shape in root:
            if shape.tag == "shape" and shape.get("name"):
                names.add(package + "." + shape.get("name").replace(" ", "_").lower())
    return names


def _load_pins():
    """Pins of each symbol as (x, y, name, direction), plus the default size, read from assets/js/symbols.js."""
    try:
        src = (ASSETS / "js" / "symbols.js").read_text(encoding="utf-8")
    except OSError:
        return {}, {}
    body = src[src.index("var SYMBOLS = {"):src.index("var SYMBOL_ALIAS")]
    pins, sizes = {}, {}
    for m in re.finditer(r"^  '?([a-z][a-z0-9-]*)'?: \{ cat: '\w+'(.*)$", body, re.M):
        rest = m.group(2)
        size = re.search(r"size: \[(\d+(?:\.\d+)?), (\d+(?:\.\d+)?)\]", rest)
        if size:
            sizes[m.group(1)] = (float(size.group(1)), float(size.group(2)))
        found = re.search(r"pins: (\[\[.*?\]\])", rest)
        if found:
            pins[m.group(1)] = [tuple(c) for c in json.loads(found.group(1).replace("'", '"'))]
    return pins, sizes


SYMBOL_NAMES, SYMBOL_ALIASES = _load_symbols()
SYMBOL_PINS, SYMBOL_SIZES = _load_pins()
ICON_NAMES = _load_icons()
_STENCILS = None


def _stencil_names():
    global _STENCILS
    if _STENCILS is None:
        _STENCILS = _load_stencils()
    return _STENCILS


def _shape_ok(shape):
    s = str(shape).strip().lower()
    if s in CORE_SHAPES or s in SYMBOL_NAMES or s in SYMBOL_ALIASES:
        return True
    if s.startswith("icon:"):
        return s[5:].strip() in ICON_NAMES
    if s.startswith("mxgraph."):
        return s in _stencil_names()
    return False


def _color_ok(v):
    return isinstance(v, str) and (v in COLORS or v == "none" or bool(HEX_RE.match(v)))

MAX_NODES = 25
MAX_STEPS = 12
MAX_TITLE = 40
MAX_DESC = 160
MAX_LABEL = 40
MAX_NOTE = 600
MAX_BY = 60
MAX_PORT_NAME = 48

DIAGRAM_KEYS = {"id", "type", "title", "tag", "summary", "direction", "spacing", "groups", "nodes", "edges", "steps", "legend",
                "wave", "registers", "regions", "gaps", "columns", "links", "domains", "domain_label", "domainLabel", "chip", "package", "pins", "view",
                "layout", "route", "font", "source", "drawio", "signal", "edge", "config", "head", "foot", "notes", "boardOf", "detailOf"}
TOP_KEYS = {"title", "subtitle", "lang", "theme", "diagrams", "editor", "example", "playground", "drawio", "name", "source", "drawioNote",
            "drawioSkipped", "drawioKeep"} | DIAGRAM_KEYS
NODE_KEYS = {"id", "title", "icon", "desc", "color", "size", "group", "external", "width", "shape", "ports", "initial", "final",
             "x", "y", "w", "h", "style", "labelPos", "src", "drawio", "port", "detail"}
GROUP_KEYS = {"id", "label", "icon", "color", "parent", "x", "y", "w", "h", "hidden", "style", "drawio", "source", "detail"}
EDGE_KEYS = {"from", "to", "label", "kind", "minlen", "weight", "dir", "id", "points", "fromAnchor", "toAnchor", "fromPoint", "toPoint",
             "route", "elbow", "style", "labelAt", "labelOffset", "labelDist", "drawio", "source"}
NODE_STYLE_KEYS = {"fill", "stroke", "text", "color", "labelBg", "labelBorder", "strokeWidth", "fontSize", "rotation", "size", "header", "imageBox",
                   "opacity", "fillOpacity", "strokeOpacity", "spacing", "spacingTop", "spacingLeft", "spacingRight", "spacingBottom", "dashed",
                   "bold", "italic", "underline", "flipH", "flipV", "shadow", "fixedSize", "wrap", "horizontal", "align", "valign", "rounded",
                   "direction", "labelPos", "font"}
EDGE_STYLE_KEYS = {"color", "stroke", "text", "labelBg", "width", "fontSize", "endSize", "startSize", "dashed", "endArrow", "startArrow",
                   "endFill", "startFill", "rounded", "opacity", "bold"}
STEP_KEYS = {"node", "edge", "title", "text"}
NOTE_KEYS = {"id", "text", "kind", "attach", "x", "y", "dx", "dy", "w", "date", "by"}
PORT_KEYS = {"of", "name", "dir", "kind"}
DETAIL_OF_KEYS = {"tab", "block"}


def _pins_of(node):
    shape = str(node.get("shape") or "").strip().lower()
    shape = SYMBOL_ALIASES.get(shape, shape)
    return SYMBOL_PINS.get(shape, [])


def _anchor(value):
    """(x, y) of a wire end fixed to a pin: [x, y] or {"x", "y", "dx", "dy"} with small offsets."""
    if isinstance(value, list) and len(value) >= 2 and all(isinstance(v, (int, float)) for v in value[:2]):
        return float(value[0]), float(value[1])
    if isinstance(value, dict) and isinstance(value.get("x"), (int, float)) and isinstance(value.get("y"), (int, float)):
        if abs(value.get("dx") or 0) > 3 or abs(value.get("dy") or 0) > 3:
            return None
        return float(value["x"]), float(value["y"])
    return None


def _bound_pin(node, value):
    at = _anchor(value)
    if not node or at is None:
        return None
    for index, pin in enumerate(_pins_of(node)):
        if abs(pin[0] - at[0]) <= 0.02 and abs(pin[1] - at[1]) <= 0.02:
            return index, pin
    return None


def _flow(e):
    style = e.get("style") if isinstance(e.get("style"), dict) else {}
    direction = e.get("dir", "forward")
    end = style["endArrow"] != "none" if style.get("endArrow") else direction in ("forward", "both")
    start = style["startArrow"] != "none" if style.get("startArrow") else direction in ("back", "both")
    return "forward" if end and not start else "back" if start and not end else "none"


def _check_wiring(node_ids, edges, where, warnings, manual):
    """The same wiring rules the editor shows under Checks: symbol pins have a name and a direction."""
    def name(nid, pin=None):
        title = _text(node_ids[nid].get("title")).split("\n")[0] if nid in node_ids else ""
        return (title or nid) + ("." + pin[2] if pin else "")

    is_in = lambda pin: pin is not None and pin[3] in ("in", "clk")
    used, sources = {}, {}
    for i, e in enumerate(edges, 1):
        if not isinstance(e, dict):
            continue
        ew = f"{where} edge #{i}"
        a_id, b_id = str(e.get("from", "")), str(e.get("to", ""))
        a = _bound_pin(node_ids.get(a_id), e.get("fromAnchor"))
        b = _bound_pin(node_ids.get(b_id), e.get("toAnchor"))
        if a:
            used.setdefault(a_id, set()).add(a[0])
        if b:
            used.setdefault(b_id, set()).add(b[0])
        pa, pb = a[1] if a else None, b[1] if b else None
        if not pa and not pb:
            continue
        if pa and pb and pa[3] == "out" and pb[3] == "out":
            warnings.append(f"{ew}: joins two outputs, {name(a_id, pa)} and {name(b_id, pb)}.")
            continue
        if is_in(pa) and is_in(pb):
            continue
        flow = _flow(e)
        src, dst, src_id, dst_id = (pb, pa, b_id, a_id) if flow == "back" else (pa, pb, a_id, b_id)
        if flow != "none":
            from_in, into_out = is_in(src), dst is not None and dst[3] == "out"
            if from_in and into_out:
                warnings.append(f'{ew}: runs backwards, from input {name(src_id, src)} into output {name(dst_id, dst)}. Swap "from" and "to" (with their anchors) or the arrow.')
            elif from_in:
                warnings.append(f"{ew}: leaves from input {name(src_id, src)}; a signal should leave from an output pin.")
            elif into_out:
                warnings.append(f"{ew}: goes into output {name(dst_id, dst)}; a signal should end at an input pin.")
        for bound, nid in ((a, a_id), (b, b_id)):
            if bound and is_in(bound[1]):
                sources.setdefault((nid, bound[0]), []).append(i)
    for (nid, index), wires in sources.items():
        if len(wires) > 1:
            pin = _pins_of(node_ids[nid])[index]
            warnings.append(f"{where}: input {name(nid, pin)} receives {len(wires)} signals (edges {', '.join('#' + str(w) for w in wires)}); an input should have one source.")
    for nid, pins in used.items():
        for index, pin in enumerate(_pins_of(node_ids[nid])):
            if pin[3] == "clk" and index not in pins:
                warnings.append(f'{where}: node "{nid}" is wired pin by pin but its {pin[2]} pin has no wire; add the clock or enable connection (toAnchor [{pin[0]:g}, {pin[1]:g}]).')
    if not manual:
        return
    boxes = []
    for nid, n in node_ids.items():
        if n.get("drawio") or str(n.get("shape", "")).lower() in ("text", "line"):
            continue
        shape = SYMBOL_ALIASES.get(str(n.get("shape") or "").lower(), str(n.get("shape") or "").lower())
        w, h = n.get("w"), n.get("h")
        if not isinstance(w, (int, float)) or not isinstance(h, (int, float)):
            w, h = SYMBOL_SIZES.get(shape, (None, None))
        if isinstance(n.get("x"), (int, float)) and isinstance(n.get("y"), (int, float)) and w and h:
            boxes.append((nid, n["x"], n["y"], w, h))
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            (ia, ax, ay, aw, ah), (ib, bx, by, bw, bh) = boxes[i], boxes[j]
            ix = min(ax + aw, bx + bw) - max(ax, bx)
            iy = min(ay + ah, by + bh) - max(ay, by)
            if ix > 0 and iy > 0 and ix * iy >= 0.6 * max(aw * ah, bw * bh):
                warnings.append(f'{where}: node "{ib}" sits on top of node "{ia}"; move one of them.')


def _close(value, options):
    """' Did you mean "x"?' when an option is close, else nothing (for things that were renamed or removed)."""
    match = difflib.get_close_matches(str(value), options, n=1)
    return f' Did you mean "{match[0]}"?' if match else ""


def _hint(value, options):
    return _close(value, options) or f" Use one of: {', '.join(options)}."


def _text(value):
    return value.strip() if isinstance(value, str) else ""


def _unknown_keys(obj, allowed, where, warnings):
    extra = sorted(set(obj) - allowed)
    if extra:
        warnings.append(f"{where}: unknown field(s) {', '.join(extra)} will be ignored.")


def _check_diagram(d, where, errors, warnings, top_level):
    if not isinstance(d, dict):
        errors.append(f"{where}: must be a JSON object.")
        return
    if not top_level:
        _unknown_keys(d, DIAGRAM_KEYS, where, warnings)

    direction = d.get("direction", "TB")
    if direction not in DIRECTIONS:
        errors.append(f'{where}: "direction" is "{direction}".{_hint(direction, DIRECTIONS)}')
    manual = d.get("layout") in ("manual", "fixed")
    if "layout" in d and d["layout"] not in ("auto", "manual", "fixed"):
        errors.append(f'{where}: "layout" is "{d["layout"]}". Use "auto" (default) or "manual" (x/y given for every node).')
    if "route" in d and d["route"] not in ROUTES:
        errors.append(f'{where}: "route" is "{d["route"]}".{_hint(d["route"], ROUTES)}')
    from_drawio = d.get("source") == "drawio"

    spacing = d.get("spacing")
    if spacing is not None:
        if not isinstance(spacing, dict):
            errors.append(f'{where}: "spacing" must be an object like {{"rank": 70, "node": 40}}.')
        else:
            for key, value in spacing.items():
                if key not in ("rank", "node", "edge"):
                    warnings.append(f'{where}: spacing field "{key}" is ignored (use rank, node, edge).')
                elif not isinstance(value, (int, float)) or value <= 0:
                    errors.append(f'{where}: spacing "{key}" must be a positive number.')

    nodes = d.get("nodes")
    if nodes is not None and not isinstance(nodes, list):
        errors.append(f'{where}: "nodes" must be a list.')
        return
    if not nodes:
        # an empty tab is where a drawing starts (the editor shows "where to start"); nothing else to check yet
        warnings.append(f'{where}: no blocks yet. Add blocks, or start from a pattern (assist.py --patterns, then --pattern ID).')
        return

    groups = d.get("groups", [])
    if not isinstance(groups, list):
        errors.append(f'{where}: "groups" must be a list.')
        groups = []
    group_ids = {}
    for i, g in enumerate(groups, 1):
        gw = f"{where} group #{i}"
        if not isinstance(g, dict):
            errors.append(f"{gw}: must be an object.")
            continue
        _unknown_keys(g, GROUP_KEYS, gw, warnings)
        gid = g.get("id")
        if gid is None or not NODE_ID_RE.match(str(gid)):
            errors.append(f'{gw}: "id" is required and may only use letters, digits, "_", "-", ":" and ".".')
            continue
        gid = str(gid)
        if gid in group_ids:
            errors.append(f'{gw}: duplicate group id "{gid}".')
            continue
        group_ids[gid] = g
        if not _text(g.get("label")) and not g.get("hidden") and not from_drawio:
            warnings.append(f'{gw} ("{gid}"): add a "label" so readers know what the box means.')
        _check_style(g.get("style"), NODE_STYLE_KEYS, f'{gw} ("{gid}")', errors, warnings)
        if "color" in g and g["color"] not in COLORS:
            errors.append(f'{gw} ("{gid}"): color "{g["color"]}" is not supported.{_hint(g["color"], COLORS)}')
    for gid, g in group_ids.items():
        parent = g.get("parent")
        if parent is not None and str(parent) not in group_ids:
            errors.append(f'{where}: group "{gid}" has unknown parent "{parent}".{_hint(parent, list(group_ids))}')
    for gid in group_ids:
        seen, cur, depth = set(), gid, 0
        while cur is not None:
            if cur in seen:
                errors.append(f'{where}: group parents form a loop around "{gid}".')
                break
            seen.add(cur)
            parent = group_ids.get(cur, {}).get("parent")
            cur = str(parent) if parent is not None and str(parent) in group_ids else None
            depth += 1
        if depth > 3:
            warnings.append(f'{where}: group "{gid}" is nested {depth - 1} levels deep; more than 2 levels is hard to read.')

    node_ids = {}
    used_colors = set()
    port_names = {}
    for i, n in enumerate(nodes, 1):
        nw = f"{where} node #{i}"
        if not isinstance(n, dict):
            errors.append(f"{nw}: must be an object.")
            continue
        _unknown_keys(n, NODE_KEYS, nw, warnings)
        nid = n.get("id")
        if nid is None or not NODE_ID_RE.match(str(nid)):
            errors.append(f'{nw}: "id" is required and may only use letters, digits, "_", "-", ":" and ".".')
            continue
        nid = str(nid)
        if nid in node_ids:
            errors.append(f'{nw}: duplicate node id "{nid}".')
            continue
        node_ids[nid] = n
        label = f'{nw} ("{nid}")'
        title = _text(n.get("title"))
        shape = str(n.get("shape", "card")).strip().lower() or "card"
        symbol = shape not in CORE_SHAPES
        port = n.get("port")
        if not title and not symbol and not isinstance(port, dict):
            errors.append(f'{label}: "title" is required.')
        elif len(title) > MAX_TITLE and not from_drawio:
            warnings.append(f"{label}: title has {len(title)} characters; keep names under {MAX_TITLE} and move detail to desc.")
        desc = _text(n.get("desc"))
        if len(desc) > MAX_DESC:
            warnings.append(f"{label}: desc has {len(desc)} characters; aim for one plain sentence under {MAX_DESC}.")
        color = n.get("color", "slate")
        if color not in COLORS:
            errors.append(f'{label}: color "{color}" is not supported.{_hint(color, COLORS)}')
        else:
            used_colors.add(color)
        if "size" in n and n["size"] not in SIZES:
            errors.append(f'{label}: size "{n["size"]}" is not supported.{_hint(n["size"], SIZES)}')
        if "shape" in n and not _shape_ok(n["shape"]):
            options = sorted(set(CORE_SHAPES) | SYMBOL_NAMES | set(SYMBOL_ALIASES))
            errors.append(f'{label}: shape "{n["shape"]}" is not supported.{_hint(str(n["shape"]).lower(), options)} '
                          'See references/spec.md for the symbol list; draw.io stencils use their full name, e.g. "mxgraph.electrical.logic_gates.and".')
        icon = n.get("icon")
        if isinstance(icon, str) and re.fullmatch(r"[a-z0-9-]+", icon) and icon not in ICON_NAMES:
            warnings.append(f'{label}: icon "{icon}" is not in the icon set.{_hint(icon, sorted(ICON_NAMES))} Emoji also work.')
        if shape == "icon" and not icon:
            errors.append(f'{label}: shape "icon" needs an "icon" name such as "server" or "database".')
        for key in ("x", "y"):
            if key in n and not isinstance(n[key], (int, float)):
                errors.append(f'{label}: "{key}" must be a number.')
        for key in ("w", "h"):
            if key in n and (not isinstance(n[key], (int, float)) or n[key] <= 0):
                errors.append(f'{label}: "{key}" must be a positive number.')
        if manual and ("x" not in n or "y" not in n):
            warnings.append(f'{label}: the diagram uses "layout": "manual" but this node has no x/y; it is placed below the drawing.')
        if "labelPos" in n and n["labelPos"] not in LABEL_POS:
            errors.append(f'{label}: labelPos "{n["labelPos"]}" is not supported.{_hint(n["labelPos"], LABEL_POS)}')
        _check_style(n.get("style"), NODE_STYLE_KEYS, label, errors, warnings)
        if n.get("shape") == "decision" and len(title) > 30:
            warnings.append(f"{label}: decision titles read best as a short question under 30 characters.")
        group = n.get("group")
        if group is not None and str(group) not in group_ids:
            errors.append(f'{label}: unknown group "{group}".{_hint(group, list(group_ids) or ["(define it in groups)"])}')
        if "external" in n and not isinstance(n["external"], bool):
            errors.append(f'{label}: "external" must be true or false.')
        if "width" in n and (not isinstance(n["width"], (int, float)) or not 80 <= n["width"] <= 600):
            errors.append(f'{label}: "width" must be a number between 80 and 600 (usually leave it out).')
        for flag in ("initial", "final"):
            if flag in n and not isinstance(n[flag], bool):
                errors.append(f'{label}: "{flag}" must be true or false.')
        if "ports" in n and symbol and shape != "card":
            warnings.append(f"{label}: ports are only drawn on cards; symbols show their pins by shape.")
        if "ports" in n:
            ports = n["ports"]
            if not isinstance(ports, dict) or not set(ports) <= {"in", "out", "inout", "inputs", "outputs"}:
                errors.append(f'{label}: "ports" must be an object like {{"in": ["clk"], "out": ["irq"], "inout": ["sda"]}}.')
            else:
                for side, names in ports.items():
                    if not isinstance(names, (list, str)):
                        errors.append(f'{label}: ports "{side}" must be a list of names.')
                if n.get("shape") in ("decision", "state"):
                    warnings.append(f"{label}: ports are only drawn on normal cards, not on {n.get('shape')} shapes.")
        if port is not None:
            key = _check_port(port, label, group_ids, errors, warnings)
            if key:
                port_names.setdefault(key, []).append(nid)
    for (of, name, direction), ids in port_names.items():
        if len(ids) > 1:
            owner = f'frame "{of}"' if of else "the tab border"
            listed = ", ".join(f'"{x}"' for x in ids)
            warnings.append(f'{where}: {owner} has {len(ids)} "{direction}" ports named "{name}" (nodes {listed}); give each port its own name.')

    for gid in group_ids:
        if gid in node_ids:
            warnings.append(f'{where}: "{gid}" is both a group id and a node id; this works but is easy to confuse.')
    member_groups = set()
    for n in node_ids.values():
        gid = n.get("group")
        while gid is not None and str(gid) in group_ids:
            member_groups.add(str(gid))
            gid = group_ids[str(gid)].get("parent")
    for gid, g in group_ids.items():
        placed = all(isinstance(g.get(k), (int, float)) for k in ("x", "y", "w", "h"))
        if gid not in member_groups and not (manual and placed):
            warnings.append(f'{where}: group "{gid}" contains no nodes and will not be drawn.')

    edges = d.get("edges", [])
    if not isinstance(edges, list):
        errors.append(f'{where}: "edges" must be a list.')
        edges = []
    edge_pairs = []
    edge_kinds = []
    connected = set()
    for i, e in enumerate(edges, 1):
        ew = f"{where} edge #{i}"
        if not isinstance(e, dict):
            errors.append(f"{ew}: must be an object.")
            continue
        _unknown_keys(e, EDGE_KEYS, ew, warnings)
        pair = []
        for end in ("from", "to"):
            ref = e.get(end)
            free = e.get(end + "Point")
            if ref is None or ref == "":
                if manual and isinstance(free, (list, dict)):
                    continue
                errors.append(f'{ew}: "{end}" is required' + (' (or give "' + end + 'Point" in a manual layout).' if manual else "."))
            elif str(ref) in node_ids:
                pair.append(str(ref))
            elif str(ref) in group_ids:
                if not manual:
                    errors.append(f'{ew}: "{end}" points to group "{ref}". Edges must connect nodes; connect a node inside the group instead.')
            else:
                errors.append(f'{ew}: "{end}" points to unknown node "{ref}".{_hint(ref, list(node_ids))}')
        if "route" in e and e["route"] not in ROUTES:
            errors.append(f'{ew}: route "{e["route"]}" is not supported.{_hint(e["route"], ROUTES)}')
        if "points" in e and not (isinstance(e["points"], list) and all(isinstance(q, (list, dict)) for q in e["points"])):
            errors.append(f'{ew}: "points" must be a list of [x, y] pairs.')
        _check_style(e.get("style"), EDGE_STYLE_KEYS, ew, errors, warnings)
        kind = e.get("kind", "normal")
        if len(pair) == 2:
            edge_pairs.append(tuple(pair))
            edge_kinds.append(kind)
            connected.update(pair)
        if kind not in KINDS:
            errors.append(f'{ew}: kind "{kind}" is not supported.{_hint(kind, KINDS)}')
        label = _text(e.get("label"))
        if len(label) > MAX_LABEL:
            warnings.append(f"{ew}: label has {len(label)} characters; edge labels read best under {MAX_LABEL}.")
        for key in ("minlen", "weight"):
            if key in e and (not isinstance(e[key], int) or e[key] < 1):
                errors.append(f'{ew}: "{key}" must be a whole number of at least 1.')
        if "dir" in e and e["dir"] not in DIRS:
            errors.append(f'{ew}: dir "{e["dir"]}" is not supported.{_hint(e["dir"], DIRS)}')
        if e.get("source") is not None and not isinstance(e["source"], str):
            errors.append(f'{ew}: "source" must be a string such as "cpu>bus" or "cpu>bus:AXI".')

    _check_wiring(node_ids, edges, where, warnings, manual)

    steps = d.get("steps", [])
    if not isinstance(steps, list):
        errors.append(f'{where}: "steps" must be a list.')
        steps = []
    for i, s in enumerate(steps, 1):
        sw = f"{where} step #{i}"
        if not isinstance(s, dict):
            errors.append(f"{sw}: must be an object.")
            continue
        _unknown_keys(s, STEP_KEYS, sw, warnings)
        has_node, has_edge = "node" in s, "edge" in s
        if has_node == has_edge:
            errors.append(f'{sw}: give exactly one of "node" (an id) or "edge" (["from", "to"]).')
        elif has_node and str(s["node"]) not in node_ids:
            errors.append(f'{sw}: unknown node "{s["node"]}".{_hint(s["node"], list(node_ids))}')
        elif has_edge:
            ref = s["edge"]
            if not (isinstance(ref, list) and len(ref) == 2):
                errors.append(f'{sw}: "edge" must be a two-item list like ["api", "db"].')
            elif (str(ref[0]), str(ref[1])) not in edge_pairs:
                reverse = (str(ref[1]), str(ref[0])) in edge_pairs
                tip = f' The edge exists the other way round: ["{ref[1]}", "{ref[0]}"].' if reverse else ""
                errors.append(f"{sw}: there is no edge {ref[0]} -> {ref[1]}.{tip}")
        if not _text(s.get("text")):
            warnings.append(f'{sw}: add "text", a full sentence saying what happens at this step.')

    _check_notes(d.get("notes", []), where, node_ids, group_ids, edges, errors, warnings)

    legend = d.get("legend", {})
    if not isinstance(legend, dict):
        errors.append(f'{where}: "legend" must be an object.')
        legend = {}
    legend_colors = legend.get("colors", {})
    if not isinstance(legend_colors, dict):
        errors.append(f'{where}: "legend.colors" must map a color name to its meaning.')
        legend_colors = {}
    for c in legend_colors:
        if c not in COLORS:
            errors.append(f'{where}: legend color "{c}" is not supported.{_hint(c, COLORS)}')
    legend_edges = legend.get("edges", {})
    if not isinstance(legend_edges, dict):
        errors.append(f'{where}: "legend.edges" must map an edge kind to its meaning.')
        legend_edges = {}
    for k in legend_edges:
        if k not in KINDS:
            errors.append(f'{where}: legend edge kind "{k}" is not supported.{_hint(k, KINDS)}')

    big = [nid for nid, n in node_ids.items() if n.get("size") == "lg"]
    if len(big) > 4 and len(big) > len(node_ids) / 3:
        warnings.append(f"{where}: {len(big)} nodes are size lg. Emphasis works when only the 2 to 4 nodes the story is about are large.")
    if group_ids:
        def top_group(nid):
            gid = node_ids.get(nid, {}).get("group")
            gid = str(gid) if gid is not None else None
            while gid is not None and group_ids.get(gid, {}).get("parent") is not None and str(group_ids[gid]["parent"]) in group_ids:
                gid = str(group_ids[gid]["parent"])
            return gid
        forward = set()
        for (a, b), kind in zip(edge_pairs, edge_kinds):
            ga, gb = top_group(a), top_group(b)
            if ga and gb and ga != gb and kind == "main":
                forward.add((ga, gb))
        for ga, gb in sorted(forward):
            if ga < gb and (gb, ga) in forward:
                warnings.append(f'{where}: the main path goes from group "{ga}" to "{gb}" and back again. The layout may put the two groups side by side and zigzag the path; check the picture, and if it zigzags use one group per stretch of the path or drop grouping.')
    if len(node_ids) > MAX_NODES and not from_drawio and not manual:
        warnings.append(f"{where}: {len(node_ids)} nodes. Above {MAX_NODES} a diagram gets hard to read; split it into several diagrams (they become tabs).")
    if len(steps) > MAX_STEPS:
        warnings.append(f"{where}: {len(steps)} steps. Keep the walkthrough to the {MAX_STEPS} moments that matter.")
    if len(used_colors) > 5:
        warnings.append(f"{where}: {len(used_colors)} colors in one diagram; 3 to 5 categories are easier to remember.")
    if len(used_colors) > 1 and not legend_colors:
        warnings.append(f'{where}: nodes use several colors but "legend.colors" does not say what they mean.')
    if edge_pairs and not manual:
        lonely = [nid for nid in node_ids if nid not in connected]
        if lonely:
            warnings.append(f"{where}: node(s) with no connections: {', '.join(lonely)}.")
    if not _text(d.get("summary")) and not from_drawio:
        warnings.append(f'{where}: add a "summary" (1 to 3 sentences) telling readers what they are looking at.')


def _check_style(style, allowed, where, errors, warnings):
    if style is None:
        return
    if not isinstance(style, dict):
        errors.append(f'{where}: "style" must be an object like {{"fill": "#dbeafe", "stroke": "#1d4ed8"}}.')
        return
    _unknown_keys(style, allowed, f"{where} style", warnings)
    for key in ("fill", "stroke", "text", "color", "labelBg", "labelBorder"):
        if key in style and not _color_ok(style[key]):
            errors.append(f'{where}: style "{key}" must be a palette name, "none" or a #rrggbb color (got "{style[key]}").')
    for key in ("endArrow", "startArrow"):
        if key in style and style[key] not in ARROWS:
            errors.append(f'{where}: style "{key}" is "{style[key]}".{_hint(style[key], ARROWS)}')
    if "labelPos" in style and style["labelPos"] not in LABEL_POS:
        errors.append(f'{where}: style "labelPos" is "{style["labelPos"]}".{_hint(style["labelPos"], LABEL_POS)}')


def _check_port(port, label, group_ids, errors, warnings):
    """A port node sits on a frame's border ("of" = the frame's group id) or on a detail tab's border ("of" empty).
    Returns (of, name, dir) for the duplicate check, or None."""
    if not isinstance(port, dict):
        errors.append(f'{label}: "port" must be an object like {{"of": "cpu", "name": "AXI", "dir": "out"}}.')
        return None
    _unknown_keys(port, PORT_KEYS, f"{label} port", warnings)
    of = "" if port.get("of") is None else str(port["of"])
    if of and of not in group_ids:
        errors.append(f'{label}: port "of" names unknown group "{of}".{_hint(of, list(group_ids) or ["(define it in groups)"])}')
    name = _text(port.get("name"))
    if not name:
        errors.append(f'{label}: port "name" is required (1 to {MAX_PORT_NAME} characters).')
    elif len(name) > MAX_PORT_NAME:
        warnings.append(f"{label}: port name has {len(name)} characters; keep it to {MAX_PORT_NAME} or fewer.")
    direction = port.get("dir")
    if direction is None:
        errors.append(f'{label}: port "dir" is required: "in", "out" or "inout".')
    elif direction not in PORT_DIRS:
        errors.append(f'{label}: port "dir" is "{direction}".{_hint(direction, PORT_DIRS)}')
    if port.get("kind") is not None and port["kind"] not in KINDS:
        errors.append(f'{label}: port kind "{port["kind"]}" is not supported.{_hint(port["kind"], KINDS)}')
    return (of, name, direction) if name and direction in PORT_DIRS else None


def _check_notes(notes, where, node_ids, group_ids, edges, errors, warnings):
    """Sticky notes: a free note sits at x/y; an attached one follows a block, a frame or an edge, dx/dy from its top-right corner."""
    if not isinstance(notes, list):
        errors.append(f'{where}: "notes" must be a list.')
        return
    pairs = {(str(e["from"]), str(e["to"])) for e in edges
             if isinstance(e, dict) and e.get("from") not in (None, "") and e.get("to") not in (None, "")}
    seen = set()
    for i, note in enumerate(notes, 1):
        nw = f"{where} note #{i}"
        if not isinstance(note, dict):
            errors.append(f"{nw}: must be an object.")
            continue
        _unknown_keys(note, NOTE_KEYS, nw, warnings)
        nid = note.get("id")
        if nid is None or not NODE_ID_RE.match(str(nid)):
            errors.append(f'{nw}: "id" is required and may only use letters, digits, "_", "-", ":" and ".".')
            continue
        nid = str(nid)
        if nid in seen:
            errors.append(f'{nw}: duplicate note id "{nid}".')
            continue
        seen.add(nid)
        label = f'{nw} ("{nid}")'
        text = _text(note.get("text"))
        if not text:
            errors.append(f'{label}: "text" is required.')
        elif len(text) > MAX_NOTE:
            warnings.append(f"{label}: text has {len(text)} characters; keep a note under {MAX_NOTE} and move the rest to a document.")
        kind = note.get("kind")
        if kind is not None and kind not in NOTE_KINDS:
            errors.append(f'{label}: kind "{kind}" is not supported.{_hint(kind, NOTE_KINDS)}')
        attach = note.get("attach")
        if isinstance(attach, str) and attach:
            if attach not in node_ids and attach not in group_ids:
                near = _close(attach, sorted(set(node_ids) | set(group_ids)))
                warnings.append(f'{where}: note "{nid}" is attached to "{attach}", which is not in this tab.{near}')
        elif isinstance(attach, list) and len(attach) == 2:
            a, b = str(attach[0]), str(attach[1])
            if (a, b) not in pairs:
                tip = f' The edge exists the other way round: ["{b}", "{a}"].' if (b, a) in pairs else ""
                warnings.append(f'{where}: note "{nid}" is attached to the edge {a} -> {b}, which is not in this tab.{tip}')
        elif attach not in (None, ""):
            errors.append(f'{label}: "attach" must be a block or frame id, or an edge as ["from", "to"].')
        for key in ("x", "y", "dx", "dy"):
            if note.get(key) is not None and not isinstance(note[key], (int, float)):
                errors.append(f'{label}: "{key}" must be a number.')
        width = note.get("w")
        if width is not None and (not isinstance(width, (int, float)) or not 80 <= width <= 600):
            errors.append(f'{label}: "w" must be a number between 80 and 600.')
        date = note.get("date")
        if date is not None and not (isinstance(date, str) and DATE_RE.fullmatch(date)):
            warnings.append(f'{label}: date "{date}" should be written YYYY-MM-DD, like "2026-09-25".')
        by = note.get("by")
        if by is not None:
            if not isinstance(by, str):
                errors.append(f'{label}: "by" must be text, the name of who wrote the note.')
            elif len(by.strip()) > MAX_BY:
                warnings.append(f'{label}: "by" has {len(by.strip())} characters; keep it to a name under {MAX_BY}.')


def _num(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return v
    t = str(v).replace("_", "").replace(" ", "").lower()
    try:
        if t.startswith("0x"):
            return int(t, 16)
        if t.startswith("0b"):
            return int(t, 2)
        return int(t)
    except ValueError:
        return None


def _size(v):
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return v
    t = str(v).replace("_", "").replace(" ", "").lower()
    m = re.match(r"^(0x[0-9a-f]+|\d+(?:\.\d+)?)(k|m|g|t)?i?b?$", t)
    if not m:
        return None
    n = int(m.group(1), 16) if m.group(1).startswith("0x") else float(m.group(1))
    return round(n * {"k": 1024, "m": 1024 ** 2, "g": 1024 ** 3, "t": 1024 ** 4}.get(m.group(2), 1))


def _bits(f):
    def pair(hi, lo):
        return (max(hi, lo), min(hi, lo)) if hi is not None and lo is not None and hi >= 0 and lo >= 0 else None
    if "msb" in f:
        hi = _num(f["msb"])
        return pair(hi, _num(f.get("lsb", f["msb"])))
    b = f.get("bits")
    if isinstance(b, list) and b:
        return pair(_num(b[0]), _num(b[-1]))
    if isinstance(b, int) and not isinstance(b, bool):
        return pair(b, b)
    m = re.match(r"^\[?(\d+)(?::(\d+))?\]?$", str(b).replace(" ", "")) if b is not None else None
    return pair(int(m.group(1)), int(m.group(2) or m.group(1))) if m else None


def _check_wave(d, where, errors, warnings):
    src = d.get("wave") if isinstance(d.get("wave"), dict) else d
    signals = src.get("signal")
    if not isinstance(signals, list) or not signals:
        errors.append(f'{where}: a timing diagram needs "wave": {{"signal": [...]}} in WaveJSON (WaveDrom) format.')
        return
    markers, count = set(), [0]

    def walk(items, path):
        for i, item in enumerate(items, 1):
            if isinstance(item, list):
                walk(item[1:] if item and isinstance(item[0], str) else item, f"{path} group #{i}")
            elif isinstance(item, dict):
                if not item:
                    continue
                count[0] += 1
                wave = item.get("wave", "")
                if not isinstance(wave, str):
                    errors.append(f'{path} signal #{i}: "wave" must be a string such as "01.x=".')
                    continue
                bad = sorted(set(wave) - WAVE_CHARS)
                if bad:
                    errors.append(f'{path} signal "{item.get("name", i)}": unknown wave character(s) {" ".join(bad)}.')
                datas = sum(1 for ch in wave if ch == "=" or ch in "23456789")
                data = item.get("data", [])
                n_data = len(data.split()) if isinstance(data, str) else (len(data) if isinstance(data, list) else 0)
                if n_data and n_data < datas:
                    warnings.append(f'{path} signal "{item.get("name", i)}": {datas} data slots but only {n_data} labels in "data".')
                markers.update(ch for ch in str(item.get("node", "")) if ch not in ". ")
    walk(signals, where)
    if not count[0]:
        errors.append(f"{where}: the timing diagram has no signals.")
    for e in src.get("edge", []) or []:
        m = re.match(r"^\s*([^\s<>~\-|])\s*([<>~\-|]+)\s*([^\s<>~\-|])", str(e))
        if not m:
            errors.append(f'{where}: arrow "{e}" should look like "a~>b label".')
        elif m.group(1) not in markers or m.group(3) not in markers:
            errors.append(f'{where}: arrow "{e}" uses a marker that no signal defines in its "node" string.')


def _check_registers(d, where, errors, warnings):
    regs = d.get("registers")
    if not isinstance(regs, list) or not regs:
        errors.append(f'{where}: a register diagram needs a non-empty "registers" list.')
        return
    for i, r in enumerate(regs, 1):
        rw = f'{where} register #{i}' + (f' ("{r.get("name")}")' if isinstance(r, dict) and r.get("name") else "")
        if not isinstance(r, dict):
            errors.append(f"{rw}: must be an object.")
            continue
        if not _text(r.get("name")):
            errors.append(f'{rw}: "name" is required.')
        width = r.get("width")
        if isinstance(r.get("reg"), list):
            width = width or sum(int(f.get("bits", 1)) for f in r["reg"] if isinstance(f, dict))
        width = width or 32
        if not isinstance(width, int) or not 1 <= width <= 128:
            errors.append(f'{rw}: "width" must be a whole number from 1 to 128.')
            continue
        used = []
        fields = r.get("fields", [])
        if not isinstance(fields, list):
            errors.append(f'{rw}: "fields" must be a list.')
            fields = []
        for j, f in enumerate(fields, 1):
            fw = f'{rw} field #{j}' + (f' ("{f.get("name")}")' if isinstance(f, dict) and f.get("name") else "")
            if not isinstance(f, dict):
                errors.append(f"{fw}: must be an object.")
                continue
            rng = _bits(f)
            if not rng:
                errors.append(f'{fw}: "bits" must look like 7, "7:0" or [7, 0] (or give "msb" and "lsb").')
                continue
            if rng[0] >= width:
                errors.append(f"{fw}: bits {rng[0]}:{rng[1]} do not fit in a {width}-bit register.")
                continue
            for other in used:
                if not (rng[1] > other[1][0] or rng[0] < other[1][1]):
                    errors.append(f'{fw}: overlaps field "{other[0]}".')
            used.append((f.get("name", "?"), rng))
            acc = str(f.get("access", f.get("attr", ""))).upper().replace("/", "").replace(" ", "")
            if acc and acc not in ACCESS + ("R", "W", "RW1C", "RW1S"):
                warnings.append(f'{fw}: access "{acc}" is not one of {", ".join(ACCESS)}; it is shown as written.')
        if not fields and not r.get("reg"):
            warnings.append(f"{rw}: no fields; the whole register is drawn as reserved.")


def _check_memory(d, where, errors, warnings):
    regions = d.get("regions")
    if not isinstance(regions, list) or not regions:
        errors.append(f'{where}: an address map needs a non-empty "regions" list.')
        return
    spans = []
    for i, m in enumerate(regions, 1):
        mw = f'{where} region #{i}' + (f' ("{m.get("name")}")' if isinstance(m, dict) and m.get("name") else "")
        if not isinstance(m, dict):
            errors.append(f"{mw}: must be an object.")
            continue
        if not _text(m.get("name")):
            errors.append(f'{mw}: "name" is required.')
        base = _num(m.get("base"))
        size = _size(m["size"]) if "size" in m else None
        if size is None and "end" in m and base is not None and _num(m["end"]) is not None:
            size = _num(m["end"]) - base + 1
        if base is None or not size or size <= 0:
            errors.append(f'{mw}: needs "base" (like "0x4000_0000") and "size" (like "4KB") or "end".')
            continue
        if "color" in m and m["color"] not in COLORS:
            errors.append(f'{mw}: color "{m["color"]}" is not supported.{_hint(m["color"], COLORS)}')
        spans.append((base, base + size - 1, m.get("name", "?")))
    spans.sort()
    for a, b in zip(spans, spans[1:]):
        if b[0] <= a[1]:
            errors.append(f'{where}: region "{b[2]}" overlaps "{a[2]}".')


def _check_chip(d, where, errors, warnings):
    cols = d.get("columns")
    if not isinstance(cols, list) or not cols:
        errors.append(f'{where}: a chip diagram needs a "columns" list of block columns and bus columns.')
        return
    ids, buses, block_cols = {}, [], []
    domains = {g.get("id") for g in d.get("domains", []) if isinstance(g, dict)}
    for i, c in enumerate(cols):
        cw = f"{where} column #{i + 1}"
        if not isinstance(c, dict) or ("bus" in c) == ("blocks" in c):
            errors.append(f'{cw}: give either "bus" (a bus name) or "blocks" (a list of blocks).')
            continue
        if "bus" in c:
            buses.append(i)
            continue
        block_cols.append(i)
        for j, b in enumerate(c["blocks"] if isinstance(c["blocks"], list) else [], 1):
            bw = f"{cw} block #{j}"
            if not isinstance(b, dict) or not _text(b.get("title")):
                errors.append(f'{bw}: needs a "title".')
                continue
            bid = str(b.get("id") or b["title"])
            if bid in ids:
                errors.append(f'{bw}: duplicate block id "{bid}".')
            ids[bid] = i
            if b.get("domain") is not None and b["domain"] not in domains:
                errors.append(f'{bw}: unknown domain "{b["domain"]}".{_hint(b["domain"], sorted(domains) or ["(define it in domains)"])}')
            if b.get("pins") and i not in (0, len(cols) - 1):
                warnings.append(f"{bw}: pins are drawn from blocks in the first or last column only.")
            if b.get("color") is not None and b["color"] not in COLORS:
                errors.append(f'{bw}: color "{b["color"]}" is not supported.{_hint(b["color"], COLORS)}')
    if not buses:
        warnings.append(f"{where}: no bus column; blocks will not be connected to anything unless you add links.")
    for k, ln in enumerate(d.get("links", []) or [], 1):
        if not isinstance(ln, dict) or str(ln.get("from")) not in ids or str(ln.get("to")) not in ids:
            errors.append(f'{where} link #{k}: "from" and "to" must be block ids ({", ".join(sorted(ids)[:8])}…).')
    for g in d.get("domains", []) or []:
        if isinstance(g, dict) and g.get("color") is not None and g["color"] not in COLORS:
            errors.append(f'{where}: domain color "{g["color"]}" is not supported.{_hint(g["color"], COLORS)}')


def _check_pinout(d, where, errors, warnings):
    pkg = d.get("package")
    total = None
    if isinstance(pkg, str):
        m = re.match(r"^([A-Za-z]+?)(\d+)$", pkg.replace("-", "").replace(" ", ""))
        if not m:
            errors.append(f'{where}: "package" should look like "LQFP48", "QFN32", "SOIC8" or {{"style": "bga", "rows": 8, "cols": 8}}.')
        else:
            total = int(m.group(2))
    elif isinstance(pkg, dict):
        style = str(pkg.get("style", "")).lower()
        if style not in PACKAGE_STYLES:
            errors.append(f'{where}: package style "{style}" is not supported.{_hint(style, PACKAGE_STYLES)}')
        total = pkg.get("pins") if style != "bga" else None
    else:
        errors.append(f'{where}: "package" is required, for example "LQFP48".')
    pins = d.get("pins")
    if not isinstance(pins, list) or not pins:
        errors.append(f'{where}: "pins" must list the pins, as names in pin order or as objects like {{"n": 1, "name": "VDD", "type": "power"}}.')
        return
    seen = set()
    for i, p in enumerate(pins, 1):
        if isinstance(p, str):
            n = i
        elif isinstance(p, dict):
            n = p.get("n", p.get("ball", i))
            if p.get("type") is not None and p["type"] not in PIN_TYPES:
                errors.append(f'{where} pin {n}: type "{p["type"]}" is not supported.{_hint(p["type"], PIN_TYPES)}')
        else:
            errors.append(f"{where} pin #{i}: must be a name or an object.")
            continue
        if n in seen:
            errors.append(f"{where}: pin {n} is listed twice.")
        seen.add(n)
    if total and isinstance(total, int):
        numbers = {n for n in seen if isinstance(n, int)}
        if max(numbers or {0}) > total:
            errors.append(f"{where}: pin numbers go above the package pin count ({total}).")
        elif len(numbers) < total:
            warnings.append(f"{where}: {total - len(numbers)} of {total} pins are not listed; they are drawn as NC.")


def _kind_of(d):
    """The type of a diagram object ("graph", "wave", "register", "memory", "chip", "pinout"), or None when "type" names none of them."""
    if d.get("type") is not None:
        return TYPES.get(str(d["type"]).lower())
    return "wave" if "wave" in d else "register" if "registers" in d else "memory" if "regions" in d else \
           "chip" if "columns" in d else "pinout" if "package" in d else "graph"


def _check_by_type(d, where, errors, warnings, top_level):
    kind = _kind_of(d) if isinstance(d, dict) else None
    if isinstance(d, dict) and kind is None:
        errors.append(f'{where}: type "{d.get("type")}" is not supported.{_hint(d.get("type"), sorted(TYPES))}')
        return
    if kind == "graph":
        _check_diagram(d, where, errors, warnings, top_level)
        return
    if not _text(d.get("summary")):
        warnings.append(f'{where}: add a "summary" (1 to 3 sentences) telling readers what they are looking at.')
    {"wave": _check_wave, "register": _check_registers, "memory": _check_memory, "chip": _check_chip, "pinout": _check_pinout}[kind](d, where, errors, warnings)


def _members(items):
    """{id: (number, object)} for the nodes or groups of a tab that have a valid id; the first of two with one id counts."""
    found = {}
    for i, item in enumerate(items if isinstance(items, list) else [], 1):
        if isinstance(item, dict) and item.get("id") is not None and NODE_ID_RE.match(str(item["id"])):
            found.setdefault(str(item["id"]), (i, item))
    return found


def _check_tab_links(tabs, errors, warnings):
    """Checks across tabs: a detail board ("boardOf", frames with "source") and detail tabs ("detailOf", "detail").
    tabs: (where, diagram) for every tab of the spec, in order."""
    by_id = {}
    for _, d in tabs:
        if isinstance(d, dict) and d.get("id") is not None:
            by_id.setdefault(str(d["id"]), d)
    held = {}
    for where, d in tabs:
        if not isinstance(d, dict) or _kind_of(d) != "graph":
            continue
        tid = str(d["id"]) if d.get("id") is not None else None
        others = sorted(t for t in by_id if t != tid)
        groups, nodes = _members(d.get("groups")), _members(d.get("nodes"))

        board_of, overview = d.get("boardOf"), None
        if board_of is not None:
            graphs = [t for t in others if _kind_of(by_id[t]) == "graph"]
            if not isinstance(board_of, str) or not board_of.strip():
                errors.append(f'{where}: "boardOf" must be the id of the overview tab this board was made from.')
            elif board_of == tid:
                errors.append(f'{where}: "boardOf" names this tab itself; it must name the overview tab the board was made from.')
            elif board_of not in by_id:
                errors.append(f'{where}: "boardOf" names tab "{board_of}", which is not in this spec.{_hint(board_of, graphs) if graphs else ""}')
            elif _kind_of(by_id[board_of]) != "graph":
                errors.append(f'{where}: "boardOf" names tab "{board_of}", which is not a graph; a detail board is made from a graph tab.')
            else:
                overview = by_id[board_of]
        blocks = _members(overview.get("nodes")) if overview is not None else {}
        for gid, (i, g) in groups.items():
            source = g.get("source")
            if source is None:
                continue
            if not isinstance(source, str):
                errors.append(f'{where} group #{i} ("{gid}"): "source" must be the id of the overview block this frame stands for.')
            elif board_of is None:
                warnings.append(f'{where}: group "{gid}" has a "source" but this tab has no "boardOf"; add "boardOf" (the overview tab) or remove "source".')
            elif overview is not None and source not in blocks:
                shown = f'"{_text(overview.get("title"))}"' if _text(overview.get("title")) else f'tab "{board_of}"'
                warnings.append(f'{where}: frame "{gid}" stands for block "{source}", which is no longer in {shown}.{_close(source, sorted(blocks))}')

        detail_of = d.get("detailOf")
        if detail_of is not None:
            if not isinstance(detail_of, dict):
                errors.append(f'{where}: "detailOf" must be an object like {{"tab": "overview", "block": "cpu"}}.')
            else:
                _unknown_keys(detail_of, DETAIL_OF_KEYS, f"{where} detailOf", warnings)
                tab, block = detail_of.get("tab"), detail_of.get("block")
                if tab in (None, "") or block in (None, ""):
                    errors.append(f'{where}: "detailOf" needs both "tab" and "block", like {{"tab": "overview", "block": "cpu"}}.')
                else:
                    tab, block = str(tab), str(block)
                    if (tab, block) in held:
                        warnings.append(f'{where}: holds the inside of block "{block}" of tab "{tab}", as {held[(tab, block)]} already does; keep one detail tab per block.')
                    held.setdefault((tab, block), where)
                    if tab not in by_id:
                        errors.append(f'{where}: "detailOf" names tab "{tab}", which is not in this spec.{_hint(tab, others) if others else ""}')
                    else:
                        inside = sorted(set(_members(by_id[tab].get("nodes"))) | set(_members(by_id[tab].get("groups"))))
                        if block not in inside:
                            warnings.append(f'{where}: "detailOf" names block "{block}", which is not a block or frame of tab "{tab}".{_close(block, inside)}')

        for what, members in (("group", groups), ("node", nodes)):
            for mid, (i, m) in members.items():
                target = m.get("detail")
                if target is None:
                    continue
                label = f'{where} {what} #{i} ("{mid}")'
                if not isinstance(target, str) or not target.strip():
                    errors.append(f'{label}: "detail" must be the id of the tab that holds its inside.')
                elif target not in by_id:
                    errors.append(f'{label}: "detail" names tab "{target}", which is not in this spec.{_hint(target, others) if others else ""}')
                elif tid is None:
                    warnings.append(f'{label}: "detail" names tab "{target}", but this tab has no "id" for the "detailOf" of that tab to point back to.')
                else:
                    back = by_id[target].get("detailOf")
                    if not (isinstance(back, dict) and back.get("tab") is not None and str(back["tab"]) == tid
                            and back.get("block") is not None and str(back["block"]) == mid):
                        warnings.append(f'{label}: "detail" names tab "{target}", whose "detailOf" does not point back here; '
                                        f'set it to {{"tab": "{tid}", "block": "{mid}"}}.')


def validate_spec(spec):
    """Return (errors, warnings) for a parsed spec."""
    errors, warnings = [], []
    if not isinstance(spec, dict):
        return ["The top level must be a JSON object."], warnings
    if spec.get("playground") or spec.get("editor") or isinstance(spec.get("drawio"), str):
        return errors, warnings
    lang = spec.get("lang")
    if lang is None:
        warnings.append('Set "lang" to "vi" or "en" so buttons and the legend match the reader\'s language.')
    elif lang not in LANGS:
        errors.append(f'"lang" is "{lang}".{_hint(lang, LANGS)}')
    if "theme" in spec and spec["theme"] not in THEMES:
        errors.append(f'"theme" is "{spec["theme"]}".{_hint(spec["theme"], THEMES)}')
    if not _text(spec.get("title")):
        warnings.append('Add a "title" for the page heading and file names.')

    if "diagrams" in spec:
        _unknown_keys(spec, {"title", "subtitle", "lang", "theme", "diagrams", "playground", "editor", "example", "source", "drawioNote"}, "top level", warnings)
        diagrams = spec["diagrams"]
        if not isinstance(diagrams, list) or not diagrams:
            errors.append('"diagrams" must be a non-empty list.')
            return errors, warnings
        seen = set()
        tabs = []
        for i, d in enumerate(diagrams, 1):
            did = d.get("id") if isinstance(d, dict) else None
            where = f'diagram "{did}"' if did else f"diagram #{i}"
            if did is not None:
                if not ID_RE.match(str(did)):
                    errors.append(f'{where}: "id" may only use letters, digits, "_", "-" and ".".')
                elif str(did) in seen:
                    errors.append(f'{where}: duplicate diagram id.')
                seen.add(str(did))
            elif len(diagrams) > 1:
                warnings.append(f"{where}: add an \"id\" so the tab can be linked directly (page.html#id).")
            _check_by_type(d, where, errors, warnings, top_level=False)
            tabs.append((where, d))
        _check_tab_links(tabs, errors, warnings)
    else:
        _unknown_keys(spec, TOP_KEYS, "top level", warnings)
        _check_by_type(spec, "diagram", errors, warnings, top_level=True)
        _check_tab_links([("diagram", spec)], errors, warnings)
    return errors, warnings


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip())
        return 2
    path = Path(argv[1])
    try:
        spec = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        print(f"ERROR: cannot read {path}: {exc}")
        return 2
    errors, warnings = validate_spec(spec)
    for w in warnings:
        print(f"WARNING: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    if errors:
        print(f"{len(errors)} error(s), {len(warnings)} warning(s).")
        return 1
    print(f"OK: no errors, {len(warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
