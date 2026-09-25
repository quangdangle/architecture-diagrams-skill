---
name: architecture-diagrams
description: Draw diagrams for software and chip design as one interactive, offline HTML page that also opens and saves draw.io files. Covers architecture and block diagrams, request flows, pipelines, processes, state machines, clock and reset trees, schematics with gates, flip-flops, mux, PLL, ADC and passives wired pin by pin, WaveDrom timing diagrams, register maps, address maps, datasheet chip diagrams and LQFP, QFN or BGA pinouts. The page has an editor (tables with required-field and wiring checks, drag and drop, multi-select, undo history) and exports draw.io, SVG, PNG, Mermaid and CSV. Use this skill whenever someone asks to draw, visualize, sketch, map or explain a system, module, IP block, SoC, pipeline or process, wants a datasheet figure, or wants to open, edit or convert a .drawio file, including Vietnamese requests such as vẽ sơ đồ, vẽ kiến trúc, vẽ luồng, sơ đồ khối, sơ đồ chân, giản đồ thời gian, bản đồ thanh ghi, even when the word diagram never appears.
license: MIT
---

# Architecture diagrams

You write a small JSON spec; the scripts validate it and turn it into one self-contained HTML page. You never hand-draw SVG or HTML, so every diagram looks consistent and your effort goes into the content.

What the reader gets in the page (works offline, no install):
- the diagram with zoom, pan, an overview map, search, click-to-highlight and a numbered walkthrough;
- an editor behind the ✎ button: tables grouped by part (blocks, connections, groups, steps, legend, settings) with required fields marked, notes under each field, red marks on wrong values and a Checks list with quick fixes for wiring and naming problems; ready-made patterns; suggestions for the selected block and next steps for the whole tab (keys 1 to 8 apply them; in a hand-placed tab the top one shows faintly and Tab adds it); a "where to start" panel for an empty tab; drag to move, Shift+drag to wire pin to pin, multi-select, align, copy and paste, text editing on the drawing, undo with a named history;
- downloads: copy picture (for Word, PowerPoint, Teams), SVG, PNG, draw.io (every tab becomes a page), Mermaid, CSV for register, address and pin tables.

`<skill>` below means the folder that holds this SKILL.md. Scripts need Python 3.8+ only; PNG, SVG and draw.io export from the command line also need Chrome, Chromium, Edge or Brave.

## Pick the diagram type

| The reader needs | Type | Start from |
| --- | --- | --- |
| Parts of a system and how they talk; a process; a state machine | `graph` (default) | `examples/order-checkout.json`, `examples/starter.json` |
| A chip or IP block: blocks, buses, clock and reset | `graph` with symbols | `examples/soc-block-diagram.json`, `examples/clock-reset-tree.json` |
| A gate-level or schematic view wired pin by pin | `graph`, `"layout": "manual"`, symbols with anchors | the `cdc` tab of `examples/clock-reset-tree.json` |
| Signals over clock cycles | `wave` (WaveDrom WaveJSON) | `examples/uart-ip.json` (tabs `apb-timing`, `uart-frame`) |
| Bit fields of registers | `register` | `examples/uart-ip.json` (tab `registers`) |
| Where memories and peripherals sit in the address space | `memory` | `examples/soc-block-diagram.json` (tab `memory`) |
| A datasheet-style chip block diagram with buses, power domains and package pins | `chip` | `examples/mcu-datasheet.json` (tab `blocks`) |
| Package pins | `pinout` | `examples/mcu-datasheet.json` (tab `pinout`) |

Several diagrams in one spec become tabs (`"diagrams": [...]`); `page.html#<id>` opens a tab directly.

## Workflow

1. **Understand the subject.** Read the code, documents or description. Decide who reads the diagram and the one question it must answer. Ask only when something essential is missing; otherwise assume and say so in the summary.
2. **Plan.** One diagram per question, about 5 to 20 blocks each. Split big systems into an overview plus detail tabs.
3. **Write the spec** as a `.json` file where the user wants the output. `references/spec.md` lists every field of every type; `references/symbols.md` lists every symbol with its pins; `examples/` shows the tone and density to aim for.
4. **Validate and build:**
   ```bash
   python3 <skill>/scripts/build.py diagram.json -o diagram.html
   ```
   Fix every ERROR. Read every WARNING: some are readability hints, others are wiring mistakes (a wire running backwards, two outputs joined, a flip-flop without its clock, blocks stacked on each other). `scripts/validate.py diagram.json` runs the checks alone.
