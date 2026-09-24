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

## 11. Editing operations (ops)

Small changes to a `graph` tab can be sent as operations instead of a whole new spec. The editor's quick fixes, patterns and suggestions use them; `scripts/assist.py SPEC --ops ops.json`, the MCP tool `diagram_apply_ops` and the editor's JSON tab (paste `{"ops": [...]}` and press Apply) apply them to one tab. All or nothing: when one operation fails, nothing changes and the errors say which one and why.

An end of a connection is a block id (`"ff2"`) or a block and one of its pins (`"ff2.Q"`); the pin is turned into the right `fromAnchor` or `toAnchor`. A connection is named by its index in `edges` (`"edge": 3`, counted from 0) or by its two ends.

| Operation | Fields | Does |
| --- | --- | --- |
| `addNode` | `node` (a node object with a new `id`), `near`, `side` (`right`, `below`, `left`) | Adds a block. In a hand-placed tab without `x`/`y` it goes into free space next to `near`, or to the right of the drawing. |
| `updateNode` | `id`, `set` (fields to change; `null` removes one), `unset` (list of fields) | Changes a block. The id changes only with `renameNode`. |
| `removeNode` | `id` | Removes the block with its connections and steps. |
| `renameNode` | `id`, `to` (or `index` for one row, used for duplicate ids) | Renames a block and every connection and step that uses it. |
| `connect` | `from`, `to`, and `kind`, `label`, `dir`, `route`, `points`, `style` | Adds a connection; an identical one is not added twice. |
| `disconnect` | `edge`, or `from` and `to` | Removes one connection. |
| `reverseEdge` | `edge`, or `from` and `to` | Swaps the two ends with their anchors, the fix for a wire drawn backwards. |
| `updateEdge` | `edge` (or `from`/`to`), `set`, `unset` | Changes label, kind, route…; `set.from` / `set.to` point an end elsewhere. |
| `addGroup`, `updateGroup` | `group` object; `id`, `set`, `unset` | Adds or changes a group. |
| `removeStep` | `index` | Removes one step. |
| `updateDiagram` | `set` with `layout`, `route`, `direction`, `title` | Changes the tab itself. |

```json
{"ops": [
  {"op": "addNode", "node": {"id": "sync3", "shape": "dff", "title": "sync3"}, "near": "ff2"},
  {"op": "connect", "from": "ff2.Q", "to": "sync3.D"},
  {"op": "connect", "from": "clkb.CLK", "to": "sync3.CLK", "kind": "clock"},
  {"op": "updateNode", "id": "ff2", "set": {"title": "capture"}}
]}
```

## 12. Patterns

`assets/patterns.json` holds 30 ready-made pieces in four groups (`assist.py --patterns` lists them):

| Group | Patterns |
|---|---|
| Digital circuits (`chip`, wired pin by pin) | `sync2` 2-flop synchronizer, `rstsync` reset synchronizer, `icg` clock gate, `pulsesync` pulse synchronizer, `clkdiv2` divide-by-2, `edgedet` rising-edge detector, `shiftreg` 4-bit shift register, `regen` register with enable, `lfsr` 4-bit LFSR |
| SoC, IP and verification (`soc`) | `socmin` minimal RISC-V SoC, `axi2apb` AXI-to-APB bridge, `tlul` TL-UL crossbar, `afifo` asynchronous FIFO, `uart` UART block, `spi` SPI master, `clktree` clock and reset tree, `tb` UVM testbench |
| Software (`software`) | `web3tier`, `micro` microservices, `events` event-driven, `serverless`, `datapipe` data pipeline, `mlpipe` machine-learning pipeline, `k8s` Kubernetes, `cicd` |
| Flowcharts and state machines (`process`) | `approval`, `login` sign-in with retries, `fsmctl` control state machine, `uartrx` UART receiver, `asicflow` ASIC design flow |

