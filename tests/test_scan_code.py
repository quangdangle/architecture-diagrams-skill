#!/usr/bin/env python3
"""Tests for scripts/scan_code.py on small fixture projects (one per language).

Usage:
    python3 tests/test_scan_code.py
"""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "architecture-diagrams" / "scripts"
FIXTURES = ROOT / "tests" / "fixtures"
sys.path.insert(0, str(SCRIPTS))
from validate import validate_spec  # noqa: E402


def scan(app, *extra):
    with tempfile.TemporaryDirectory() as tmp:
        spec_path, facts_path = Path(tmp) / "spec.json", Path(tmp) / "facts.json"
        res = subprocess.run(
            [sys.executable, str(SCRIPTS / "scan_code.py"), str(FIXTURES / app), "-o", str(spec_path), "--facts", str(facts_path), *extra],
            capture_output=True, text=True,
        )
        if res.returncode != 0:
            raise AssertionError(f"scan failed for {app}:\n{res.stdout}\n{res.stderr}")
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
        facts = json.loads(facts_path.read_text(encoding="utf-8"))
        build = subprocess.run(
            [sys.executable, str(SCRIPTS / "build.py"), str(spec_path), "-o", str(Path(tmp) / "page.html")],
            capture_output=True, text=True,
        )
        if build.returncode != 0:
            raise AssertionError(f"build failed for {app}:\n{build.stdout}")
    files = {f["path"]: f for f in facts["files"]}
    return spec, facts, files


class ScanCodeTest(unittest.TestCase):
    def assertValid(self, spec):
        errors, _ = validate_spec(spec)
        self.assertEqual(errors, [])

    def test_python(self):
        spec, facts, files = scan("py_app")
        self.assertValid(spec)
        self.assertNotIn("tests/test_rules.py", files, "tests are skipped by default")
        routes = files["pkg/api/routes.py"]
        self.assertIn("pkg/core/rules.py", routes["imports"], "relative 'from ..core import rules'")
        self.assertIn("pkg/db/models.py", routes["imports"], "absolute 'from pkg.db.models import User'")
        self.assertEqual(routes["external"], {"requests": 1})
        self.assertNotIn("json", files["pkg/core/rules.py"]["external"], "standard library is ignored")
        self.assertEqual(files["pkg/core/rules.py"]["doc"], "Business rules.")
        overview = spec["diagrams"][0]
        cycles = [e for e in overview["edges"] if e.get("kind") == "feedback"]
        self.assertEqual(len(cycles), 2, "core <-> db is a circular dependency")

    def test_python_include_tests(self):
        _, _, files = scan("py_app", "--include-tests")
        self.assertIn("tests/test_rules.py", files)

    def test_typescript(self):
        spec, facts, files = scan("ts_app", "--lang", "vi")
        self.assertValid(spec)
        self.assertEqual(spec["lang"], "vi")
        self.assertNotIn("src/app.spec.ts", files)
        app = files["src/app.ts"]["imports"]
        self.assertIn("src/routes/index.ts", app, "folder import resolves to index.ts")
        self.assertIn("src/lib/log.ts", app, "tsconfig paths alias @/*")
        self.assertIn("packages/shared/src/index.ts", app, "workspace package, dist/ main mapped to src/")
        self.assertEqual(files["src/app.ts"]["external"], {"express": 1}, "node: builtins are ignored")
        self.assertIn("src/lib/log.ts", files["src/routes/index.ts"]["imports"], "'.js' specifier maps to the .ts file")
        self.assertIn("src/routes/users.ts", files["src/routes/index.ts"]["imports"], "export * from")
        users = files["src/routes/users.ts"]["imports"]
        self.assertIn("packages/shared/src/types.ts", users, "package sub-path")
        self.assertIn("src/lib/db.ts", users)
        self.assertEqual(files["src/app.ts"]["doc"], "Application entry: wires routes and starts the server.")
        self.assertEqual(facts["unresolved"], [], "commented-out imports are ignored")

    def test_verilog(self):
        spec, facts, files = scan("rtl_soc")
        self.assertValid(spec)
        self.assertNotIn("tb/tb_top.sv", files, "testbenches are skipped by default")
        top = files["rtl/top.sv"]
        insts = {(p, c, i) for p, c, i in top["instances"]}
        self.assertIn(("soc_top", "axi_xbar", "u_xbar"), insts, "parameterised instance with nested parentheses")
        self.assertIn(("soc_top", "uart", "u_uart1"), insts)
        self.assertEqual({c for _, c, _ in top["instances"]}, {"cpu_core", "axi_xbar", "uart", "sky130_sram_1kbyte"},
                         "keywords such as if/assert/always_ff are not instances")
        self.assertIn("rtl/pkg/soc_pkg.sv", top["imports"], "import soc_pkg::*")
        self.assertIn("rtl/include/defs.svh", top["imports"], "`include")
        self.assertEqual(top["doc"], "SoC top level that ties the CPU, the bus and the peripherals together.")
        rtl = next(d for d in spec["diagrams"] if d["id"] == "rtl")
        titles = {n["title"]: n for n in rtl["nodes"]}
        self.assertEqual(titles["soc_top"].get("size"), "lg", "top module is emphasised")
        self.assertTrue(titles["sky130_sram_1kbyte"].get("external"), "module without source is external")
        self.assertIn("alu", titles, "second module in the same file")
        labels = {e["label"] for e in rtl["edges"]}
        self.assertIn("u_uart0, u_uart1", labels)
        self.assertEqual(titles["soc_top"]["ports"], {"in": ["clk", "rst_n"], "out": ["uart0_tx"]}, "ANSI ports")
        fifo = files["rtl/periph/fifo.sv"]["ports"]["fifo"]
        self.assertEqual(fifo["in"], ["clk", "rst_n", "wdata[W-1:0]", "push", "pop"], "several names share one declaration")
        self.assertEqual(fifo["out"], ["rdata[W-1:0]", "full", "empty"])
        self.assertEqual(fifo["inout"], ["cfg"], "interface ports")
        uart = files["rtl/periph/uart.v"]["ports"]["uart"]
        self.assertEqual(uart, {"in": ["clk", "rst_n", "rx"], "out": ["tx", "irq"], "inout": ["data[7:0]"]}, "old-style declarations")

    def test_go(self):
        spec, _, files = scan("go_app")
        self.assertValid(spec)
        self.assertEqual(files["cmd/server/main.go"]["imports"], {"internal/api/": 1})
        self.assertEqual(files["cmd/server/main.go"]["external"], {"github.com/gorilla/mux": 1})
        self.assertEqual(files["internal/api/api.go"]["imports"], {"internal/store/": 1})

    def test_java(self):
        spec, _, files = scan("java_app")
        self.assertValid(spec)
        app = files["src/main/java/com/demo/App.java"]
        self.assertEqual(app["imports"], {"src/main/java/com/demo/service/UserService.java": 1})
        self.assertEqual(app["external"], {"org.springframework": 1}, "java.* is platform, not a dependency")
        self.assertEqual(files["src/main/java/com/demo/service/UserService.java"]["imports"], {"src/main/java/com/demo/repo/": 1})

    def test_c(self):
        spec, _, files = scan("c_app")
        self.assertValid(spec)
        self.assertEqual(files["src/main.c"]["imports"], {"include/util.h": 1})
        self.assertEqual(files["src/main.c"]["external"], {"openssl": 1})
        self.assertEqual(files["include/util.h"]["doc"], "Small string helpers.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