5. **Look at it:**
   ```bash
   python3 <skill>/scripts/render_png.py diagram.html            # add --diagram <id>, --theme dark
   ```
   Open the PNG. Check that text is readable, the main path is obvious, labels do not collide and nothing floats alone. Adjust and rebuild. Exit code 2 means no browser is installed; skip this step then.
6. **Deliver** the `.html` with the `.json` beside it. Tell the user in a sentence or two what they can do: click blocks, walk through the steps, press ✎ to adjust by hand, download draw.io, SVG, PNG or copy the picture. When they asked for draw.io, also run `scripts/export.py diagram.json --format drawio`.

## Chips, schematics and pins

Symbols (`"shape": "dff"`, `"mux"`, `"pll"`, `"and"`, `"adc"`, `"nmos"` …) draw IEEE-style parts. Each symbol has named pins with a direction, for example `dff`: `D` (in) at [0, 0.3], `CLK` (clock) at [0, 0.72], `Q` (out) at [1, 0.3], `QN` (out) at [1, 0.78]. The full list is in `references/symbols.md`, and `diagram_symbols` in the MCP server returns it too.

- For block-level pictures (clock trees, SoC overviews) let the layout run automatically and connect blocks without anchors.
- For gate-level or schematic pictures use `"layout": "manual"`, give every node `x` and `y`, set `"route": "orthogonal"`, and pin each wire end with `fromAnchor` / `toAnchor` set to the pin position, such as `"toAnchor": [0, 0.72]` for a flip-flop clock.
- Wires go from an output pin to an input pin. An input takes one source; draw several wires from an output to fan out. A clocked symbol (`dff`, `dffr`, `latch`, `register`, `counter`, `sync`, `clockgate`) wired pin by pin also needs its clock or enable wired. `validate.py` and the editor's Checks list report every break of these rules.
- **Ready-made patterns** (30, in four groups) save drawing common pieces by hand. Circuits: `sync2`, `rstsync`, `icg`, `pulsesync`, `clkdiv2`, `edgedet`, `shiftreg`, `regen`, `lfsr`. SoC and IP: `socmin`, `axi2apb`, `tlul`, `afifo`, `uart`, `spi`, `clktree`, `tb` (UVM testbench). Software: `web3tier`, `micro`, `events`, `serverless`, `datapipe`, `mlpipe`, `k8s`, `cicd`. Processes: `approval`, `login`, `fsmctl`, `uartrx`, `asicflow`. `python3 <skill>/scripts/assist.py diagram.json --pattern sync2 --near ff3 -o diagram.json` puts one next to block `ff3`, wired to its pins; `--patterns` lists them.
- Edge kinds `clock`, `reset` and `bus` give clock, reset and bus lines their usual look; name them in `legend.edges`.
- `ports` on a card (`{"in": ["clk", "rst_n", "din[7:0]"], "out": [...]}`) lists signals of an RTL module without drawing pins.

## draw.io files

- Build a page straight from a draw.io file: `build.py design.drawio -o design.html` (also `.drawio.svg`, and `.drawio.png` saved with the diagram inside). Shapes from draw.io's general, flowchart, network and electrical libraries are drawn with draw.io's own stencils; groups, containers, rotations, routes and labels are kept.
- To change it with code or an AI, turn it into a spec: `export.py design.drawio --format spec -o design.json`. Edit the JSON, keep every `drawio` object as it is, then `export.py design.json --format drawio -o design.drawio`. Cells you did not touch come back unchanged.
- Symbols of this skill go to draw.io as editable stencils. `export.py x.json --format library` writes them as a draw.io shape library (File > Open Library in draw.io).

## Changing a diagram in small steps

For a small change (add a block, wire one pin to another, fix what the checks report) send editing operations instead of rewriting the spec: `python3 <skill>/scripts/assist.py diagram.json --ops ops.json -o diagram.json`. `--suggest` lists every problem with its fix as operations, the next steps for the whole tab (at most five, most useful first) and likely next blocks for each block; apply the ones that fit. The format is in `references/spec.md` (sections 11 and 12). These commands run the page's own code in a headless browser, so they need Chrome, Chromium, Edge or Brave.

## Overview, detail board and inside tabs

Engineers draw an overview first, then each block in detail. Keep the levels linked instead of copying them:

- `assist.py overview.json --board [--diagram TAB] -o design.json` adds a detail board: a hand-placed tab with every block of the overview as a frame (same arrangement) and every connection as a wire between named ports on the frames' borders. Engineers (or an AI) then draw the inside of each frame. The board follows later edits of the overview: new blocks get frames, new connections get ports and wires; nothing drawn is removed, and the checks list what no longer matches.
- `assist.py design.json --inside FRAME --diagram BOARD -o design.json` moves what is drawn in one frame to its own tab, with copies of the frame's ports on the border. The frame keeps its ports and links to the tab (▸); ports added, renamed or removed on either side follow on the other.
- Port names follow RTL practice: `i_`/`o_`/`io_` in front, snake_case, `_n` for active-low. The checks flag other names on hardware tabs with a fix; the editor's Settings can switch to `_i`/`_o` at the end or turn the check off.

