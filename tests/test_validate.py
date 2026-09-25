"""Unit tests for scripts/validate.py: the wiring rules that match the editor's Checks list, and the detail boards,
detail tabs and sticky notes of v1.2."""

import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT / "architecture-diagrams" / "scripts"))
from validate import validate_spec  # noqa: E402

CDC = json.loads((ROOT / "architecture-diagrams" / "examples" / "clock-reset-tree.json").read_text(encoding="utf-8"))


def check(mutate):
    spec = copy.deepcopy(CDC)
    mutate(spec["diagrams"][1])
    errors, warnings = validate_spec(spec)
    return errors, "\n".join(warnings)


class WiringRules(unittest.TestCase):
    def test_clean_example_has_no_wiring_warnings(self):
        errors, warnings = check(lambda d: None)
        self.assertEqual(errors, [])
        self.assertEqual(warnings, "")

    def test_reversed_wire(self):
        def m(d):
            d["edges"][1] = {"from": "ff2", "to": "ff1", "fromAnchor": [0, 0.3], "toAnchor": [1, 0.3]}
        self.assertIn("runs backwards, from input sync2.D into output sync1.Q", check(m)[1])

    def test_two_outputs(self):
        def m(d):
            d["edges"].append({"from": "ff1", "to": "ff3", "fromAnchor": [1, 0.3], "toAnchor": [1, 0.78]})
        self.assertIn("joins two outputs, sync1.Q and sync3.QN", check(m)[1])

    def test_two_sources_on_one_input(self):
        def m(d):
            d["edges"].append({"from": "clka", "to": "ff3", "fromAnchor": [1, 0.5], "toAnchor": [0, 0.3]})
        self.assertIn("input sync3.D receives 2 signals", check(m)[1])

    def test_wire_leaving_an_input_and_entering_an_output(self):
        def m(d):
            d["edges"].append({"from": "ff3", "to": "out", "fromAnchor": [0, 0.3]})
            d["edges"].append({"from": "out", "to": "ffa", "toAnchor": [1, 0.3]})
        warnings = check(m)[1]
        self.assertIn("leaves from input sync3.D", warnings)
        self.assertIn("goes into output req_a.Q", warnings)

    def test_missing_clock_on_a_wired_flip_flop(self):
        def m(d):
            del d["edges"][9]
        self.assertIn('node "ff3" is wired pin by pin but its CLK pin has no wire', check(m)[1])

    def test_net_between_two_inputs_is_allowed(self):
        def m(d):
            d["edges"].append({"from": "ff1", "to": "ff2", "fromAnchor": [0, 0.72], "toAnchor": [0, 0.72], "dir": "none", "kind": "clock"})
        self.assertEqual(check(m)[1], "")

    def test_stacked_blocks(self):
        def m(d):
            d["nodes"].append({"id": "u2", "title": "U2", "shape": "and", "x": 790, "y": 90})
        self.assertIn('node "u2" sits on top of node "and"', check(m)[1])

    def test_back_arrow_reverses_the_direction(self):
        def m(d):
            d["edges"][1] = {"from": "ff2", "to": "ff1", "fromAnchor": [0, 0.3], "toAnchor": [1, 0.3], "dir": "back"}
        self.assertEqual(check(m)[1], "")


