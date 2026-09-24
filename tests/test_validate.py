"""Unit tests for scripts/validate.py: the wiring rules that match the editor's Checks list."""

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


if __name__ == "__main__":
    unittest.main()
