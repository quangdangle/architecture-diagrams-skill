"""Patterns, editing operations and suggestions (scripts/assist.py, which runs assets/js/assist.js in a headless browser)."""

import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "architecture-diagrams"
sys.dont_write_bytecode = True
sys.path.insert(0, str(SKILL / "scripts"))
import assist  # noqa: E402
from render_png import find_browser  # noqa: E402
from validate import SYMBOL_ALIASES, SYMBOL_PINS, _shape_ok, validate_spec  # noqa: E402

CDC = json.loads((SKILL / "examples" / "clock-reset-tree.json").read_text(encoding="utf-8"))
PATTERNS = json.loads((SKILL / "assets" / "patterns.json").read_text(encoding="utf-8"))["patterns"]
WIRING = ("runs backwards", "joins two outputs", "receives", "leaves from input", "goes into output", "wired pin by pin", "sits on top of")


def wiring_warnings(spec):
    errors, warnings = validate_spec(spec)
    return errors, [w for w in warnings if any(k in w for k in WIRING)]


def pins_of(shape):
    shape = str(shape or "").lower()
    return SYMBOL_PINS.get(SYMBOL_ALIASES.get(shape, shape), [])


class PatternData(unittest.TestCase):
    """The pattern file is data the page and the MCP server share, so it is checked without a browser."""

    def test_every_pattern_is_complete(self):
        self.assertEqual(len({p["id"] for p in PATTERNS}), len(PATTERNS))
        for p in PATTERNS:
            with self.subTest(pattern=p["id"]):
                self.assertIn(p["cat"], ("chip", "soc", "software", "process"))
                for key in ("title", "desc"):
                    self.assertTrue(p[key]["en"] and p[key]["vi"], key)
                self.assertTrue(p.get("keywords"))
                ids = [n["id"] for n in p["nodes"]]
                self.assertEqual(len(set(ids)), len(ids))
                for n in p["nodes"]:
                    self.assertTrue(_shape_ok(n.get("shape") or "card"), n)
                    self.assertTrue(isinstance(n.get("x"), (int, float)) and isinstance(n.get("y"), (int, float)), n)

    def test_every_pin_named_in_a_pattern_exists(self):
        for p in PATTERNS:
            nodes = {n["id"]: n for n in p["nodes"]}
            refs = [e["from"] for e in p.get("edges", [])] + [e["to"] for e in p.get("edges", [])]
            refs += [pin for net in p.get("inputs", []) for pin in net["pins"]] + p.get("outputs", [])
            refs += [pin for c in p.get("clocks", []) for pin in c["pins"]] + [o["pin"] for o in p.get("outLabels", [])]
            refs += [pin for net in p.get("inputs", []) for pin in net.get("via", {})]
            for ref in refs:
                with self.subTest(pattern=p["id"], end=ref):
                    block, _, pin = ref.partition(".")
                    self.assertIn(block, nodes)
                    if pin:
                        self.assertIn(pin, [q[2] for q in pins_of(nodes[block].get("shape"))])

    def test_how_each_pattern_meets_a_block(self):
        for p in PATTERNS:
            with self.subTest(pattern=p["id"]):
                nodes = {n["id"] for n in p["nodes"]}
                if p.get("pins"):
                    self.assertTrue(p.get("inputs") or p.get("outputs") or p.get("clocks"))
                else:
                    self.assertIn(p["entry"]["node"], nodes)
                for name in p.get("reverseTo", []):
                    self.assertEqual(name, name.upper())

    def test_each_group_has_typical_picks(self):
        for cat in ("chip", "soc", "software", "process"):
            with self.subTest(cat=cat):
                self.assertGreaterEqual(len([p for p in PATTERNS if p["cat"] == cat]), 5)
                self.assertGreaterEqual(len([p for p in PATTERNS if p["cat"] == cat and p.get("top")]), 3)

    def test_list(self):
        rows = assist.pattern_list("vi")
        self.assertEqual([r["id"] for r in rows][:3], ["sync2", "rstsync", "icg"])
        self.assertEqual(rows[0]["title"], "Bộ đồng bộ 2 tầng")
        self.assertEqual(rows[0]["clocks"], [["sync1.CLK", "sync2.CLK"]])