# An overview, the detail board made from it, a detail tab for an overview block (cpu) and one for a board frame (f_bus).
BOARD = {
    "title": "Sensor hub",
    "lang": "en",
    "diagrams": [
        {
            "id": "overview",
            "title": "System overview",
            "summary": "The CPU reads the ADC over the AHB bus.",
            "nodes": [
                {"id": "cpu", "title": "CPU", "detail": "cpu-inside"},
                {"id": "bus", "title": "AHB bus"},
                {"id": "adc", "title": "ADC"},
            ],
            "edges": [
                {"from": "cpu", "to": "bus", "label": "AHB", "kind": "bus"},
                {"from": "bus", "to": "adc"},
            ],
            "notes": [
                {"id": "n1", "text": "Runs at 100 MHz.", "kind": "constraint", "attach": "cpu", "dx": 8, "dy": -8,
                 "date": "2026-09-25", "by": "Quang"},
                {"id": "n2", "text": "AHB because the ADC is slow.", "kind": "reason", "attach": ["cpu", "bus"]},
                {"id": "n3", "text": "Is one ADC enough?", "kind": "question"},
            ],
        },
        {
            "id": "board",
            "title": "Detail board",
            "summary": "Each overview block is a frame with its ports; draw the inside of each frame.",
            "boardOf": "overview",
            "layout": "manual",
            "groups": [
                {"id": "f_cpu", "label": "CPU", "source": "cpu", "x": 0, "y": 0, "w": 300, "h": 200},
                {"id": "f_bus", "label": "AHB bus", "source": "bus", "detail": "bus-inside", "x": 400, "y": 0, "w": 300, "h": 200},
                {"id": "f_adc", "label": "ADC", "source": "adc", "x": 800, "y": 0, "w": 300, "h": 200},
            ],
            "nodes": [
                {"id": "cpu_m", "port": {"of": "f_cpu", "name": "AHB", "dir": "out", "kind": "bus"}, "x": 290, "y": 90},
                {"id": "bus_s", "port": {"of": "f_bus", "name": "AHB", "dir": "in", "kind": "bus"}, "x": 390, "y": 90},
                {"id": "bus_m", "port": {"of": "f_bus", "name": "ADC", "dir": "out"}, "x": 690, "y": 90},
                {"id": "adc_s", "port": {"of": "f_adc", "name": "BUS", "dir": "inout"}, "x": 790, "y": 90},
                {"id": "alu", "title": "ALU", "group": "f_cpu", "x": 40, "y": 60},
            ],
            "edges": [
                {"from": "cpu_m", "to": "bus_s", "kind": "bus", "source": "cpu>bus:AHB"},
                {"from": "bus_m", "to": "adc_s", "source": "bus>adc"},
            ],
            "notes": [
                {"id": "t1", "text": "Pick the FIFO depth.", "kind": "todo", "attach": "f_bus", "dx": 0, "dy": 0},
                {"id": "c1", "text": "Was APB until September.", "kind": "change", "attach": ["cpu_m", "bus_s"]},
                {"id": "l1", "text": "Frames come from the overview.", "kind": "legend", "x": 0, "y": 260, "w": 240},
                {"id": "n1", "text": "A plain note.", "kind": "note", "x": 400, "y": 260, "w": 80},
            ],
        },
        {
            "id": "cpu-inside",
            "title": "Inside the CPU",
            "summary": "The core drives the AHB port on the tab border.",
            "detailOf": {"tab": "overview", "block": "cpu"},
            "nodes": [
                {"id": "core", "title": "Core"},
                {"id": "ahb", "port": {"name": "AHB", "dir": "out", "kind": "bus"}},
            ],
            "edges": [{"from": "core", "to": "ahb", "kind": "bus"}],
            "notes": [{"id": "n1", "text": "A free note; the layout places it."}],
        },
        {
            "id": "bus-inside",
            "title": "Inside the bus",
            "summary": "The decoder sends each request to the ADC port.",
            "detailOf": {"tab": "board", "block": "f_bus"},
            "nodes": [
                {"id": "s", "port": {"of": "", "name": "AHB", "dir": "in"}},
                {"id": "dec", "title": "Decoder"},
                {"id": "m", "port": {"name": "ADC", "dir": "out"}},
            ],
            "edges": [{"from": "s", "to": "dec"}, {"from": "dec", "to": "m"}],
        },
    ],
}


def check_tabs(mutate):
    spec = copy.deepcopy(BOARD)
    mutate(spec)
    errors, warnings = validate_spec(spec)
    return "\n".join(errors), "\n".join(warnings)


def tab(spec, tid):
    return next(d for d in spec["diagrams"] if d.get("id") == tid)