## Arranging a chip overview

An SoC overview with a crossbar and many blocks is hard to read in the automatic layout (every wire fans out from one box). The `arrange` operation (`{"op": "arrange", "style": "bus"}`, also offered as a next step and used by the AI in the page) draws it the way chip block diagrams are drawn by hand: each bus or crossbar a long bar, groups kept together in rows above and below it, hosts on top, straight wires to the bars and the other wires along the corridors between rows. Mark bus wires with `"kind": "bus"`. A pipeline (a CPU core, a DSP or video chain, a packet path) uses `{"op": "arrange", "style": "stages"}` instead: put the blocks of each stage in one top-level group and mark wires that go back with `"kind": "feedback"`; each group becomes a column, left to right in the order the signal runs, caches sit above or below their stage, feedback wires run in a corridor under the columns, and no wire passes under a block.

## Sticky notes

`"notes"` on a tab holds sticky notes: a text, a kind (`note`, `constraint`, `reason`, `change`, `question`, `todo`, `legend`), a date, an author, and an `attach` (block, frame or `[from, to]` wire) so the note moves with it. The editor adds one with N, lists them in a Notes pane, and offers notes written from the diagram (clock-domain crossings, reset release, unwired pins, memory and bus details, a colour legend). Use them for the "why" that does not fit in a block: constraints, decisions, open questions.

## AI in the page

`scripts/ai_bridge.py` lets the page's ✦ AI button (next to selected blocks) and AI tab call Claude Code on the same computer: the page sends the tab, the selection and its problems; the answer is editing operations that the page checks (and sends back to fix, at most twice), previews and applies as one undo step, with the AI's summary as a note. The bridge listens on 127.0.0.1 only, needs a pairing code and runs `claude -p` with every tool off. Without it the AI tab copies the request for any chat AI.

## Starting from code

`scan_code.py <repo> -o draft.json [--lang vi]` reads imports in Python, JavaScript/TypeScript, Go, Java/Kotlin and C/C++, and module instances with their ports in Verilog/SystemVerilog. It writes a first draft: an overview of folders and imports, drill-downs for the largest folders, and an RTL module hierarchy. Treat it as a draft: rename blocks, write real descriptions and add the walkthrough.

## Other AI tools, MCP and people without AI

- **MCP:** `scripts/mcp_server.py` is a stdio MCP server (standard library only) with tools `diagram_guide`, `diagram_validate`, `diagram_build`, `diagram_open_editor`, `diagram_export`, `diagram_import_drawio`, `diagram_scan_code`, `diagram_symbols`, `diagram_patterns`, `diagram_insert_pattern`, `diagram_apply_ops`, `diagram_suggest`, `diagram_build_board` and `diagram_open_inside`. Register it in Claude Code (`claude mcp add architecture-diagrams -- python3 <skill>/scripts/mcp_server.py`), Codex CLI, Cursor, VS Code, Gemini CLI or Claude Desktop.
- **Any chat AI:** the page's JSON tab has "Copy prompt for AI": the spec format, every symbol with its pins and the current diagram, ready to paste into ChatGPT, Gemini or Copilot. The JSON the AI returns is pasted back and applied; code fences are ignored.
- **No AI:** `build.py --editor -o editor.html` makes an empty editor page; people fill in the tables, paste rows from Excel, drag and wire.

## Spec at a glance

```json
{
  "title": "Website upload flow",
  "lang": "en",
  "diagrams": [
    {
      "id": "upload",
      "title": "Upload",
      "summary": "A user uploads a photo; the API stores it and a worker makes thumbnails. Follow the **numbered steps**.",
      "direction": "LR",
      "groups": [{ "id": "backend", "label": "Backend", "icon": "server", "color": "teal" }],
      "nodes": [
        { "id": "browser", "title": "Browser", "icon": "globe", "desc": "The user picks a photo and presses Upload.", "color": "blue" },
        { "id": "api", "title": "Upload API", "icon": "shield", "desc": "Checks the file and saves the original.", "color": "teal", "group": "backend", "size": "lg" },
        { "id": "queue", "title": "Job queue", "shape": "queue", "group": "backend" },
        { "id": "worker", "title": "Thumbnail worker", "desc": "Makes small preview images.", "color": "teal", "group": "backend" },
        { "id": "storage", "title": "Object storage", "shape": "database", "external": true }
      ],
      "edges": [
        { "from": "browser", "to": "api", "label": "photo file", "kind": "main" },
        { "from": "api", "to": "storage", "label": "original", "kind": "storage" },
        { "from": "api", "to": "queue", "label": "resize job", "kind": "async" },
        { "from": "queue", "to": "worker", "kind": "async" },
        { "from": "worker", "to": "storage", "label": "thumbnails", "kind": "storage" }
      ],
      "steps": [
        { "node": "browser", "text": "The user chooses a photo and uploads it." },
        { "edge": ["api", "queue"], "text": "The API queues a resize job, so the user does not wait." },
        { "node": "worker", "text": "A worker makes thumbnails and writes them back." }
      ],
      "legend": { "colors": { "blue": "Client", "teal": "Our services" } }
    }
  ]
}
```

