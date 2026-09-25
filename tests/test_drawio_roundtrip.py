"""Opening a draw.io file and saving it back keeps every cell as it was: layers with their own ids (one hidden),
cells without a value, geometry without x and y, long decimals, a wire inside a group, a line from one corner of a box
to another, a wire with a loose end, a shape the file draws itself (shape=stencil(...)) and a label position."""

import json
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "architecture-diagrams"
sys.dont_write_bytecode = True
sys.path.insert(0, str(SKILL / "scripts"))
from render_png import find_browser  # noqa: E402

FIXTURE = ROOT / "tests" / "fixtures" / "drawio" / "fidelity.drawio"


def cells(text):
    root = ET.fromstring(text)
    out = {}
    for el in root.iter("mxCell"):
        geo = el.find("mxGeometry")
        out[el.get("id")] = (dict(el.attrib), ET.tostring(geo, encoding="unicode") if geo is not None else None)
    return out


def export(src, fmt, out):
    proc = subprocess.run([sys.executable, str(SKILL / "scripts" / "export.py"), str(src), "--format", fmt, "-o", str(out)],
                          capture_output=True, text=True, timeout=300)
    if proc.returncode or not Path(out).exists():
        raise AssertionError(proc.stdout + proc.stderr)


class DrawioRoundTrip(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not find_browser():
            raise unittest.SkipTest("needs Chrome, Chromium, Edge or Brave")
        cls.tmp = tempfile.TemporaryDirectory()
        tmp = Path(cls.tmp.name)
        cls.spec_path = tmp / "fidelity.json"
        export(FIXTURE, "spec", cls.spec_path)
        cls.spec = json.loads(cls.spec_path.read_text(encoding="utf-8"))
        cls.back = tmp / "fidelity.back.drawio"
        export(cls.spec_path, "drawio", cls.back)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_every_cell_comes_back_unchanged(self):
        before, after = cells(FIXTURE.read_text(encoding="utf-8")), cells(self.back.read_text(encoding="utf-8"))
        self.assertEqual(sorted(before), sorted(after))
        for cid in before:
            with self.subTest(cell=cid):
                self.assertEqual(before[cid][0], after[cid][0])
                a, b = before[cid][1], after[cid][1]
                if a is None:
                    self.assertIsNone(b)
                else:
                    self.assertEqual(ET.fromstring(a).attrib, ET.fromstring(b).attrib)
                    self.assertEqual([ET.tostring(c) for c in ET.fromstring(a)], [ET.tostring(c) for c in ET.fromstring(b)])

    def test_the_page_is_read_as_drawn(self):
        tab = self.spec["diagrams"][0]
        nodes = {n["id"]: n for n in tab["nodes"]}
        self.assertTrue(nodes["mux"]["shape"].startswith("stencil."), nodes["mux"])
        border = [e for e in tab["edges"] if e["from"] == "stage" and e["to"] == "stage"]
        self.assertEqual(len(border), 1)
        self.assertEqual((border[0]["fromAnchor"]["y"], border[0]["toAnchor"]["y"]), (0, 1))
        kept = {k["id"] for k in tab["drawio"].get("keep", [])}
        self.assertEqual(kept, {"loose", "hidden-note"})
        self.assertNotIn("hidden-note", nodes)


if __name__ == "__main__":
    unittest.main()
