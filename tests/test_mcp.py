"""Talks to scripts/mcp_server.py over stdio the way an MCP client does."""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "architecture-diagrams"
SERVER = ROOT / "architecture-diagrams" / "scripts" / "mcp_server.py"
sys.path.insert(0, str(ROOT / "architecture-diagrams" / "scripts"))
sys.dont_write_bytecode = True
from render_png import find_browser  # noqa: E402

CDC = json.loads((ROOT / "architecture-diagrams" / "examples" / "clock-reset-tree.json").read_text(encoding="utf-8"))


class McpServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        variables = dict(os.environ, ARCHITECTURE_DIAGRAMS_OUT=cls.tmp.name, PYTHONDONTWRITEBYTECODE="1")
        cls.proc = subprocess.Popen([sys.executable, str(SERVER)], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE, text=True, env=variables)
        cls.n = 0
        cls.init = cls.call("initialize", {"protocolVersion": "2025-06-18", "capabilities": {},
                                           "clientInfo": {"name": "test", "version": "1"}})["result"]
        cls.proc.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n")
        cls.proc.stdin.flush()

    @classmethod
    def tearDownClass(cls):
        cls.proc.stdin.close()
        cls.proc.wait(timeout=20)
        cls.proc.stdout.close()
        cls.proc.stderr.close()
        cls.tmp.cleanup()

    @classmethod
    def call(cls, method, params=None):
        cls.n += 1
        cls.proc.stdin.write(json.dumps({"jsonrpc": "2.0", "id": cls.n, "method": method, "params": params or {}}) + "\n")
        cls.proc.stdin.flush()
        return json.loads(cls.proc.stdout.readline())

    def tool(self, name, **args):
        return self.call("tools/call", {"name": name, "arguments": args})["result"]

    def test_handshake(self):
        self.assertEqual(self.init["protocolVersion"], "2025-06-18")
        self.assertEqual(self.init["serverInfo"]["name"], "architecture-diagrams")
        self.assertIn("tools", self.init["capabilities"])

    def test_tools_are_listed(self):
        names = [t["name"] for t in self.call("tools/list")["result"]["tools"]]
        for name in ("diagram_guide", "diagram_validate", "diagram_build", "diagram_open_editor", "diagram_export",
                     "diagram_import_drawio", "diagram_scan_code", "diagram_symbols", "diagram_patterns",
                     "diagram_insert_pattern", "diagram_apply_ops", "diagram_suggest"):
            self.assertIn(name, names)

    def test_patterns_are_listed(self):
        result = self.tool("diagram_patterns", lang="en")
        count = len(json.loads((SKILL / "assets" / "patterns.json").read_text(encoding="utf-8"))["patterns"])
        self.assertEqual(len(result["structuredContent"]["patterns"]), count)
        self.assertIn("sync2 [chip] 2-flop synchronizer", result["content"][0]["text"])

    def test_guide_lists_pins(self):
        text = self.tool("diagram_guide")["content"][0]["text"]
        self.assertIn("dff: D(in)@[0, 0.3], CLK(clk)@[0, 0.72]", text)

    def test_validate_reports_a_reversed_wire(self):
        spec = json.loads(json.dumps(CDC))
        spec["diagrams"][1]["edges"][1] = {"from": "ff2", "to": "ff1", "fromAnchor": [0, 0.3], "toAnchor": [1, 0.3]}
        result = self.tool("diagram_validate", spec=spec)
        self.assertFalse(result["isError"])
        self.assertIn("runs backwards", result["content"][0]["text"])
        self.assertEqual(len(result["structuredContent"]["warnings"]), 1)

    def test_build_writes_a_page(self):
        result = self.tool("diagram_build", spec=CDC)
        self.assertFalse(result["isError"], result["content"][0]["text"])
        page = Path(result["structuredContent"]["path"])
        self.assertTrue(page.exists() and page.stat().st_size > 50000)

    def test_symbols_filter(self):
        text = self.tool("diagram_symbols", query="mux")["content"][0]["text"]
        self.assertIn("SEL(in)", text)

    def test_errors_come_back_as_tool_errors(self):
        result = self.tool("diagram_build", path="/no/such/file.json")
        self.assertTrue(result["isError"])
        self.assertIn("file not found", result["content"][0]["text"])
        self.assertEqual(self.call("no/such/method")["error"]["code"], -32601)

    def test_resources(self):
        uris = [r["uri"] for r in self.call("resources/list")["result"]["resources"]]
        self.assertIn("architecture-diagrams://symbols", uris)
        body = self.call("resources/read", {"uri": "architecture-diagrams://symbols"})["result"]["contents"][0]["text"]
        self.assertTrue(any(s["name"] == "dff" for s in json.loads(body)))

    @unittest.skipUnless(find_browser(), "needs Chrome, Chromium, Edge or Brave")
    def test_export_and_import_drawio(self):
        exported = self.tool("diagram_export", spec=CDC, format="drawio")
        self.assertFalse(exported["isError"], exported["content"][0]["text"])
        drawio = Path(exported["structuredContent"]["path"])
        self.assertIn("<mxfile", drawio.read_text(encoding="utf-8"))
        imported = self.tool("diagram_import_drawio", path=str(drawio))
        self.assertFalse(imported["isError"], imported["content"][0]["text"])
        self.assertIn('"diagrams"', imported["content"][0]["text"])


    @unittest.skipUnless(find_browser(), "needs Chrome, Chromium, Edge or Brave")
    def test_insert_pattern_then_fix_with_ops(self):
        inserted = self.tool("diagram_insert_pattern", spec=CDC, pattern="sync2", near="ff3", diagram="cdc")
        self.assertFalse(inserted["isError"], inserted["content"][0]["text"])
        text = inserted["content"][0]["text"]
        self.assertIn("Added blocks: sync1, sync2", text)
        self.assertIn("clk_a", text)  # a synchronizer after sync3 (clk_b domain) takes the other clock and says so
        self.assertIn("Checks on tab cdc: no problems", text)
        path = inserted["structuredContent"]["path"]
        ops = [{"op": "addNode", "node": {"id": "lone", "shape": "dff", "title": "lone"}, "near": "sync2"},
               {"op": "connect", "from": "sync2.Q", "to": "lone.D"}]
        added = self.tool("diagram_apply_ops", path=path, ops={"ops": ops}, diagram="cdc")
        self.assertFalse(added["isError"], added["content"][0]["text"])
        self.assertRegex(added["content"][0]["text"], r"lone.*CLK")
        fix = [c for c in added["structuredContent"]["checks"] if "lone" in c["text"]][0]["fixes"][0]["ops"]
        fixed = self.tool("diagram_apply_ops", path=added["structuredContent"]["path"], ops=fix, diagram="cdc")
        self.assertIn("Checks on tab cdc: no problems", fixed["content"][0]["text"])
        bad = self.tool("diagram_apply_ops", path=path, ops=[{"op": "connect", "from": "ff3.Z", "to": "sync1.D"}], diagram="cdc")
        self.assertTrue(bad["isError"])
        self.assertRegex(bad["content"][0]["text"], "has no pin|không có chân")  # messages follow the spec's language
        sugg = self.tool("diagram_suggest", path=path, diagram="cdc", node="sync2")
        self.assertIn("pattern=sync2", sugg["content"][0]["text"])

if __name__ == "__main__":
    unittest.main()
