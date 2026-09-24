# Third-party notices

The code of this project is under the MIT License (see `LICENSE`). It includes or follows the third-party work below; each keeps its own license, and all of them allow commercial use.

| Component | Where | License | Copyright |
| --- | --- | --- | --- |
| dagre 0.8.5 (layered graph layout; the minified file bundles graphlib and parts of lodash, both MIT) | `architecture-diagrams/assets/vendor/dagre.min.js` | MIT, full text in `assets/vendor/LICENSE-dagre.txt` | 2012-2014 Chris Pettitt; lodash: OpenJS Foundation and other contributors |
| Lucide icons, 165 icons converted to paths | `architecture-diagrams/assets/js/icons.js` | ISC; icons derived from Feather are MIT; both texts are at the top of the file | Lucide Icons and Contributors; Feather: 2013-present Cole Bemis |
| draw.io stencil libraries (general, flowchart, network, electrical), copied unchanged | `architecture-diagrams/assets/stencils/` | Apache License 2.0, full text in `assets/stencils/LICENSE-drawio.txt`; source and commit in `SOURCE.txt` | JGraph Ltd |
| draw.io (mxGraph) drawing rules: perimeters, connection points, orthogonal and curved routing, and the stencil drawing language, written again in JavaScript so imported files look the same | `architecture-diagrams/assets/js/renderer.js`, `drawio.js`, `stencils.js` | Apache License 2.0 (as above) | JGraph Ltd |
| B-spline curve construction as in d3-shape `curveBasis` | `basisPath` in `architecture-diagrams/assets/js/renderer.js` | ISC | 2010-2022 Mike Bostock |

Formats read or written (no code from these projects is included): draw.io `.drawio` files, WaveDrom WaveJSON (timing and bitfield diagrams), Mermaid flowchart text, SVG, PNG and CSV.

Names such as draw.io, WaveDrom, Mermaid, Lucide, Claude, ChatGPT, Gemini, Copilot, Cursor and VS Code belong to their owners and are used only to say what this tool works with.