## Writing content that tells a story

- **title**: the name in 1 to 4 words ("Order service", "AXI4 interconnect"). Use code names only when readers search the code for them.
- **desc**: what it does and why, in one plain sentence under about 20 words.
- **edge label**: what travels or happens, as a short noun phrase ("payment request", "128-bit AXI", "retry after 5 s").
- **steps**: 3 to 8 full sentences in reading order, each on the node or edge where it happens.
- **summary**: 1 to 3 sentences on what the diagram shows and how to read it; `**bold**` works.
- **language**: write in the user's language and set `"lang"` to `"vi"` or `"en"`; it switches the page's buttons and messages. Keep the technical terms the audience uses (API, RTL, AXI, CDC).

## Visual choices

- **direction**: `TB` for layered architectures, block diagrams and long processes; `LR` for short pipelines and clock trees.
- **color** is a category: 3 to 5 per diagram, named in `legend.colors`. Palette: `blue`, `teal`, `green`, `amber`, `red`, `violet`, `slate`.
- **size**: `lg` for the 2 to 4 blocks the story is about, `sm` for leaves.
- **groups**: layers, domains, teams, clock or power domains; at most two levels deep.
- **external: true** gives third-party, off-chip or outside parts a dashed border.
- **edge kinds**: `main` (thick, the story's path), `normal`, `async` (dashed: queues, events, interrupts), `storage` (dotted: reads and writes), `bus` (thick grey), `clock` (dotted violet), `reset` (dash-dot red), `ok`, `fail`, `feedback` (dashed orange: retries, rework).

`references/design-guide.md` has patterns for software architecture, request flows, pipelines, SoC block diagrams, clock and reset trees, CDC schematics, datasheet figures, pinouts, timing diagrams, register and address maps, processes and state machines, plus a review checklist.

## When to use something else

- Messages between a few parties over time: Mermaid `sequenceDiagram`.
- Database tables and relations: Mermaid `erDiagram`.
- A three-box sketch inside Markdown: Mermaid `flowchart` (or export this skill's diagram as Mermaid).

## Troubleshooting

- **Crowded or small**: switch to `TB`, split into tabs, shorten text, or raise `"spacing": {"rank": 80, "node": 50}`.
- **Tangled arrows**: list the main path first, mark it `"kind": "main"`, move minor links to another tab, or switch to `"layout": "manual"` and place the blocks.
- **Unknown shape**: the ERROR names the closest match; `references/symbols.md` has every name and alias.
- **Broken references in a rough draft**: `--force` builds anyway; the page lists what it skipped.
- **Smaller file**: `--cdn` loads the layout library from the internet instead of embedding it (about 280 KB less).

## Files

- `scripts/build.py`: validate and build a page (`--editor`, `--cdn`, `--force`, draw.io files accepted).
- `scripts/validate.py`: checks only, including the wiring rules.
- `scripts/export.py`: draw.io, SVG, PNG, Mermaid, CSV, HTML, spec JSON or a draw.io symbol library.
- `scripts/render_png.py`: screenshot for self-review.
- `scripts/scan_code.py`: draft spec from a source repository.
- `scripts/assist.py`: patterns, editing operations, every problem with its fix, detail boards (`--board`) and inside tabs (`--inside`).
- `scripts/ai_bridge.py`: lets the page ask Claude Code on this computer (✦ AI).
- `scripts/mcp_server.py`: the same features for any MCP client.
- `references/spec.md`, `references/symbols.md`, `references/design-guide.md`: fields, symbols with pins, patterns.
- `assets/`: the page template, renderer and editor (`js/`), the patterns (`patterns.json`), draw.io stencils (Apache 2.0), Lucide icons (ISC), dagre (MIT), the AI prompt. Do not edit them per diagram.
- `examples/`: complete specs for every type, in English and Vietnamese.