@unittest.skipUnless(find_browser(), "needs Chrome, Chromium, Edge or Brave")
class InBrowser(unittest.TestCase):
    def test_every_pattern_fits_an_empty_diagram(self):
        for p in PATTERNS:
            with self.subTest(pattern=p["id"]):
                spec = {"title": p["id"], "lang": "en", "diagrams": [{"id": "t", "title": p["id"], "nodes": [], "edges": []}]}
                result = assist.insert_pattern(spec, p["id"])
                self.assertEqual(result["checks"], [])
                errors, wiring = wiring_warnings(result["spec"])
                self.assertEqual(errors, [])
                self.assertEqual(wiring, [])
                nodes = result["spec"]["diagrams"][0]["nodes"]
                self.assertGreaterEqual(len(nodes), len(p["nodes"]))
                self.assertTrue(all(str(n.get("title") or "").strip() for n in nodes), [n["id"] for n in nodes if not n.get("title")])

    def test_pattern_next_to_a_block_is_wired_to_its_pin(self):
        result = assist.insert_pattern(copy.deepcopy(CDC), "sync2", near="ff3", diagram="cdc")
        d = result["spec"]["diagrams"][1]
        self.assertEqual(result["added"], ["sync1", "sync2", "d_sync"])  # the input comes from ff3; the output gets its signal label
        link = [e for e in d["edges"] if e["from"] == "ff3" and e["to"] == "sync1"]
        self.assertEqual(len(link), 1)
        self.assertEqual((link[0]["fromAnchor"]["x"], link[0]["fromAnchor"]["y"]), (1, 0.3))
        # a synchronizer after sync3 (clk_b domain) takes the only other clock, clk_a, and stays out of the far clk_a frame
        self.assertEqual(len([e for e in d["edges"] if e["from"] == "clka" and e["to"] in ("sync1", "sync2")]), 2)
        self.assertTrue(all("group" not in n for n in d["nodes"] if n["id"] in ("sync1", "sync2")))
        self.assertEqual(result["checks"], [])
        errors, wiring = wiring_warnings(result["spec"])
        self.assertEqual((errors, wiring), ([], []))

    def test_open_clock_pins_get_a_fix(self):
        spec = copy.deepcopy(CDC)
        spec["diagrams"][1]["nodes"].append({"id": "lone", "shape": "dff", "title": "lone", "x": 520, "y": 330, "group": "db"})
        spec["diagrams"][1]["edges"].append({"from": "ff2", "to": "lone", "fromAnchor": [1, 0.3], "toAnchor": [0, 0.3]})
        result = assist.suggest(spec, diagram="cdc", node="lone")
        fixes = [c["fixes"] for c in result["checks"] if "lone" in c["text"]][0]
        self.assertTrue(fixes[0]["safe"])
        self.assertEqual(fixes[0]["ops"][0]["from"], "clkb.CLK")
        fixed = assist.apply_ops(spec, fixes[0]["ops"], diagram="cdc")
        self.assertEqual(fixed["checks"], [])

    def test_ops_are_all_or_nothing(self):
        ops = [{"op": "addNode", "node": {"id": "sync4", "shape": "dff", "title": "sync4"}, "near": "ff3"},
               {"op": "connect", "from": "ff3.Q", "to": "sync4.DATA"}]
        with self.assertRaises(assist.AssistError) as caught:
            assist.apply_ops(copy.deepcopy(CDC), ops, diagram="cdc")
        self.assertIn("D, CLK, Q, QN", str(caught.exception))
        ops[1]["to"] = "sync4.D"
        ops.append({"op": "connect", "from": "clkb.CLK", "to": "sync4.CLK", "kind": "clock"})
        result = assist.apply_ops(copy.deepcopy(CDC), ops, diagram="cdc")
        node = [n for n in result["spec"]["diagrams"][1]["nodes"] if n["id"] == "sync4"][0]
        self.assertTrue(node["x"] > 700, node)
        self.assertEqual(result["checks"], [])

    def test_suggest_lists_fixes_and_next_blocks(self):
        spec = copy.deepcopy(CDC)
        spec["diagrams"][1]["edges"][1] = {"from": "ff2", "to": "ff1", "fromAnchor": [0, 0.3], "toAnchor": [1, 0.3]}
        result = assist.suggest(spec, diagram="cdc")
        reverse = [f for c in result["checks"] for f in c["fixes"] if f["ops"][0]["op"] == "reverseEdge"]
        self.assertEqual(len(reverse), 1)
        self.assertTrue(reverse[0]["safe"])
        fixed = assist.apply_ops(spec, reverse[0]["ops"], diagram="cdc")
        self.assertEqual(fixed["checks"], [])
        patterns = {(s["node"], s.get("pattern"), s.get("clock")) for s in result["suggestions"]}
        # sync3 sits in the clk_b domain with a free Q: a synchronizer into the other domain (clk_a), and a clock gate after clk_b
        self.assertIn(("ff3", "sync2", "clka"), patterns)
        self.assertIn(("clkb", "icg", None), patterns)

    def test_synchronizer_takes_the_clock_of_the_other_domain(self):
        result = assist.insert_pattern(copy.deepcopy(CDC), "sync2", near="ff3", diagram="cdc", clock="clka")
        d = result["spec"]["diagrams"][1]
        clocked = [e for e in d["edges"] if e["from"] == "clka" and e["to"] in ("sync1", "sync2")]
        self.assertEqual(len(clocked), 2)
        self.assertEqual(result["notes"], [])  # the clock was asked for, so there is nothing to explain
        self.assertEqual(result["checks"], [])

    def test_block_pattern_is_wired_to_its_entry_block(self):
        result = assist.insert_pattern(copy.deepcopy(CDC), "afifo", near="ff3", diagram="cdc")
        d = result["spec"]["diagrams"][1]
        link = [e for e in d["edges"] if e["from"] == "ff3" and e["to"] == "mem"]
        self.assertEqual(len(link), 1)
        self.assertEqual((link[0]["fromAnchor"]["x"], link[0]["label"], link[0]["kind"]), (1, "wdata", "main"))
        self.assertEqual(result["checks"], [])
        self.assertEqual(wiring_warnings(result["spec"]), ([], []))

    def test_software_pattern_joins_the_selected_service(self):
        spec = {"title": "t", "lang": "en", "diagrams": [{"id": "s", "title": "s", "nodes": [{"id": "app", "title": "Mobile app"}, {"id": "api", "title": "API"}],
                                                          "edges": [{"from": "app", "to": "api"}]}]}
        result = assist.insert_pattern(spec, "events", near="api")
        d = result["spec"]["diagrams"][0]
        self.assertIn({"from": "api", "to": "queue", "kind": "async", "label": "events"}, d["edges"])
        self.assertNotIn("layout", d)  # block-level patterns keep the automatic layout

    def test_pattern_runs_on_the_clock_of_the_selected_block(self):
        result = assist.insert_pattern(copy.deepcopy(CDC), "icg", near="ff2", diagram="cdc")
        d = result["spec"]["diagrams"][1]
        self.assertTrue(any(e["from"] == "ff2" and e["to"] == "en_latch" for e in d["edges"]))
        self.assertEqual({e["to"] for e in d["edges"] if e["from"] == "clkb" and e["to"] in result["added"]}, {"inv", "gclk_and"})
        self.assertIn("clk_b", result["notes"][0])
        self.assertEqual(result["checks"], [])

    def test_reset_synchronizer_only_drives_a_reset_pin(self):
        # next to a flip-flop without a reset pin: no wire from its Q into the reset net
        result = assist.insert_pattern(copy.deepcopy(CDC), "rstsync", near="ff1", diagram="cdc")
        d = result["spec"]["diagrams"][1]
        self.assertFalse([e for e in d["edges"] if e["from"] == "ff1" and e["to"] in result["added"]])
        self.assertEqual(result["checks"], [])
        # next to a flip-flop with RST_N: the synchronized reset drives that pin
        spec = copy.deepcopy(CDC)
        spec["diagrams"][1]["nodes"].append({"id": "ffr", "shape": "dffr", "title": "ffr", "x": 650, "y": 330, "group": "db"})
        spec["diagrams"][1]["edges"].append({"from": "clkb", "to": "ffr", "fromAnchor": [1, 0.5], "toAnchor": [0, 0.6], "kind": "clock"})
        result = assist.insert_pattern(spec, "rstsync", near="ffr", diagram="cdc")
        d = result["spec"]["diagrams"][1]
        link = [e for e in d["edges"] if e["to"] == "ffr" and e["from"] == "rst_sync"]
        self.assertEqual(len(link), 1)
        self.assertEqual(((link[0]["toAnchor"]["x"], link[0]["toAnchor"]["y"]), link[0]["kind"]), ((0.5, 1), "reset"))
        self.assertEqual(result["checks"], [])
        self.assertEqual(wiring_warnings(result["spec"]), ([], []))

    def test_a_large_tab_gets_a_short_list(self):
        nodes = [{"id": f"s{i}", "title": f"Service {i}"} for i in range(60)]
        spec = {"title": "t", "lang": "en", "diagrams": [{"id": "big", "title": "big", "nodes": nodes, "edges": []}]}
        result = assist.suggest(spec)
        self.assertTrue(result.get("truncated"))
        self.assertLessEqual(len(result["suggestions"]), 160)
        self.assertIn("Only the first", assist.describe(result))

    def test_an_soc_grows_from_one_cpu(self):
        spec = {"title": "t", "lang": "en", "diagrams": [{"id": "s", "title": "s", "nodes": [{"id": "cpu", "title": "RISC-V CPU"}], "edges": []}]}
        result = assist.suggest(spec)
        self.assertEqual(result["nextSteps"][0]["label"], "RISC-V CPU: Add an AXI bus for it")
        spec = assist.apply_ops(spec, result["nextSteps"][0]["ops"])["spec"]
        labels = [s["label"] for s in assist.suggest(spec, node="axi")["suggestions"]]
        self.assertEqual(labels, ["Add on-chip SRAM", "Add a bridge to APB for slow peripherals"])

    def test_soc_cards_keep_their_style(self):
        spec = json.loads((SKILL / "examples" / "soc-block-diagram.json").read_text(encoding="utf-8"))
        spec["lang"] = "en"
        result = assist.suggest(spec, diagram="blocks")
        self.assertFalse([s for s in result["suggestions"] if "symbol" in s["label"]])
        by = {s["node"]: s["label"] for s in result["suggestions"]}
        self.assertEqual(by["uart"], "Send its interrupt to Interrupt controller")
        self.assertEqual(by["apb"], "Add a Timer")

    def test_software_suggestions_follow_the_flow(self):
        spec = {"title": "t", "lang": "en", "diagrams": [{"id": "s", "title": "s", "nodes": [
            {"id": "svc", "title": "Order service"}, {"id": "db", "shape": "database", "title": "Orders"},
            {"id": "rep", "shape": "database", "title": "Orders replica"}, {"id": "q", "shape": "queue", "title": "Events"},
            {"id": "worker", "title": "Mail worker"}],
            "edges": [{"from": "svc", "to": "db"}, {"from": "db", "to": "rep", "kind": "async"}, {"from": "svc", "to": "q", "kind": "async"}]}]}
        by = {}
        for s in assist.suggest(spec)["suggestions"]:
            by.setdefault(s["node"], []).append(s)
        # a queue that only receives gets a consumer; the worker writes to the primary database, not the replica
        self.assertIn("Connect it to the existing Mail worker", [s["label"] for s in by["q"]])
        wires = [s["ops"] for s in by["worker"] if s.get("ops") and s["ops"][0]["op"] == "connect"]
        self.assertEqual(wires[0], [{"op": "connect", "from": "worker", "to": "db", "kind": "storage"}])
        self.assertNotIn("rep", by)  # a replica does not get a replica of its own

    def test_typos_and_other_layouts(self):
        # a misspelled near or clock is an error, not a silent success
        with self.assertRaises(assist.AssistError):
            assist.insert_pattern(copy.deepcopy(CDC), "sync2", near="ff99", diagram="cdc")
        with self.assertRaises(assist.AssistError):
            assist.insert_pattern(copy.deepcopy(CDC), "sync2", near="ff3", clock="nope", diagram="cdc")
        # "fixed" is a hand-placed layout too: a new block keeps the place it was given
        spec = copy.deepcopy(CDC)
        spec["diagrams"][1]["layout"] = "fixed"
        out = assist.apply_ops(spec, [{"op": "addNode", "node": {"id": "n9", "shape": "dff", "title": "n9", "x": 300, "y": 300}}], diagram="cdc")
        n9 = [n for n in out["spec"]["diagrams"][1]["nodes"] if n["id"] == "n9"][0]
        self.assertEqual((n9["x"], n9["y"]), (300, 300))
        # a block name one letter off, but as close to several blocks, is never fixed without asking
        spec = copy.deepcopy(CDC)
        spec["diagrams"][1]["edges"].append({"from": "ff3", "to": "ff4"})
        fixes = [f for c in assist.suggest(spec, diagram="cdc")["checks"] if "ff4" in c["text"] for f in c["fixes"]]
        self.assertTrue(fixes and not any(f["safe"] for f in fixes))
        self.assertTrue(any(f["ops"][0]["op"] == "addNode" and f["ops"][0]["node"]["id"] == "ff4" for f in fixes))  # or add the block

    def test_a_grown_diagram_gets_frames(self):
        nodes, edges = [{"id": "ca", "shape": "clock", "title": "clk_a", "x": 40, "y": 100}, {"id": "cb", "shape": "clock", "title": "clk_b", "x": 40, "y": 400}], []
        for dom, y, clock in (("a", 60, "ca"), ("b", 360, "cb")):
            for i in range(3):
                nid = f"{dom}{i}"
                nodes.append({"id": nid, "shape": "dff", "title": nid, "x": 160 + i * 140, "y": y})
                edges.append({"from": clock, "to": nid, "fromAnchor": [1, 0.5], "toAnchor": [0, 0.72], "kind": "clock"})
                if i:
                    edges.append({"from": f"{dom}{i - 1}", "to": nid, "fromAnchor": [1, 0.3], "toAnchor": [0, 0.3]})
        spec = {"title": "t", "lang": "en", "diagrams": [{"id": "c", "title": "c", "layout": "manual", "nodes": nodes, "edges": edges}]}
        steps = [s for s in assist.suggest(spec)["nextSteps"] if s["label"].startswith("Frame")]
        self.assertEqual([s["label"] for s in steps], ["Frame the 3 blocks clocked by clk_a as one clock domain", "Frame the 3 blocks clocked by clk_b as one clock domain"])
        framed = assist.apply_ops(spec, steps[0]["ops"])
        self.assertEqual(framed["checks"], [])
        self.assertEqual({n["id"] for n in framed["spec"]["diagrams"][0]["nodes"] if n.get("group")}, {"ca", "a0", "a1", "a2"})


if __name__ == "__main__":
    unittest.main()
