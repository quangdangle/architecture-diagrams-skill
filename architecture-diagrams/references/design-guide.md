# Design guide

Contents: 1. Story first · 2. Software patterns · 3. Chip design patterns · 4. Emphasis and color · 5. Review checklist · 6. Anti-patterns

## 1. Story first

A diagram answers a question. Before writing any JSON, write the question in one sentence ("What happens between a customer pressing Pay and the warehouse shipping?", "Which clocks reach the NPU and who can gate them?") and name the reader (new hire, manager, verification engineer, customer). Then:

- **Pick the main path.** Make it `kind: "main"`, make its key blocks `size: "lg"`, and let the steps follow it.
- **Cut.** Every block must help answer the question. Logging, metrics, config services, test logic and utility modules usually belong in another diagram or nowhere.
- **Explain, do not list.** `desc` answers "why does this exist?" in words the reader knows. Edge labels say what moves.
- **The 30-second test.** A newcomer reads the summary, glances at the diagram and follows the steps; after 30 seconds they can retell the story.

## 2. Software patterns

### Architecture or service map
- `TB`, one group per layer (clients, gateway, services, data, outside providers).
- `lg` for the 2 to 4 services that carry the business logic; datastores and queues as `database` / `queue` shapes or `sm` cards in `slate`.
- `normal` for synchronous calls, `async` for queues and events, `storage` for database access. Steps follow one representative request.
- Lucide icons (`server`, `database`, `cloud`, `lock`, `smartphone` …) help scanning; keep one icon per kind of thing. See `examples/web-app-icons.json`.

### Request or data flow, pipelines
- `LR` up to about 5 blocks, otherwise `TB`. Mark the happy path `main`; add `ok` / `fail` only where the outcome changes what happens next.
- Edge labels name the data ("raw events", "cleaned rows"). Give rich failure handling its own tab (`examples/order-checkout.json`).

### Process with approvals or rework
- `TB`, groups for phases or departments; `feedback` for "send back and fix", `ok` for "approved", `fail` for rejections. See `examples/chip-design-flow.json`.

### State machine
- States are nodes (`"shape": "state"`, `initial` / `final` for start and end); edge labels are events or conditions.
- Keep it under about 12 states; move rare administrative paths to a second tab. See the `rx-fsm` tab of `examples/uart-ip.json`.

### Deployment topology
- Groups for regions, clusters, networks or trust zones, at most two levels. Protocols and ports on edges only when readers need them. `external` for SaaS.

### From a code repository
- Run `scan_code.py` for a draft, then cut and rename: blocks are modules or services, not files. Say in the summary which commit the diagram describes.

## 3. Chip design patterns

### SoC or IP block diagram
- `TB`: bus masters on top, the interconnect in the middle, memories and slow peripherals below, off-chip parts `external`.
- Buses as `bus` edges or a `box` in the middle; labels say width, protocol and clock ("256-bit AXI, 800 MHz", "APB").
- `async` for interrupts and sideband signals so they do not look like data paths. Steps suit boot sequences, a DMA transfer or an interrupt path. See `examples/soc-block-diagram.json`.
- Show RTL ports on cards with `ports` (`{"in": ["clk", "rst_n"], "out": ["irq"]}`) when the reader wires the block up.

### Clock and reset tree
- `LR`: sources (`crystal`, `oscillator`, `pll`) on the left, selection (`mux`), gating (`clockgate`) and division (`counter`) in the middle, consumers on the right.
- `clock` edges labelled with frequencies; `reset` edges from the reset pad through a `sync` block to every domain.
- One group per clock domain or per stage; steps follow the clock from the crystal to one consumer. See the `tree` tab of `examples/clock-reset-tree.json`.

### CDC circuits and gate-level schematics
- `"layout": "manual"`, `"route": "orthogonal"`, one group per clock domain. Place symbols on a 10 px grid in signal order, left to right.
- Pin every wire: `fromAnchor` on the driving output, `toAnchor` on the input (positions in `symbols.md`). Clocks as `clock` edges into `CLK` pins.
- Run `validate.py`: it reports reversed wires, joined outputs, inputs with two sources and flip-flops without a clock. The editor shows the same list and rings the pins.
- See the `cdc` tab of `examples/clock-reset-tree.json` (two-flop synchronizer plus pulse generator).

### Datasheet chip diagram
- The `chip` type: block columns separated by bus columns (`"style": "matrix"` for a crossbar), power domains shaded behind their blocks, package pins on the outline (`pins` on blocks).
- Keep block titles to the datasheet names (DMA, SRAM, USART1); put sizes and counts in `sub` ("64 KB", "7 channels"). See the `blocks` tab of `examples/mcu-datasheet.json`.

### Pinout
- The `pinout` type with `"package": "LQFP48"` (QFP, QFN, SOIC, DIP, TSSOP, BGA). List pins in order; types come from names (VDD, GND, NRST, NC) or `type`.
- Put alternate functions in `alt` so the hover and the CSV download carry them. See the `pinout` tab of `examples/mcu-datasheet.json`.

### Timing diagram
- The `wave` type with WaveDrom WaveJSON. Clock first (`p`), then control signals, then data buses (`=` with `data` labels).
- Group signals by interface (`["APB", {...}, {...}]`); mark the events you explain with `node` letters and join them with `edge` arrows ("a~>b setup"). See `examples/uart-ip.json`.

### Register and address maps
- `register`: one register per entry with `offset`, `width`, `reset`; fields with `bits`, `access` and one-line `desc`. Reserved bits are drawn for you.
- `memory`: regions with `base` and `size`; gaps show as unmapped. Colors by kind (code, SRAM, peripherals, external). Both download as CSV for spreadsheets.

### Working from an existing draw.io file
- Build the page straight from the `.drawio` file to share it read-only, or convert it to a spec (`export.py --format spec`) to change it with code or an AI. Keep every `drawio` object; export back with `--format drawio`.

## 4. Emphasis and color

- Size, color and the `main` kind are the three emphasis tools; use them for the story only.
- 3 to 5 colors per diagram, named in `legend.colors`, and the same mapping across tabs.
- Red and green mean failure and success; do not use them as plain categories in the same diagram.

## 5. Review checklist

Look at the PNG from `render_png.py` (or the page) and check:

1. The summary says what the diagram shows and how to read it.
2. Every block is readable at the default zoom; no title is cut off.
3. The main path can be followed without reading descriptions.
4. Edge labels do not collide with each other or cover blocks.
5. No block floats alone unless that is the point.
6. Steps read as a story in full sentences.
7. Colors and line kinds are explained in the legend.
8. `validate.py` shows no wiring warnings, or each one is intended and explained.
9. The language matches the request, and `lang` is set.
10. Nothing private the user did not ask to include (hostnames, credentials, customer or project names from confidential files).

## 6. Anti-patterns

| Instead of | Do this |
| --- | --- |
| "ArticleService: handles articles" | "Save pipeline: checks, removes duplicates, stores" |
| Every block the same size | `lg` for the few blocks the story is about |
| No edge labels | Label the edges that carry the story |
| One giant diagram with 40 blocks | An overview plus focused tabs |
| A long left-to-right chain | `TB`, or split the chain into phases |
| Wires floating near a symbol's pins | Anchors on the exact pin positions |
| A flip-flop without a clock, arrows into outputs | Fix what `validate.py` reports |
| Colors picked for looks | Colors as categories, named in the legend |
| Jargon the reader does not share | Plain words in `desc`, technical names where readers need them |