class BoardAndDetailTabs(unittest.TestCase):
    def test_clean_board_detail_tabs_and_notes(self):
        # Every new field is known (no unknown-field warning), port nodes need no title, note ids repeat across tabs.
        self.assertEqual(check_tabs(lambda s: None), ("", ""))

    def test_board_of_a_missing_tab(self):
        errors = check_tabs(lambda s: tab(s, "board").update(boardOf="overveiw"))[0]
        self.assertIn('diagram "board": "boardOf" names tab "overveiw", which is not in this spec. Did you mean "overview"?', errors)

    def test_board_of_a_tab_that_is_not_a_graph(self):
        def m(s):
            s["diagrams"].append({"id": "timing", "type": "wave", "title": "Timing", "summary": "The bus clock.",
                                  "wave": {"signal": [{"name": "clk", "wave": "p...."}]}})
            tab(s, "board")["boardOf"] = "timing"
        self.assertIn('diagram "board": "boardOf" names tab "timing", which is not a graph', check_tabs(m)[0])

    def test_board_of_itself(self):
        self.assertIn('diagram "board": "boardOf" names this tab itself', check_tabs(lambda s: tab(s, "board").update(boardOf="board"))[0])
        self.assertIn('"boardOf" must be the id of the overview tab', check_tabs(lambda s: tab(s, "board").update(boardOf=["overview"]))[0])

    def test_frame_whose_block_left_the_overview(self):
        def m(s):
            tab(s, "board")["groups"][2]["source"] = "sensor"
        errors, warnings = check_tabs(m)
        self.assertEqual(errors, "")
        self.assertIn('diagram "board": frame "f_adc" stands for block "sensor", which is no longer in "System overview".', warnings)

        def untitled(s):
            m(s)
            del tab(s, "overview")["title"]
        self.assertIn('which is no longer in tab "overview".', check_tabs(untitled)[1])
        self.assertIn('group #1 ("f_cpu"): "source" must be the id of the overview block',
                      check_tabs(lambda s: tab(s, "board")["groups"][0].update(source=5))[0])

    def test_frame_source_without_board_of(self):
        errors, warnings = check_tabs(lambda s: tab(s, "board").pop("boardOf"))
        self.assertEqual(errors, "")
        self.assertIn('diagram "board": group "f_cpu" has a "source" but this tab has no "boardOf"', warnings)

    def test_board_wire_source_must_be_a_string(self):
        errors = check_tabs(lambda s: tab(s, "board")["edges"][0].update(source=["cpu", "bus"]))[0]
        self.assertIn('diagram "board" edge #1: "source" must be a string', errors)

    def test_detail_of_a_missing_tab(self):
        errors = check_tabs(lambda s: tab(s, "cpu-inside")["detailOf"].update(tab="overveiw"))[0]
        self.assertIn('diagram "cpu-inside": "detailOf" names tab "overveiw", which is not in this spec. Did you mean "overview"?', errors)

    def test_detail_of_an_unknown_block(self):
        errors, warnings = check_tabs(lambda s: tab(s, "cpu-inside")["detailOf"].update(block="gpu"))
        self.assertEqual(errors, "")
        self.assertIn('diagram "cpu-inside": "detailOf" names block "gpu", which is not a block or frame of tab "overview".', warnings)

    def test_detail_of_needs_tab_and_block(self):
        for value in ({"tab": "overview"}, {"block": "cpu"}, {"tab": "", "block": "cpu"}):
            with self.subTest(detailOf=value):
                errors = check_tabs(lambda s: tab(s, "cpu-inside").update(detailOf=value))[0]
                self.assertIn('diagram "cpu-inside": "detailOf" needs both "tab" and "block"', errors)
        self.assertIn('"detailOf" must be an object', check_tabs(lambda s: tab(s, "cpu-inside").update(detailOf="overview"))[0])

    def test_two_tabs_hold_the_same_block(self):
        def m(s):
            s["diagrams"].append({"id": "cpu-inside-2", "title": "CPU again", "summary": "A second inside of the CPU.",
                                  "detailOf": {"tab": "overview", "block": "cpu"}, "nodes": [{"id": "core", "title": "Core"}]})
        errors, warnings = check_tabs(m)
        self.assertEqual(errors, "")
        self.assertIn('diagram "cpu-inside-2": holds the inside of block "cpu" of tab "overview", as diagram "cpu-inside" already does', warnings)

    def test_detail_names_a_missing_tab(self):
        def m(s):
            tab(s, "overview")["nodes"][1]["detail"] = "bus-insides"
            tab(s, "board")["groups"][0]["detail"] = "nowhere"
            tab(s, "board")["groups"][2]["detail"] = 7
        errors = check_tabs(m)[0]
        self.assertIn('diagram "overview" node #2 ("bus"): "detail" names tab "bus-insides", which is not in this spec. Did you mean "bus-inside"?', errors)
        self.assertIn('diagram "board" group #1 ("f_cpu"): "detail" names tab "nowhere", which is not in this spec.', errors)
        self.assertIn('diagram "board" group #3 ("f_adc"): "detail" must be the id of the tab', errors)

    def test_detail_whose_tab_does_not_point_back(self):
        def m(s):
            tab(s, "overview")["nodes"][2]["detail"] = "cpu-inside"
            tab(s, "board")["groups"][2]["detail"] = "bus-inside"
        errors, warnings = check_tabs(m)
        self.assertEqual(errors, "")
        self.assertIn('diagram "overview" node #3 ("adc"): "detail" names tab "cpu-inside", whose "detailOf" does not point back here; '
                      'set it to {"tab": "overview", "block": "adc"}.', warnings)
        self.assertIn('diagram "board" group #3 ("f_adc"): "detail" names tab "bus-inside", whose "detailOf" does not point back here', warnings)

    def test_unknown_fields_inside_port_and_detail_of(self):
        def m(s):
            tab(s, "board")["nodes"][0]["port"]["side"] = "right"
            tab(s, "cpu-inside")["detailOf"]["tabs"] = "overview"
        errors, warnings = check_tabs(m)
        self.assertEqual(errors, "")
        self.assertIn('diagram "board" node #1 ("cpu_m") port: unknown field(s) side will be ignored.', warnings)
        self.assertIn('diagram "cpu-inside" detailOf: unknown field(s) tabs will be ignored.', warnings)


