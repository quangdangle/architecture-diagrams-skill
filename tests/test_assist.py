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
        # this drawing runs the clock to the second and third flop under the first one: that is advice with its fix
        under = [c for c in framed["checks"] if c.get("soft") and (c.get("fixes") or [{}])[0].get("ops") == [{"op": "routeAround"}]]
        self.assertEqual([c for c in framed["checks"] if c not in under], [])
        self.assertTrue(under)
        self.assertEqual({n["id"] for n in framed["spec"]["diagrams"][0]["nodes"] if n.get("group")}, {"ca", "a0", "a1", "a2"})


if __name__ == "__main__":
    unittest.main()


class DetailBoards(unittest.TestCase):
    """Detail boards, inside tabs and port names (assets/js/hier.js), through the same headless page as the other commands."""

    @classmethod
    def setUpClass(cls):
        if not find_browser():
            raise unittest.SkipTest("needs Chrome, Chromium, Edge or Brave")

    def test_board_wires_stay_clear_of_other_frames(self):
        for name in ("soc-block-diagram.json", "clock-reset-tree.json", "web-app-icons.json"):
            spec = json.loads((SKILL / "examples" / name).read_text(encoding="utf-8"))
            result = assist.build_board(spec)
            with self.subTest(example=name):
                self.assertEqual(result.get("tangles"), 0, name)
                board = [d for d in result["spec"]["diagrams"] if d.get("boardOf")][0]
                frames = [g for g in board["groups"] if g.get("source")]
                overview = [d for d in result["spec"]["diagrams"] if d.get("id") == board["boardOf"]][0]
                self.assertEqual(len(frames), len(overview["nodes"]))
                self.assertEqual(len(board["edges"]), len(overview.get("edges") or []))

    def test_bus_interfaces_keep_their_names_and_other_names_get_a_fix(self):
        spec = json.loads((SKILL / "examples" / "soc-block-diagram.json").read_text(encoding="utf-8"))
        tab = spec["diagrams"][0]
        card = [n for n in tab["nodes"] if "s_axi_cpu" in json.dumps(n.get("ports", {}))][0]
        card["ports"]["in"].append("DataReady")
        result = assist.suggest(spec)
        naming = [c for c in result["checks"] if "DataReady" in c["text"]]
        self.assertEqual(len(naming), 1, [c["text"] for c in result["checks"]])
        self.assertTrue(naming[0].get("soft"))
        self.assertNotIn("s_axi_cpu", naming[0]["text"])
        fixed = assist.apply_ops(spec, naming[0]["fixes"][0]["ops"], diagram=tab["id"])
        ports = [n for n in fixed["spec"]["diagrams"][0]["nodes"] if n["id"] == card["id"]][0]["ports"]
        self.assertIn("i_data_ready", ports["in"])
        self.assertIn("s_axi_cpu", ports["in"])
        self.assertIn("m_apb", ports["out"])

    def test_a_block_added_to_an_ordinary_group_keeps_its_place(self):
        spec = {"title": "t", "diagrams": [{"id": "m", "title": "m", "layout": "manual",
                "groups": [{"id": "g", "label": "G", "x": 0, "y": 0, "w": 300, "h": 200}],
                "nodes": [{"id": "a", "title": "A", "group": "g", "x": 40, "y": 60}]}]}
        result = assist.apply_ops(spec, [{"op": "addNode", "node": {"id": "b", "title": "B", "group": "g", "x": 500, "y": 400}}], diagram="m")
        b = [n for n in result["spec"]["diagrams"][0]["nodes"] if n["id"] == "b"][0]
        g = result["spec"]["diagrams"][0]["groups"][0]
        self.assertEqual((b["x"], b["y"]), (500, 400))
        self.assertEqual((g["w"], g["h"]), (300, 200))

    def test_a_block_added_to_a_board_frame_lands_inside_it(self):
        spec = json.loads((SKILL / "examples" / "soc-block-diagram.json").read_text(encoding="utf-8"))
        board = assist.build_board(spec)
        tab = board["board"]
        result = assist.apply_ops(board["spec"], [{"op": "addNode", "node": {"id": "u_fifo", "title": "u_fifo", "shape": "fifo", "group": "uart", "x": 0, "y": 0}}], diagram=tab)
        d = [x for x in result["spec"]["diagrams"] if x.get("id") == tab][0]
        n = [x for x in d["nodes"] if x["id"] == "u_fifo"][0]
        f = [g for g in d["groups"] if g["id"] == "uart"][0]
        self.assertTrue(f["x"] < n["x"] < f["x"] + f["w"] and f["y"] < n["y"] < f["y"] + f["h"], (n, f))

    def test_inputs_with_the_same_name_get_one_port_each(self):
        spec = {"title": "t", "diagrams": [{"id": "soc", "title": "SoC", "nodes": [
            {"id": "uart", "title": "UART"}, {"id": "gpio", "title": "GPIO"}, {"id": "plic", "title": "PLIC"}],
            "edges": [{"from": "uart", "to": "plic", "label": "IRQ"}, {"from": "gpio", "to": "plic", "label": "IRQ"}]}]}
        result = assist.build_board(spec)
        board = [d for d in result["spec"]["diagrams"] if d.get("boardOf")][0]
        names = sorted(n["port"]["name"] for n in board["nodes"] if n.get("port", {}).get("of") == "plic")
        self.assertEqual(names, ["i_irq_gpio", "i_irq_uart"])
        self.assertFalse([c for c in result["checks"] if "receives" in c["text"]], result["checks"])

    def test_tidy_lays_out_an_ai_drawing_inside_its_frame(self):
        spec = json.loads((SKILL / "examples" / "soc-block-diagram.json").read_text(encoding="utf-8"))
        board = assist.build_board(spec)
        tab = board["board"]
        before = {g["id"]: g for g in [d for d in board["spec"]["diagrams"] if d.get("id") == tab][0]["groups"] if g.get("source")}
        ops = json.loads((ROOT / "tests" / "fixtures" / "uart_inside_ops.json").read_text(encoding="utf-8"))["ops"]
        result = assist.apply_ops(board["spec"], ops + [{"op": "tidyFrame", "id": "uart"}], diagram=tab)
        self.assertFalse([c for c in result["checks"] if not c.get("soft")], result["checks"])
        d = [x for x in result["spec"]["diagrams"] if x.get("id") == tab][0]
        frames = {g["id"]: g for g in d["groups"] if g.get("source")}
        f = frames["uart"]
        inside = [n for n in d["nodes"] if n.get("group") == "uart" and not n.get("port")]
        self.assertEqual(len(inside), 6)
        boxes = []
        for n in inside:
            w, h = (216, 70) if not n.get("shape") else (n.get("w", 80), n.get("h", 40))
            self.assertTrue(f["x"] < n["x"] and n["x"] + w < f["x"] + f["w"] and f["y"] < n["y"] and n["y"] + h < f["y"] + f["h"], (n, f))
            boxes.append((n["x"], n["y"], w, h, n["id"]))
        for i, a in enumerate(boxes):
            for b in boxes[i + 1:]:
                self.assertFalse(a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3], (a, b))
        # the new serial ports follow the RTL habit, and their inner wires stay on the inner pin
        ports = {n["port"]["name"]: n for n in d["nodes"] if n.get("port", {}).get("of") == "uart"}
        self.assertLess(ports["i_rx"]["x"], f["x"] + 10)
        self.assertGreater(ports["o_tx"]["x"], f["x"] + f["w"] - 60)
        rx = [e for e in d["edges"] if e["from"] == ports["i_rx"]["id"]][0]
        self.assertEqual(rx["fromAnchor"]["x"], 1, rx)
        self.assertFalse([c for c in result["checks"] if "not wired inside" in c["text"]], result["checks"])
        # room is made the way an editor inserts space: the row keeps its order and its line
        row = ["qspi", "gpio", "plic"]
        self.assertEqual([frames[k]["y"] for k in row], [before[k]["y"] for k in row])
        xs = [frames[k]["x"] for k in ["uart"] + row]
        self.assertEqual(xs, sorted(xs))
        self.assertGreaterEqual(frames["qspi"]["x"], f["x"] + f["w"] + 40)

    def test_inside_tab_gets_the_frame_ports(self):
        spec = json.loads((SKILL / "examples" / "soc-block-diagram.json").read_text(encoding="utf-8"))
        board = assist.build_board(spec)
        inside = assist.open_inside(board["spec"], "uart", diagram=board["board"])
        tabs = {d.get("id"): d for d in inside["spec"]["diagrams"]}
        frame_ports = sorted(n["id"] for n in tabs[board["board"]]["nodes"] if n.get("port", {}).get("of") == "uart")
        tab_ports = sorted(n["id"] for n in tabs[inside["inside"]]["nodes"] if n.get("port"))
        self.assertTrue(frame_ports)
        self.assertEqual(frame_ports, tab_ports)
        self.assertEqual(tabs[inside["inside"]]["detailOf"], {"tab": board["board"], "block": "uart"})


