# Spec reference

A spec is one JSON object. `scripts/validate.py` checks it; `scripts/build.py` turns it into a page.

Contents: 1. Top level · 2. Fields every diagram has · 3. graph (nodes, groups, edges, steps, legend, styles, manual layout, pins) · 4. wave · 5. register · 6. memory · 7. chip · 8. pinout · 9. draw.io and editor wrappers · 10. What the checks report

## 1. Top level

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | string | none | Page heading; also names downloaded files. |
| `subtitle` | string | none | One line under the title. |
| `lang` | `"vi"` or `"en"` | guessed from the text | Language of the page's buttons, legend, hints and messages. Write the content in the same language. |
| `theme` | `"auto"`, `"light"`, `"dark"` | `"auto"` | `auto` follows the viewer's system; readers can toggle. |
| `diagrams` | list of diagrams | none | Each becomes a tab. A single diagram may instead sit at the top level (its fields next to `title`). |

## 2. Fields every diagram has

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Letters, digits, `_`, `-`, `.`. Needed with several diagrams; `page.html#id` opens that tab. |
| `type` | `graph` (default), `wave`, `register`, `memory`, `chip`, `pinout` | `timing` = `wave`, `registers` = `register`, `memory-map` = `memory`. |
| `title` | string | Tab name and heading. |
| `tag` | string | Small badge next to the heading ("CDC", "LQFP48"). |
| `summary` | string | The READ-FIRST box, 1 to 3 sentences; `**bold**` works. |

## 3. graph

Block diagrams, architecture maps, flows, processes, state machines, clock trees and schematics.

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `nodes` | list | required | The blocks. |
| `edges` | list | `[]` | Connections. |
| `groups` | list | `[]` | Frames around related blocks. |
| `steps` | list | `[]` | The walkthrough, numbered in list order. |
| `legend` | object | `{}` | Meaning of colors and edge kinds. |
| `direction` | `TB`, `LR`, `BT`, `RL` | `TB` | Automatic layout only. |
| `spacing` | object | TB: rank 60, node 36, edge 18; LR: rank 44, node 30, edge 18 | Pixels between ranks, neighbouring nodes and parallel edges. |
| `layout` | `"auto"` or `"manual"` | `auto` | `manual`: nodes carry `x` and `y`; see Manual layout. |
| `route` | `straight`, `orthogonal`, `curved`, `spline`, `elbow`, `segment` | `spline` (auto), `straight` (manual) | Default line style for every edge. |
| `font` | string | system font | CSS font family for the drawing. |

### Node

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | required | Unique in the diagram; letters, digits, `_`, `.`, `:`, `-`. |
| `title` | string | required for cards | 1 to 4 words; `\n` breaks a line. Symbols may leave it out. |
| `desc` | string | none | One plain sentence, shown on cards and in the details panel. |
| `shape` | string | card | Leave out for a card. `state`, `decision` for flowcharts; any symbol name from `symbols.md`; `icon` with `icon`; `"icon:<name>"`; a draw.io stencil name such as `mxgraph.electrical.logic_gates.and`. |
| `icon` | string | none | A Lucide icon name (`server`, `database`, `cpu`, `cloud`, `lock`, …; see `symbols.md`) or an emoji. |
| `color` | `blue`, `teal`, `green`, `amber`, `red`, `violet`, `slate` | `slate` | A category; name it in `legend.colors`. |
| `size` | `sm`, `md`, `lg` | `md` | Cards 176, 216 or 260 px wide. |
| `group` | group id | none | The innermost frame the block sits in. |
| `external` | boolean | `false` | Dashed border: third-party, off-chip, outside the team. |
| `ports` | `{"in": [...], "out": [...], "inout": [...]}` | none | Signal names listed on a card (RTL modules). Verilog names such as `din[7:0]` or `data[W-1:0]` work. |
| `initial`, `final` | boolean | `false` | State machines: start and end states. |
| `labelPos` | `center`, `top`, `bottom`, `left`, `right`, `none` | per symbol | Where a symbol's title sits. |
| `x`, `y` | number | none | Manual layout: top-left corner in pixels. |
| `w`, `h` | number | shape's own size | Manual layout: size in pixels. Symbols with a fixed aspect keep their proportions. |
| `width` | number 80 to 600 | automatic | Card width in automatic layout, when one card must be wider. |
| `src` | URL | none | Picture for `"shape": "image"` (https or a data URL). |
| `style` | object | `{}` | See Styles. |
| `drawio` | object | none | Written by the draw.io import; keep it unchanged. |

### Group

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | required | Unique in the diagram. |
| `label` | string | the id | Shown on a chip on the frame. |
| `icon`, `color` | as for nodes | `slate` | |
| `parent` | group id | none | Nests this frame in another; keep to two levels. |
| `x`, `y`, `w`, `h` | number | fitted around members | Manual layout: a fixed frame. |
| `hidden` | boolean | `false` | Groups blocks without drawing a frame. |
| `style` | object | `{}` | Node styles apply. |

