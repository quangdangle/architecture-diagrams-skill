"""The documents stay in step with the code: generated files, the skill's front matter and every example."""

import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "architecture-diagrams"
sys.dont_write_bytecode = True
sys.path.insert(0, str(SKILL / "scripts"))
from validate import validate_spec  # noqa: E402


class Docs(unittest.TestCase):
    def test_generated_files_are_current(self):
        run = subprocess.run([sys.executable, "-B", str(ROOT / "tools" / "make_docs.py"), "--check"], capture_output=True, text=True)
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

    def test_skill_front_matter(self):
        text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        front = text.split("---")[1]
        self.assertRegex(front, r"(?m)^name: architecture-diagrams$")
        description = re.search(r"(?m)^description: (.*)$", front).group(1)
        self.assertLessEqual(len(description), 1024)
        self.assertNotIn("<", description)
        self.assertNotIn(">", description)
        self.assertLess(text.count("\n"), 500)

    def test_every_example_is_valid(self):
        for path in sorted((SKILL / "examples").glob("*.json")):
            errors, warnings = validate_spec(json.loads(path.read_text(encoding="utf-8")))
            self.assertEqual(errors, [], path.name)
            self.assertEqual(warnings, [], path.name)

    def test_files_named_in_skill_md_exist(self):
        text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        for rel in set(re.findall(r"`((?:scripts|references|examples)/[\w./-]+\.(?:py|md|json))`", text)):
            self.assertTrue((SKILL / rel).exists(), rel)


if __name__ == "__main__":
    unittest.main()