class RedrawFindings(unittest.TestCase):
    """Bugs found when an agent redrew the OpenTitan Earl Grey top level with the tool (25/09/2026)."""

    @classmethod
    def setUpClass(cls):
        if not find_browser():
            raise unittest.SkipTest("needs Chrome, Chromium, Edge or Brave")

    @staticmethod
    def soc():
        return {"title": "t", "diagrams": [{"id": "top", "title": "Top", "groups": [{"id": "aon", "label": "Always on"}, {"id": "pd", "label": "Power domain", "hidden": True}],
                "nodes": [{"id": "osc", "title": "Oscillator", "shape": "oscillator"}, {"id": "clkmgr", "title": "Clock manager", "group": "aon"},
                          {"id": "cpu", "title": "CPU", "group": "pd"}, {"id": "xbar", "title": "TL-UL crossbar", "group": "pd"}, {"id": "uart", "title": "UART"}],
                "edges": [{"from": "osc", "to": "clkmgr", "kind": "clock", "label": "clk"}, {"from": "cpu", "to": "xbar", "kind": "bus"}, {"from": "xbar", "to": "uart", "kind": "bus"}]}]}

    def test_updates_keep_every_field_they_are_given_and_refuse_unknown_ones(self):
        spec = self.soc()
        out = assist.apply_ops(spec, [{"op": "updateEdge", "from": "cpu", "to": "xbar", "set": {"fromAnchor": [1, 0.5], "toAnchor": [0, 0.5]}},
                                      {"op": "updateDiagram", "set": {"legend": {"colors": {"blue": "hosts"}}, "summary": "Top level"}}], diagram="top")
        d = out["spec"]["diagrams"][0]
        e = [x for x in d["edges"] if x["from"] == "cpu"][0]
        self.assertEqual((e["fromAnchor"], e["toAnchor"]), ([1, 0.5], [0, 0.5]))
        self.assertEqual(d["legend"], {"colors": {"blue": "hosts"}})
        with self.assertRaises(assist.AssistError) as caught:
            assist.apply_ops(spec, [{"op": "updateEdge", "from": "cpu", "to": "xbar", "set": {"colour": "red"}}], diagram="top")
        self.assertIn("colour", str(caught.exception))
        same = assist.apply_ops(spec, [{"op": "renameNode", "id": "uart", "to": "uart"}], diagram="top")
        self.assertIn("uart", [n["id"] for n in same["spec"]["diagrams"][0]["nodes"]])

    def test_the_board_keeps_hidden_groups_and_follows_edits_made_with_ops(self):
        board = assist.build_board(self.soc())
        b = [d for d in board["spec"]["diagrams"] if d.get("boardOf")][0]
        self.assertTrue([g for g in b["groups"] if g["id"] == "pd"][0].get("hidden"))
        after = assist.apply_ops(board["spec"], [{"op": "connect", "from": "cpu", "to": "uart", "label": "debug"}], diagram="top")
        b2 = [d for d in after["spec"]["diagrams"] if d.get("boardOf")][0]
        self.assertEqual(len(b2["edges"]), len(b["edges"]) + 1)

    def test_patterns_next_to_a_clock_port_use_its_inner_pin(self):
        board = assist.build_board(self.soc())
        tab = board["board"]
        b = [d for d in board["spec"]["diagrams"] if d.get("id") == tab][0]
        port = [n for n in b["nodes"] if n.get("port", {}).get("of") == "clkmgr" and n["port"].get("kind") == "clock"][0]
        div = assist.insert_pattern(board["spec"], "clkdiv2", near=port["id"], diagram=tab)
        d = [x for x in div["spec"]["diagrams"] if x.get("id") == tab][0]
        wires = [e for e in d["edges"] if e["from"] == port["id"] or e["to"] == port["id"]]
        inner = {"x": 0.5, "y": 1} if port["shape"].endswith("-v") else {"x": 1, "y": 0.5}
        self.assertTrue(any(e["from"] == port["id"] and e.get("kind") == "clock" and e["to"] != port["id"] and
                            {k: e["fromAnchor"][k] for k in ("x", "y")} == inner for e in wires if e.get("source") is None), wires)
        self.assertFalse([e for e in wires if e["to"] == port["id"] and not e.get("source")], wires)
        self.assertEqual(len([n for n in d["nodes"] if n.get("shape") == "oscillator"]), 0)
        icg = assist.insert_pattern(board["spec"], "icg", near=port["id"], clock=port["id"], diagram=tab)
        d = [x for x in icg["spec"]["diagrams"] if x.get("id") == tab][0]
        latch = [n for n in d["nodes"] if n.get("shape") == "latch"][0]
        into_d = [e for e in d["edges"] if e["to"] == latch["id"] and (e.get("toAnchor") or {}).get("y") == 0.3]
        self.assertTrue(into_d and all(e["from"] != port["id"] for e in into_d), into_d)

    def test_a_loop_moves_with_its_block(self):
        spec = {"title": "t", "diagrams": [{"id": "c", "title": "c", "layout": "manual", "nodes": [{"id": "ff", "shape": "dff", "x": 100, "y": 100}],
                "edges": [{"from": "ff", "fromAnchor": [1, 0.78], "to": "ff", "toAnchor": [0, 0.3], "points": [[180, 160], [80, 160]]}]}]}
        out = assist.apply_ops(spec, [{"op": "updateNode", "id": "ff", "set": {"x": 300, "y": 150}}], diagram="c")
        self.assertEqual(out["spec"]["diagrams"][0]["edges"][0]["points"], [[380, 210], [280, 210]])

    def test_a_clock_tree_next_to_a_clock_manager_joins_its_group_without_a_second_clock(self):
        out = assist.insert_pattern(self.soc(), "clktree", near="clkmgr", diagram="top")
        d = out["spec"]["diagrams"][0]
        self.assertEqual({n.get("group") for n in d["nodes"] if n["id"] in ("pll", "div")}, {"aon"})
        self.assertFalse([e for e in d["edges"] if e["from"] == "clkmgr" and e["to"] == "pll"])

    def test_an_empty_tab_is_a_place_to_start(self):
        spec = {"title": "t", "diagrams": [{"id": "top", "title": "Top"}]}
        errors, warnings = validate_spec(spec)
        self.assertEqual(errors, [])
        self.assertTrue(any("no blocks yet" in w for w in warnings))
        steps = assist.suggest(spec)["nextSteps"]
        self.assertTrue(len(steps) >= 5 and all(s.get("pattern") for s in steps), steps)