Frames with no blocks inside are not drawn. In the editor, dropping a block inside a frame puts it in that group.

### Edge

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `from`, `to` | node id | required | In a manual layout also a group id, or leave one out and give `fromPoint` / `toPoint` (a free end). `from` = `to` draws a loop. |
| `label` | string | none | What travels or happens. |
| `kind` | `main`, `normal`, `async`, `storage`, `bus`, `clock`, `reset`, `ok`, `fail`, `feedback` | `normal` | Line look; see SKILL.md. |
| `dir` | `forward`, `back`, `both`, `none` | `forward` | Arrow heads, and the signal direction the wiring checks use. |
| `route` | as the diagram `route` | the diagram's | Line style of this edge. |
| `points` | list of `[x, y]` | none | Bends (manual layout); curved routes use them as control points. |
| `fromAnchor`, `toAnchor` | `[x, y]` or `{"x", "y", "dx", "dy", "perimeter"}` | none | Fixes the end to a point of the block box: fractions 0 to 1 from the top-left, plus pixel offsets. Set it to a pin position to wire that pin. |
| `fromPoint`, `toPoint` | `[x, y]` | none | Free end in manual layout. |
| `elbow` | `horizontal`, `vertical` | `horizontal` | For `route: elbow`. |
| `labelAt` | number -1 to 1 | 0 | Label position along the line (start to end). |
| `labelDist`, `labelOffset` | number, `[dx, dy]` | 0 | Move the label off the line. |
| `minlen`, `weight` | integer at least 1 | 1 (weight 3 for `main`) | Automatic layout: minimum ranks between the ends; higher weight keeps the edge short and straight. |
| `style` | object | `{}` | See Styles. |

### Step

| Field | Type | Notes |
| --- | --- | --- |
| `node` or `edge` | node id, or `["from", "to"]` | Exactly one; an edge must exist in that direction. |
| `title` | string | Defaults to the node title or "From → To". |
| `text` | string | One or two full sentences; `**bold**` works. |

### Legend

`{"colors": {"blue": "Processors"}, "edges": {"clock": "Clock, 100 MHz"}}`. Colors appear only when blocks use them. Edge kinds in use appear automatically with default wording; `edges` replaces the wording.

### Styles

Node `style` (mostly written by the draw.io import; use sparingly by hand):

| Key | Meaning |
| --- | --- |
| `fill`, `stroke`, `text`, `labelBg`, `labelBorder` | Colors: a palette name, `#rgb` / `#rrggbb` or `none`. |
| `strokeWidth` (0 to 20), `fontSize` (4 to 160), `rotation` (degrees), `rounded` (true, false or a radius), `dashed` (true or a pattern such as `"4 2"`) | Lines and text. |
| `bold`, `italic`, `underline`, `align` (`left`, `center`, `right`), `valign` (`top`, `middle`, `bottom`), `wrap` (false stops wrapping), `font` | Text. |
| `opacity`, `fillOpacity`, `strokeOpacity` | 0 to 100. |
| `direction` (`north`, `south`, `west`), `flipH`, `flipV` | Turn or mirror a shape; pins turn with it. |
| `shadow`, `header`, `imageBox`, `spacing…`, `horizontal`, `fixedSize`, `size`, `labelPos` | draw.io details kept for round trips. |

Edge `style`: `color`, `text`, `labelBg`, `width` (0 to 30), `fontSize`, `dashed`, `rounded`, `opacity`, `bold`, `endArrow` / `startArrow` (`none`, `classic`, `block`, `open`, `oval`, `diamond`, `classicThin`, `blockThin`, `openThin`, `dash`, `cross`), `endSize` / `startSize`, `endFill` / `startFill` (false for hollow heads). Arrow heads in `style` win over `dir`.

### Manual layout

With `"layout": "manual"` every node needs `x` and `y` (top-left, pixels; nodes without them are placed under the drawing). Use it for schematics, datasheet figures and anything that must match a reference picture. Snap to a 10 px grid so edges line up. The editor switches to manual layout by itself when someone drags a block, and "Auto layout" in its Settings pane goes back.

### Pins and wiring

Symbols have named pins with a direction (`in`, `out`, `io`, and `clk` for a clock or enable input the block needs); `symbols.md` lists them. A wire end is on a pin when its anchor matches the pin position (within 0.02). Then these rules apply, both in `validate.py` (warnings) and in the editor's Checks list:

1. A wire leaves an output and enters an input; with `"dir": "back"` the other way round.
2. Two outputs are never joined.
3. An input has one source. A wire between two inputs is a continued net (a clock chained from one flip-flop to the next) and is fine.
4. A symbol wired pin by pin has its `clk` pins wired.
5. In a manual layout, two blocks do not sit on top of each other.

## 4. wave: timing diagrams (WaveDrom WaveJSON)

Put the WaveJSON in `"wave"` (or its fields at the diagram level).