- Inserting a pattern next to a selected block (`assist.py SPEC --pattern sync2 --near ff3`, `diagram_insert_pattern`, or the editor's Patterns list) places it in free space and wires it to that block: the block's output into the pattern's input, a clock source into the pattern's clock pins, or the pattern's output into a free input of the block. A block-level pattern (FIFO, bus, UART, the software ones) gets one wire from the block (its output pin when it has one) into the pattern's entry block. The place is picked so that the new wires do not run through other blocks.
- Circuit patterns are wired pin by pin, so an automatic layout switches to hand-placed positions first, as a drag does. Block-level patterns stay in the automatic layout.
- Clocks: a synchronizer takes the clock of the other domain; any other pattern takes the clock of the block it sits next to. A pattern brings its own clock source only when the tab has none; otherwise open clock pins get a one-click wire in the Checks list (the clock in the same group first).
- Ids that are taken get a suffix (`sync1_2`). The new blocks join the group of the block they sit next to (a synchronizer joins the other domain's group when it lands next to that frame) and stay out of other frames.
- Adding a pattern: an entry in `patterns.json` with `id`, `cat` (`chip` or `software`), `title` / `desc` / `keywords`, `nodes` (local `x`, `y`), `edges` (`"block.PIN"` ends), and how it meets a selected block: `inputs` (nets the block's output drives, with an optional text `label` used when nothing is selected), `outputs` (pins that drive a free input of the block), `clocks` (clock nets, `at` = where a new clock source goes), `entry` (`{"node", "kind", "label"}` for block-level patterns), `pins: true` for circuit patterns, `cdc: true` for synchronizers, `clockOut: true` when the output is a clock, `reverseTo` (the only pin names of the block the output may drive) with `outKind`. Also: `outLabels` (a signal label on an output pin, `{"pin", "text", "x", "y", "w", "h", "kind"}`), `points` on an edge (its own bends, such as a loop from QN back to D), `via` on an input net (bends for a pin the net reaches over other blocks), `domain: "src"` on a block or clock net of a two-domain pattern (it runs on the selected block's clock), `parent` on a group (a frame inside a frame), and `top: true` for the few shown in the start panel. `tests/test_assist.py` checks every pattern.

The editor suggests what to do next, by the kind of block (read from its shape, icon and name):

| Block | Suggestions |
|---|---|
| any block with pins | wire a free input from the nearest output on its left, a free output to the nearest input on its right, a free clock pin from the clock of its group; else a signal label |
| clock source | a clock gate (`icg` pattern), a flip-flop on this clock |
| flip-flop, register | the next stage on the same clock (and reset), a synchronizer into each other clock domain (only when its own clock is wired and the tab has two clocks) |
| gate, mux, ALU | a flip-flop after it |
| SoC card: CPU, NPU, DMA | a bus (the nearest one, or a new AXI interconnect); an interrupt controller once there are peripherals |
| SoC card: bus | a CPU that drives it, SRAM, a bridge to APB; an APB bus gets peripherals |
| SoC card: bridge | the bus in front of it, then peripherals it lacks (UART, GPIO, Timer, SPI, I2C, Watchdog) |
| SoC card: memory, controller, peripheral, interrupt controller | the bus, bridge or controller it hangs off; a DRAM behind a memory controller; a peripheral's interrupt line |
| software: app, person, API, service, queue, database | API gateway, web app, a service, database + cache + queue, a consumer, one read replica (the nearest existing block of that kind first) |
| flowchart | the next step, a yes/no check, the end; a decision gets its Yes / No branches or a No branch back one step |
| state | the next state (from four states on, back to the initial state first), a final state, the initial state, a transition into a state nothing reaches |
| a block with no connection | a wire from the nearest block before it |

- A plain card whose name says what it is gets that shape or icon ("SRAM" → `ram`, "Approved?" → `decision`), except that an SoC drawn as cards keeps its cards.
- Right after a block in the middle of a chain is deleted, its two neighbours get a suggestion to join again, with the same pins and label.
- With nothing selected, **Next steps** lists up to five suggestions for the whole tab: rejoin after a delete, blocks standing alone, decisions missing a branch, hubs missing their usual partners, then the ends of chains, newest first.
- Keys 1 to 8 apply the suggestion with that number. In a hand-placed tab the first suggestion that adds a block or a wire is drawn faintly and Tab adds it (after a click on the drawing; a block reached with the keyboard keeps Tab for moving the focus). The preview can be turned off in the suggestion box.
- The Checks list offers quick fixes, and an empty tab starts with a panel of ways to begin. `assist.py SPEC --suggest` and `diagram_suggest` return the same fixes, suggestions and next steps as operations.