class ArrangeChip(unittest.TestCase):
    """The arrange operation: a chip overview laid out around its buses (found when a newcomer asked the page's AI to draw
    OpenTitan Earl Grey and then to make it readable, 25/09/2026)."""

    @classmethod
    def setUpClass(cls):
        if not find_browser():
            raise unittest.SkipTest("needs Chrome, Chromium, Edge or Brave")

    @staticmethod
    def chip():
        nodes = [{"id": "cpu", "title": "Ibex core", "group": "core"}, {"id": "dm", "title": "Debug module", "group": "core"},
                 {"id": "xm", "title": "TL-UL crossbar main"}, {"id": "xp", "title": "TL-UL crossbar peripheral"},
                 {"id": "rom", "title": "ROM", "group": "mem"}, {"id": "sram", "title": "SRAM", "group": "mem"},
                 {"id": "fctl", "title": "Flash controller", "group": "mem"}, {"id": "flash", "title": "Embedded flash", "group": "mem"},
                 {"id": "aes", "title": "AES", "group": "crypto"}, {"id": "hmac", "title": "HMAC", "group": "crypto"}]
        nodes += [{"id": p, "title": p.upper(), "group": "io"} for p in ("uart", "gpio", "spi", "i2c", "usb")]
        edges = [{"from": "cpu", "to": "xm", "kind": "bus"}, {"from": "dm", "to": "xm", "kind": "bus"}, {"from": "xm", "to": "xp", "kind": "bus"}]
        edges += [{"from": "xm", "to": d, "kind": "bus"} for d in ("rom", "sram", "fctl", "aes", "hmac")]
        edges += [{"from": "xp", "to": d, "kind": "bus"} for d in ("uart", "gpio", "spi", "i2c", "usb")]
        edges += [{"from": "fctl", "to": "flash"}, {"from": "uart", "to": "cpu", "kind": "async", "label": "irq"}]
        return {"title": "t", "diagrams": [{"id": "top", "title": "Chip", "nodes": nodes, "edges": edges,
                "groups": [{"id": g} for g in ("core", "mem", "crypto", "io")]}]}

    def test_buses_become_bars_with_their_blocks_around_them(self):
        steps = assist.suggest(self.chip())["nextSteps"]
        arrange = [s for s in steps if (s.get("ops") or [{}])[0].get("op") == "arrange"]
        self.assertTrue(arrange, steps)
        out = assist.apply_ops(self.chip(), arrange[0]["ops"], diagram="top")
        d = out["spec"]["diagrams"][0]
        n = {x["id"]: x for x in d["nodes"]}
        self.assertEqual((d["layout"], d["route"]), ("manual", "orthogonal"))
        self.assertTrue(n["xm"]["w"] >= 640 and n["xp"]["w"] >= 640)
        self.assertLess(n["cpu"]["y"], n["xm"]["y"])
        self.assertLess(n["xm"]["y"], n["rom"]["y"])
        self.assertLess(n["xm"]["y"], n["xp"]["y"])
        self.assertEqual(n["flash"]["y"], n["fctl"]["y"])
        self.assertGreater(n["flash"]["x"], n["fctl"]["x"])
        rows = {}
        for x in d["nodes"]:
            if x["id"] not in ("xm", "xp"):
                rows.setdefault(x["y"], []).append((x["x"], x["x"] + 216, x["id"]))
        for row in rows.values():
            row.sort()
            for a, b in zip(row, row[1:]):
                self.assertLessEqual(a[1], b[0], (a, b))
        for e in d["edges"]:
            if e.get("kind") == "bus" and {e["from"], e["to"]} & {"xm", "xp"} and not {e["from"], e["to"]} <= {"xm", "xp"}:
                self.assertIn(e["fromAnchor"][1], (0, 1), e)
                self.assertIn(e["toAnchor"][1], (0, 1), e)
        again = assist.apply_ops(out["spec"], [{"op": "arrange", "style": "bus"}], diagram="top")
        self.assertEqual([(x["x"], x["y"]) for x in again["spec"]["diagrams"][0]["nodes"]], [(x["x"], x["y"]) for x in d["nodes"]])

    def test_a_tab_without_a_bus_says_why(self):
        spec = {"title": "t", "diagrams": [{"id": "f", "title": "Flow", "nodes": [{"id": "a"}, {"id": "b"}], "edges": [{"from": "a", "to": "b"}]}]}
        with self.assertRaises(assist.AssistError) as caught:
            assist.apply_ops(spec, [{"op": "arrange", "style": "bus"}], diagram="f")
        self.assertIn("bus", str(caught.exception))