| Field | Notes |
| --- | --- |
| `signal` | List of `{"name", "wave", "data", "node", "period", "phase"}` or nested groups `["label", {...}, {...}]`; `{}` is a spacer row. |
| `wave` characters | `0 1` low and high, `x` unknown, `z` high impedance, `=` and `2`-`9` data (labels from `data`), `p n P N` clocks, `h l H L` sharp edges, `u d` pull up and down, `.` repeat, `\|` gap. |
| `data` | Labels for the data segments, a list or a space-separated string. |
| `node` | Marker letters under the wave (`.` for none); arrows join them. |
| `edge` | Arrows such as `"a~>b 2 cycles"`, `"a-|>b"`, `"a<->b"`. |
| `config.hscale` | 1 to 4: stretch the cycles. |
| `head`, `foot` | `{"text": "...", "tick": 0}` titles and cycle numbers. |

## 5. register

`"registers": [ register, ... ]`

| Field | Notes |
| --- | --- |
| `name` | Register name. |
| `offset` | Address offset: `"0x04"`, `4`, `"0b100"`. |
| `width` | Bits, 1 to 128 (default 32). |
| `reset` | Reset value; must fit in `width`. `x` or `-` means unknown. |
| `desc` | One sentence. |
| `fields` | `{"bits": "7:4" or "3" or 3, "name", "access", "reset", "desc"}` or `msb` / `lsb`. Fields must fit in `width` and not overlap; gaps are drawn as reserved. |
| `access` | `RW`, `RO`, `WO`, `W1C`, `W1S`, `RC`, `RS`. |
| `reg` | Instead of `fields`: a WaveDrom bitfield list `[{"bits": 4, "name": "EN", "attr": "RW"}, ...]` from bit 0 up. |

Download → CSV gives the table for a spreadsheet.

## 6. memory: address maps

`"regions": [{"name", "base", "size" or "end", "color", "desc"}]`, `"gaps": false` hides unmapped ranges. `base` and `end` take `0x2000_0000`, decimal or `0b`; `size` takes `4096`, `4KB`, `1MB`, `0x1000`. Regions must not overlap.

## 7. chip: datasheet block diagrams

| Field | Notes |
| --- | --- |
| `chip` | Name printed on the chip outline. |
| `columns` | Left to right. Block columns `{"blocks": [...]}` alternate with bus columns `{"bus": "AHB", "style": "bar" or "matrix"}`. |
| block | `{"id", "title" (required), "sub", "rows" (1 to 12, height), "row" (fixed row), "color", "domain", "pins" (package pins on the outline), "pinDir" (`in`, `out`, `both`), "link" (`left`, `right`, `both`, `none`: which bus it joins), "multi" (1 to 4 stacked copies)}` |
| `domains` | `{"id", "label", "color"}` power domains shaded behind their blocks; `domainLabel` titles them. |
| `links` | `{"from", "to", "label", "dir"}` extra arrows between blocks. |

## 8. pinout

| Field | Notes |
| --- | --- |
| `chip` | Name in the middle of the package. |
| `package` | `"LQFP48"`, `"QFN32"`, `"SOIC8"`, `"DIP16"`, `"TSSOP20"`, `"BGA64"` …, or `{"style": "qfp" / "qfn" / "dip" / "soic" / "bga", "pins", "rows", "cols", "name"}`. |
| `pins` | `{"n": 1, "name": "VDD", "type", "alt": ["USART1_TX"], "desc"}`, BGA uses `"ball": "A1"` (rows skip I, O, Q, S, X, Z), or plain names in order. Missing numbers become NC. |
| `type` | `io`, `power`, `ground`, `analog`, `clock`, `reset`, `debug`, `config`, `nc`; guessed from the name when left out (VDD, GND, NRST, NC). |

## 9. draw.io and editor wrappers

- `{"drawio": "<mxfile …>", "name": "file.drawio", "title", "lang"}` embeds a whole draw.io file; the page converts it when it opens. `build.py file.drawio` writes this for you.
- `{"editor": true, "lang": "vi", "example": spec}` opens the page with the editor, starting from `example` (empty without it). `build.py --editor` writes this.
- `page.html?edit=1` opens any page with its editor; `#<id>` picks the tab.

## 10. What the checks report

`validate.py` (run by `build.py`) and the editor share these rules.

**Errors** stop the build: missing, badly formed or duplicate ids; unknown types, shapes, colors, sizes, kinds, directions, routes or languages (each with a "did you mean"); nodes in unknown groups; group loops; edges to unknown nodes (or to groups in an automatic layout); steps naming both or neither of `node` and `edge`, or a missing node or edge; wave characters that do not exist; register fields that overlap or do not fit; regions that overlap or lack a base, size or end; pins listed twice.

**Warnings** build but deserve a look: the wiring rules above; missing `lang` or `summary`; more than 25 nodes or 12 steps; more than 5 colors without a legend; long titles, descriptions or labels; blocks with no connection; empty groups; unknown fields (usually typos).

The editor also marks required fields with `*`, puts the reason under a wrong field, lists every problem above the form (click one to jump to it) and rings wrong pins on the drawing.