class Ports(unittest.TestCase):
    def port(self, change, index=0):
        return check_tabs(lambda s: tab(s, "board")["nodes"][index]["port"].update(change))

    def test_port_on_an_unknown_frame(self):
        errors = self.port({"of": "f_gpu"})[0]
        self.assertIn('diagram "board" node #1 ("cpu_m"): port "of" names unknown group "f_gpu". Did you mean "f_cpu"?', errors)

    def test_port_direction(self):
        self.assertIn('node #1 ("cpu_m"): port "dir" is "output". Did you mean "out"?', self.port({"dir": "output"})[0])
        self.assertIn('node #1 ("cpu_m"): port "dir" is required', check_tabs(lambda s: tab(s, "board")["nodes"][0]["port"].pop("dir"))[0])

    def test_port_name(self):
        for name in ("", "   ", None):
            with self.subTest(name=name):
                self.assertIn('node #1 ("cpu_m"): port "name" is required', self.port({"name": name})[0])
        self.assertIn('port "name" is required', check_tabs(lambda s: tab(s, "board")["nodes"][0]["port"].pop("name"))[0])
        errors, warnings = self.port({"name": "x" * 49})
        self.assertEqual(errors, "")
        self.assertIn("port name has 49 characters", warnings)

    def test_port_kind(self):
        self.assertIn('port kind "clk" is not supported. Did you mean "clock"?', self.port({"kind": "clk"})[0])

    def test_two_ports_of_a_frame_with_one_name_and_direction(self):
        def m(s):
            tab(s, "board")["nodes"].append({"id": "cpu_m2", "port": {"of": "f_cpu", "name": "AHB", "dir": "out"}, "x": 290, "y": 130})
        errors, warnings = check_tabs(m)
        self.assertEqual(errors, "")
        self.assertIn('diagram "board": frame "f_cpu" has 2 "out" ports named "AHB" (nodes "cpu_m", "cpu_m2")', warnings)

    def test_same_name_in_the_other_direction_is_fine(self):
        def m(s):
            tab(s, "board")["nodes"].append({"id": "bus_m2", "port": {"of": "f_bus", "name": "AHB", "dir": "out"}, "x": 690, "y": 130})
        self.assertEqual(check_tabs(m), ("", ""))

    def test_two_ports_on_the_tab_border(self):
        def m(s):
            d = tab(s, "bus-inside")
            d["nodes"].append({"id": "s2", "port": {"name": "AHB", "dir": "in"}})
            d["edges"].append({"from": "s2", "to": "dec"})
        errors, warnings = check_tabs(m)
        self.assertEqual(errors, "")
        self.assertIn('diagram "bus-inside": the tab border has 2 "in" ports named "AHB" (nodes "s", "s2")', warnings)

    def test_port_must_be_an_object_and_cards_still_need_a_title(self):
        errors = check_tabs(lambda s: tab(s, "board")["nodes"][0].update(port="AHB"))[0]
        self.assertIn('node #1 ("cpu_m"): "port" must be an object', errors)
        self.assertIn('node #1 ("cpu_m"): "title" is required.', errors)
        self.assertIn('node #5 ("alu"): "title" is required.', check_tabs(lambda s: tab(s, "board")["nodes"][4].pop("title"))[0])