class ArrangeStages(unittest.TestCase):
    """The pipeline arrangement and the wire-under-block check (found when a newcomer asked the page's AI for the CVA6 core:
    the automatic layout ran wires through blocks, caches covered the columns and notes covered blocks, 25/09/2026)."""

    @classmethod
    def setUpClass(cls):
        if not find_browser():
            raise unittest.SkipTest("needs Chrome, Chromium, Edge or Brave")

    @staticmethod
    def core():
        def g(i, t, grp):
            return {"id": i, "title": t, "group": grp}

        def e(a, b, label=None, kind=None):
            return {k: v for k, v in (("from", a), ("to", b), ("label", label), ("kind", kind)) if v}
        nodes = [g("pc", "PC generation", "fe"), g("fetch", "Instruction fetch", "fe"), g("bp", "Branch predictor", "fe"),
                 g("dec", "Decoder", "de"), g("sb", "Scoreboard", "is"), g("rf", "Register file", "is"), g("iq", "Issue queue", "is"),
                 g("alu", "ALU", "ex"), g("mul", "Multiplier", "ex"), g("lsu", "Load/store unit", "ex"), g("cm", "Commit", "co"),
                 {"id": "ic", "title": "I-cache", "shape": "ram"}, {"id": "dc", "title": "D-cache", "shape": "ram"}]
        edges = [e("pc", "ic", "fetch address"), e("ic", "fetch", "instructions"), e("fetch", "bp"), e("bp", "pc", "predicted PC"),
                 e("fetch", "dec", "raw instruction"), e("dec", "sb", "micro-op"), e("sb", "iq", "tracked"), e("rf", "iq", "operands")]
        edges += [e("iq", u, "dispatch") for u in ("alu", "mul", "lsu")]
        edges += [e(u, "cm", "result") for u in ("alu", "mul", "lsu")]
        edges += [e("lsu", "dc", "address"), e("dc", "lsu", "load data"), e("cm", "rf", "writeback", "feedback"), e("cm", "pc", "redirect", "feedback")]
        notes = [{"id": "n1", "text": "Single issue, several units execute in parallel.", "attach": "ex", "dx": 5, "dy": 5},
                 {"id": "n2", "text": "Loads wait for the D-cache.", "attach": "lsu"}]
        return {"title": "t", "diagrams": [{"id": "core", "title": "Core", "nodes": nodes, "edges": edges, "notes": notes,
                "groups": [{"id": x, "label": x.upper()} for x in ("fe", "de", "is", "ex", "co")]}]}

    def test_stages_become_columns_with_no_wire_under_a_block(self):
        steps = assist.suggest(self.core())["nextSteps"]
        arrange = [s for s in steps if (s.get("ops") or [{}])[0].get("op") == "arrange"]
        self.assertTrue(arrange and arrange[0]["ops"][0]["style"] == "stages", steps)
        out = assist.apply_ops(self.core(), arrange[0]["ops"], diagram="core")
        d = out["spec"]["diagrams"][0]
        n = {x["id"]: x for x in d["nodes"]}
        self.assertEqual((d["layout"], d["route"], d["arranged"]), ("manual", "orthogonal", "stages"))
        left = {grp: min(x["x"] for x in d["nodes"] if x.get("group") == grp) for grp in ("fe", "de", "is", "ex", "co")}
        self.assertEqual(sorted(left, key=left.get), ["fe", "de", "is", "ex", "co"])
        # a stage is stacked the way its wires run, through its cache: PC, fetch, then the predictor
        self.assertLess(n["pc"]["y"], n["fetch"]["y"])
        self.assertLess(n["fetch"]["y"], n["bp"]["y"])
        # the caches sit above the stage they feed; the unit wired to the D-cache is on top of its column
        self.assertLess(n["ic"]["y"], n["pc"]["y"])
        self.assertLess(n["dc"]["y"], n["lsu"]["y"])
        self.assertLess(n["lsu"]["y"], min(n["alu"]["y"], n["mul"]["y"]))
        self.assertTrue(left["fe"] <= n["ic"]["x"] < left["de"], (n["ic"], left))
        # wires to the next stage leave on the right and enter on the left; wires back run under all the blocks
        for x in d["edges"]:
            if (x["from"], x["to"]) in (("dec", "sb"), ("iq", "alu"), ("mul", "cm")):
                self.assertEqual((x["fromAnchor"][0], x["toAnchor"][0]), (1, 0), x)
            if x.get("kind") == "feedback":
                self.assertGreater(max(p[1] for p in x["points"]), max(v["y"] for v in d["nodes"] if v.get("group")), x)
        self.assertFalse([c for c in out["checks"] if "under" in c["text"]], out["checks"])
        # notes are placed again, and the group boxes follow their blocks
        self.assertFalse([q for q in d["notes"] if "dx" in q or "x" in q], d["notes"])
        self.assertFalse([gr for gr in d["groups"] if "x" in gr], d["groups"])
        again = assist.apply_ops(out["spec"], [{"op": "arrange", "style": "stages"}], diagram="core")
        self.assertEqual([(x["x"], x["y"]) for x in again["spec"]["diagrams"][0]["nodes"]], [(x["x"], x["y"]) for x in d["nodes"]])

    def test_parallel_blocks_of_a_stage_become_sub_columns(self):
        # an out-of-order core in the style of XiangShan, as the page's AI drew it on 25/09/2026
        def g(i, grp, shape=None):
            return {k: v for k, v in (("id", i), ("title", i.upper()), ("group", grp), ("shape", shape)) if v}
        nodes = [g("fetch", "fe"), g("dec", "fe"), g("ren", "be"), g("disp", "be"), g("rob", "be", "fifo"),
                 g("irs", "ex", "fifo"), g("frs", "ex", "fifo"), g("alu", "ex"), g("fpu", "ex")]
        edges = [{"from": "fetch", "to": "dec"}, {"from": "dec", "to": "ren"}, {"from": "ren", "to": "disp"}, {"from": "disp", "to": "rob", "label": "alloc"},
                 {"from": "disp", "to": "irs", "label": "int uop"}, {"from": "disp", "to": "frs", "label": "fp uop"},
                 {"from": "irs", "to": "alu", "label": "issue"}, {"from": "frs", "to": "fpu", "label": "issue"},
                 {"from": "alu", "to": "rob", "label": "complete"}, {"from": "fpu", "to": "rob", "label": "complete"}]
        spec = {"title": "t", "diagrams": [{"id": "c", "title": "Core", "nodes": nodes, "edges": edges,
                "groups": [{"id": x, "label": x.upper()} for x in ("fe", "be", "ex")]}]}
        out = assist.apply_ops(spec, [{"op": "arrange", "style": "stages"}], diagram="c")
        d = out["spec"]["diagrams"][0]
        n = {x["id"]: x for x in d["nodes"]}
        e = {(x["from"], x["to"]): x for x in d["edges"]}
        # the queues in one sub-column, the units they feed in the next, each level with its queue
        self.assertEqual(n["irs"]["x"], n["frs"]["x"])
        self.assertGreater(n["alu"]["x"], n["irs"]["x"] + 100)
        self.assertLess(n["irs"]["y"], n["frs"]["y"])
        self.assertLess(n["alu"]["y"], n["fpu"]["y"])
        # the wires back into the reorder buffer are one bundle: one row, one lane up, one label spot
        a, b = e[("alu", "rob")], e[("fpu", "rob")]
        self.assertEqual((a["points"][1][1], a["points"][2][0]), (b["points"][1][1], b["points"][2][0]))
        self.assertEqual(a["toAnchor"], b["toAnchor"])
        # queue symbols: a wire leaving one takes its output pin, a wire into one its input pin; the bundle, two wires
        # into one queue, stays off the pin (an input pin takes one wire)
        self.assertEqual(e[("irs", "alu")]["fromAnchor"], {"x": 1, "y": 0.5, "perimeter": False})
        self.assertEqual(e[("disp", "irs")]["toAnchor"], {"x": 0, "y": 0.5, "perimeter": False})
        self.assertEqual(a["toAnchor"][0], 0)
        self.assertGreater(abs(a["toAnchor"][1] - 0.5), 0.05)
        self.assertEqual([c for c in out["checks"] if not c.get("soft")], [])
        self.assertFalse([c for c in out["checks"] if "under" in c["text"]], out["checks"])

    def test_stages_need_two_groups(self):
        spec = {"title": "t", "diagrams": [{"id": "f", "title": "Flow", "nodes": [{"id": "a"}, {"id": "b"}], "edges": [{"from": "a", "to": "b"}]}]}
        with self.assertRaises(assist.AssistError) as caught:
            assist.apply_ops(spec, [{"op": "arrange", "style": "stages"}], diagram="f")
        self.assertIn("group", str(caught.exception))

    def test_a_note_left_on_a_removed_wire_is_a_problem_with_fixes(self):
        spec = self.core()
        spec["diagrams"][0]["notes"].append({"id": "n3", "text": "Redirect on a mispredict", "kind": "reason", "attach": ["cm", "pc"]})
        out = assist.apply_ops(spec, [{"op": "disconnect", "from": "cm", "to": "pc"}], diagram="core")
        gone = [c for c in out["checks"] if "Redirect on a mispredict" in c["text"]]
        self.assertEqual(len(gone), 1, out["checks"])
        self.assertFalse(gone[0].get("soft"))
        self.assertEqual(gone[0]["fixes"][0]["ops"], [{"op": "updateNote", "id": "n3", "set": {"attach": "cm"}}])
        fixed = assist.apply_ops(out["spec"], gone[0]["fixes"][0]["ops"], diagram="core")
        self.assertFalse([c for c in fixed["checks"] if "Redirect on a mispredict" in c["text"]], fixed["checks"])

    def test_a_wire_under_a_block_is_flagged_and_routed_round(self):
        nodes = [{"id": "a", "title": "Source", "x": 100, "y": 60}, {"id": "b", "title": "In the way", "x": 100, "y": 200},
                 {"id": "c", "title": "Sink", "x": 100, "y": 340}]
        spec = {"title": "t", "diagrams": [{"id": "m", "title": "Hand placed", "layout": "manual", "route": "orthogonal", "nodes": nodes,
                "edges": [{"from": "a", "to": "b"}, {"from": "b", "to": "c"}, {"from": "a", "to": "c", "label": "bypass"}]}]}
        checks = assist.apply_ops(spec, [], diagram="m")["checks"]
        under = [c for c in checks if "under" in c["text"]]
        self.assertEqual(len(under), 1, checks)
        self.assertTrue(under[0]["soft"])
        self.assertIn("In the way", under[0]["text"])
        self.assertEqual(under[0]["fixes"][0]["ops"], [{"op": "routeAround"}])
        out = assist.apply_ops(spec, under[0]["fixes"][0]["ops"], diagram="m")
        bypass = [x for x in out["spec"]["diagrams"][0]["edges"] if x["from"] == "a" and x["to"] == "c"][0]
        self.assertTrue(bypass.get("points") and bypass.get("fromAnchor") and bypass.get("toAnchor"), bypass)
        self.assertFalse([c for c in out["checks"] if "under" in c["text"]], out["checks"])

