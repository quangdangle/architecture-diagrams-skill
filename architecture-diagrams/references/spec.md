# Spec reference

A spec is one JSON object. `scripts/validate.py` checks it; `scripts/build.py` turns it into a page.

Contents: 1. Top level · 2. Fields every diagram has · 3. graph (nodes, groups, edges, steps, legend, styles, manual layout, pins) · 4. wave · 5. register · 6. memory · 7. chip · 8. pinout · 9. draw.io and editor wrappers · 10. What the checks report · 11. Editing operations · 12. Patterns · 13. Detail boards and inside tabs · 14. Sticky notes · 15. AI in the page · 16. Port names

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
| `notes` | list | `[]` | Sticky notes; see section 14. |
| `boardOf` | tab id | none | This tab is the detail board of that overview tab (section 13). |
| `detailOf` | `{"tab", "block"}` | none | This tab holds the inside of block (or frame) `block` of tab `tab` (section 13). |

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
| `port` | `{"of", "name", "dir", "kind"}` | none | A port of a frame (`of` = the frame's group id) or, with no `of`, of the tab a block's inside lives in. `dir`: `in`, `out`, `inout`; `kind`: an edge kind such as `clock`. Shapes `port-in`, `port-out`, `port-io` (left and right edges) and `port-in-v`, `port-out-v`, `port-io-v` (top and bottom). Pin `EXT` faces the outside, `INT` the inside. |
| `detail` | tab id | none | The tab that holds this block's inside (a ▸ on the block opens it). |

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
| `source` | node id | none | On a detail board: the overview block this frame stands for. Drawn with a solid border. |
| `detail` | tab id | none | The tab the frame's inside moved to; the frame shows a ▸ link to it. |

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
| `source` | string | none | On a detail board: the overview connection this wire comes from (`"from>to"` or `"from>to:label"`). |

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
| `updateDiagram` | `set` with `layout`, `route`, `direction`, `title`, `summary`, `tag`, `legend`, `spacing`, `font` | Changes the tab itself. |

A field an update operation does not know is an error (the message lists the known fields), never silently dropped.
| `addNote` | `note` (`text`, `kind`, `attach`, `x`, `y`, `dx`, `dy`, `w`, `date`, `by`) | Adds a sticky note; `date` defaults to today. |
| `updateNote`, `removeNote` | `id`, `set`, `unset`; `id` | Changes or removes a note. |
| `arrange` | `style`: `bus` | Lays a chip overview out the way chip block diagrams are drawn: every bus or crossbar (a block named bus, crossbar, interconnect or wired to many others with `kind: "bus"`) becomes a long bar; each group of blocks stays together in a row above or below the bar most of its blocks hang on, hosts (CPU, DMA, debug) above; a block on no bus sits next to the one it is wired to. Wires to a bar go straight up or down; other wires run along the corridors between rows and pass rows through gaps. The tab becomes hand-placed. |
| `tidyFrame` | `id` (a frame with a fixed box) | Lays out the blocks inside the frame in layers (signals left to right), slides each port along its side to face the block it leads to, and grows the frame to fit. |

A block added into a frame (`group` = a frame with a fixed box in a hand-placed tab) is moved inside the frame's box, clear of the blocks and ports already there; the frame grows when it is full, and frames it would then cover move out of the way. A port added to a frame goes to the next free place on the side it was put nearest to. So operations from a script or an AI need only a rough position.

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

## 13. Detail boards and inside tabs

An overview shows the blocks and how they connect; engineers then draw each block in detail. The tool keeps these levels linked instead of copied:

- **Detail board**: the editor's "Detail board" button on an overview (`assist.py SPEC --board`, MCP `diagram_build_board`) adds a hand-placed tab with `boardOf` = the overview. Every block becomes a frame (a group with `source` and a fixed box) in the same arrangement, stretched until no frames overlap. Every connection becomes a wire between two ports on the frames' borders, on the side facing the other block, or on another side when the wire would otherwise run through a third frame. Port names come from the RTL port list of a card when one matches the block at the other end (`s_axi_cpu` for the CPU), else from the connection's label or the other block's name; on hardware tabs they follow the port-name style (section 16). An input takes one source, so inputs that would share a name get the other block's name too (`i_irq_uart`, `i_irq_gpio`). The board's wires keep the connection's words as their label.
- **Following the overview**: after every edit, a new block gets its frame and a new connection its ports and wire; a renamed block keeps its frame and wires, a relabelled connection keeps its wire; a frame's label follows the block's title. Nothing drawn on the board is removed: a frame whose block left the overview, or a wire whose connection did, is listed in Checks.
- **Tidy inside**: "⟲ Tidy inside" on a frame (op `tidyFrame`) lays out what is drawn in it in layers, signals from the frame's inputs to its outputs, lines the ports up with the blocks they lead to and fits the frame. The AI in the page does this by itself when it draws the inside of an empty frame.
- **Inside tab**: "Inside in its own tab" on a frame (`assist.py SPEC --inside FRAME --diagram BOARD`, MCP `diagram_open_inside`) moves everything drawn in the frame, with the wires among it and the notes about it, to a new tab with `detailOf`. The frame keeps its ports and gets `detail`; the new tab gets copies of the ports (same ids) on its border. A block of an overview can get an inside tab too; its border ports come from its connections.
- **Ports in step**: the ports of a frame and of its inside tab are matched by id: name, direction and kind follow the tab being edited; a port added on one side appears on the other; a port removed on one side goes from the other, except a frame port that carries a wire from the overview. Renaming a tab's id updates every link to it.
- **Navigation**: a ▸ on a frame or block opens its inside tab; a board and an inside tab show a link back to where they come from; the editor has the same buttons next to the tab picker.

## 14. Sticky notes

`"notes": [{"id": "n1", "text": "…", "kind": "constraint", "attach": "uart", "date": "2026-09-25", "by": "Alex"}]`

| Field | Notes |
| --- | --- |
| `id`, `text` | Required. |
| `kind` | `note` (default), `constraint`, `reason`, `change`, `question`, `todo`, `legend`: shown as a coloured tag with the date and author. |
| `attach` | A block id, a frame id, or `[from, to]` for a wire. An attached note sits next to it, moves with it and has a dashed leader; placed by default, it looks for a spot that covers no block or frame. |
| `dx`, `dy` | Offset of an attached note from the top-right corner of what it is attached to (set by dragging it). |
| `x`, `y` | Position of a free note. `w`: width, 80 to 600 (default 210). |

In the editor: key N (or the 🗒 action next to a selection) adds a note to what is selected, double-click edits it, drag moves it, Delete removes it; the Notes pane lists every note. Under the suggestions, **Notes to add** offers notes written from the diagram: a signal crossing clock domains, a reset released out of step with its clock, a clock gate, unwired pins, a busy hub, memory and bus details, an empty frame with its ports, a colour legend, a dated change. The toolbar button 🗒 hides or shows notes for reading; exports follow what is shown, and draw.io files always get them as yellow note shapes.

## 15. AI in the page

- **What it does**: select one or more blocks or frames and press ✦ AI next to them, or use the editor's AI tab for the whole tab. The request goes to Claude Code on the same computer with the tab (as JSON), the selection, the frame boxes and the current problems. The answer is a list of operations (section 11) plus a one-sentence summary. The page applies them to a copy and checks the result; when an operation fails or new problems appear, it sends them back to the AI, at most twice. The change is shown first (green added, amber changed, red removed) and applied with **Apply** as one undo step; the AI's summary becomes a `change` note by `AI`. One request runs at a time. Edits made while the AI works, or while its change is shown, are kept: the AI's operations are applied again to the diagram as it is then, and when they no longer fit the page says so and nothing changes.
- **The bridge**: `python3 scripts/ai_bridge.py` runs a small server on 127.0.0.1:8765 that calls `claude -p` with every tool turned off (the model can only answer), no MCP servers, no saved session and a JSON schema for the answer. It needs Claude Code signed in (a Claude seat is enough; no API key). It prints a pairing code; paste it in the AI tab once, or open the page with `#ai=8765:<code>`. Only pages from `file://`, localhost and the tool's GitHub Pages site may call it, and only with the code.
- **Without the bridge**: the AI tab copies the same request for any chat AI and applies the JSON answer pasted back, with the same preview.
- Sonnet answers in about half a minute (it runs at low effort); Opus runs at medium effort for harder requests.

## 16. Port names

On hardware tabs (RTL port lists, clock or reset wires, digital or analog symbols, hardware words in titles) the tool names ports in the usual RTL way: lower-case words joined by `_`, the direction in front (`i_`, `o_`, `io_`), and `_n` for active-low signals (`rst_n`, not `rstn` or `reset_b`). A bus interface (a bundle of signals going both ways) keeps the name its role and protocol give it, with no direction mark: `s_axi_cpu`, `m_apb`, `s_axis_rx`, or a SystemVerilog interface ending in `_if`. Checks flag port names that do not follow the style, with a fix. The editor's Settings pane switches between `i_`/`o_`/`io_` in front (default), `_i`/`_o`/`_io` at the end, or no name checks; the choice is kept in the browser. The AI is asked for the same names, and for `u_` instances, `r_` registers, `w_` wires and upper-case `P_` parameters, `C_` constants and `S_` states.