class Notes(unittest.TestCase):
    def add(self, note, tid="overview"):
        return check_tabs(lambda s: tab(s, tid)["notes"].append(note))

    def test_note_id_is_required_well_formed_and_unique(self):
        self.assertIn('diagram "overview" note #4: "id" is required', self.add({"text": "No id."})[0])
        self.assertIn('diagram "overview" note #4: "id" is required', self.add({"id": "n 4", "text": "A space in the id."})[0])
        self.assertIn('diagram "overview" note #4: duplicate note id "n1"', self.add({"id": "n1", "text": "Twice."})[0])

    def test_note_text(self):
        for text in (None, "", "   ", 5):
            with self.subTest(text=text):
                self.assertIn('note #4 ("n4"): "text" is required.', self.add({"id": "n4", "text": text})[0])
        errors, warnings = self.add({"id": "n4", "text": "x" * 601})
        self.assertEqual(errors, "")
        self.assertIn('note #4 ("n4"): text has 601 characters', warnings)
        self.assertEqual(self.add({"id": "n4", "text": "x" * 600}), ("", ""))

    def test_unknown_note_kind(self):
        self.assertIn('note #4 ("n4"): kind "todos" is not supported. Did you mean "todo"?', self.add({"id": "n4", "text": "Later.", "kind": "todos"})[0])

    def test_note_attached_to_something_not_in_the_tab(self):
        errors, warnings = self.add({"id": "n4", "text": "Its block was deleted.", "attach": "gpu"})
        self.assertEqual(errors, "")
        self.assertIn('diagram "overview": note "n4" is attached to "gpu", which is not in this tab.', warnings)
        errors, warnings = self.add({"id": "n4", "text": "No such wire.", "attach": ["cpu", "adc"]})
        self.assertEqual(errors, "")
        self.assertIn('diagram "overview": note "n4" is attached to the edge cpu -> adc, which is not in this tab.', warnings)
        warnings = self.add({"id": "n4", "text": "Drawn backwards.", "attach": ["bus", "cpu"]})[1]
        self.assertIn('The edge exists the other way round: ["cpu", "bus"].', warnings)
        self.assertIn('note "t9" is attached to "f_gpu"', self.add({"id": "t9", "text": "Frame gone.", "attach": "f_gpu"}, tid="board")[1])

    def test_attach_must_be_an_id_or_an_edge(self):
        for attach in (["cpu"], ["cpu", "bus", "adc"], 5, {"node": "cpu"}):
            with self.subTest(attach=attach):
                errors = self.add({"id": "n4", "text": "Where?", "attach": attach})[0]
                self.assertIn('note #4 ("n4"): "attach" must be a block or frame id, or an edge as ["from", "to"].', errors)

    def test_note_position_and_width(self):
        errors = self.add({"id": "n4", "text": "t", "x": "10", "dy": "up"})[0]
        self.assertIn('note #4 ("n4"): "x" must be a number.', errors)
        self.assertIn('note #4 ("n4"): "dy" must be a number.', errors)
        for width in (79, 601, "200"):
            with self.subTest(w=width):
                self.assertIn('note #4 ("n4"): "w" must be a number between 80 and 600.', self.add({"id": "n4", "text": "t", "w": width})[0])
        self.assertEqual(self.add({"id": "n4", "text": "t", "x": 0, "y": 10.5, "dx": -4, "dy": 12, "w": 600}), ("", ""))

    def test_note_date_and_author(self):
        for date in ("25/09/2026", "2026-9-25", 20260925):
            with self.subTest(date=date):
                errors, warnings = self.add({"id": "n4", "text": "t", "date": date})
                self.assertEqual(errors, "")
                self.assertIn('note #4 ("n4"): date "', warnings)
                self.assertIn("should be written YYYY-MM-DD", warnings)
        errors, warnings = self.add({"id": "n4", "text": "t", "by": "x" * 61})
        self.assertEqual(errors, "")
        self.assertIn('note #4 ("n4"): "by" has 61 characters', warnings)
        self.assertIn('note #4 ("n4"): "by" must be text', self.add({"id": "n4", "text": "t", "by": 42})[0])
        self.assertEqual(self.add({"id": "n4", "text": "t", "by": "x" * 60, "date": "2026-10-01"}), ("", ""))

    def test_unknown_note_field(self):
        errors, warnings = self.add({"id": "n4", "text": "t", "colour": "red"})
        self.assertEqual(errors, "")
        self.assertIn('diagram "overview" note #4: unknown field(s) colour will be ignored.', warnings)

    def test_notes_must_be_a_list_of_objects(self):
        self.assertIn('diagram "overview": "notes" must be a list.', check_tabs(lambda s: tab(s, "overview").update(notes={"id": "n1"}))[0])
        self.assertIn('diagram "overview" note #4: must be an object.', self.add("Just text.")[0])


class SingleDiagram(unittest.TestCase):
    SOLO = {"title": "Solo", "lang": "en", "id": "solo", "summary": "One tab with a border port and a note.",
            "nodes": [{"id": "a", "title": "A"}, {"id": "p", "port": {"name": "IN", "dir": "in"}}],
            "edges": [{"from": "p", "to": "a", "source": "x>a"}],
            "notes": [{"id": "n1", "text": "Hello.", "kind": "todo", "attach": "a"}]}

    def test_new_fields_are_known_at_the_top_level(self):
        self.assertEqual(validate_spec(copy.deepcopy(self.SOLO)), ([], []))

    def test_links_to_other_tabs_need_those_tabs(self):
        spec = copy.deepcopy(self.SOLO)
        spec["boardOf"] = "solo"
        spec["detailOf"] = {"tab": "top", "block": "cpu"}
        spec["nodes"][0]["detail"] = "inside"
        errors = "\n".join(validate_spec(spec)[0])
        self.assertIn('diagram: "boardOf" names this tab itself', errors)
        self.assertIn('diagram: "detailOf" names tab "top", which is not in this spec.', errors)
        self.assertIn('diagram node #1 ("a"): "detail" names tab "inside", which is not in this spec.', errors)


if __name__ == "__main__":
    unittest.main()
