#!/usr/bin/env python3
"""Maintainer tool: build the release assets into dist/.

- dist/architecture-diagrams.zip and dist/architecture-diagrams.skill (the same file): the skill folder for Claude;
- dist/architecture-diagrams-editor.html: the offline editor page, layout library embedded.

It runs the unit tests and the generated-docs check first and stops when one fails. Run the browser tests
(python3 tests/interaction_test.py) as well before a release. Then publish from any machine:
    python3 tools/make_release.py
    gh release create vX.Y.Z --title "Architecture Diagrams X.Y" --notes-file NOTES.md dist/*
"""

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "architecture-diagrams"
DIST = ROOT / "dist"
SKIP_DIRS = {"__pycache__"}
SKIP_FILES = {".DS_Store"}


def run(cmd):
    print("$", " ".join(cmd))
    if subprocess.run(cmd, cwd=ROOT).returncode:
        sys.exit(f"stopped: {' '.join(cmd)} failed")


def skill_files():
    for path in sorted(SKILL.rglob("*")):
        rel = path.relative_to(ROOT)
        if path.is_file() and not SKIP_DIRS.intersection(rel.parts) and path.name not in SKIP_FILES \
                and path.suffix != ".pyc":
            yield path, rel


def main():
    run([sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py"])
    run([sys.executable, "tools/make_docs.py", "--check"])
    DIST.mkdir(exist_ok=True)

    zip_path = DIST / "architecture-diagrams.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        count = 0
        for path, rel in skill_files():
            zf.write(path, rel.as_posix())
            count += 1
    shutil.copyfile(zip_path, DIST / "architecture-diagrams.skill")

    editor = DIST / "architecture-diagrams-editor.html"
    run([sys.executable, str(SKILL / "scripts" / "build.py"), "--editor", "--lang", "vi", "-o", str(editor)])

    print(f"\n{zip_path.name} ({count} files, {zip_path.stat().st_size} bytes), same file as architecture-diagrams.skill")
    print(f"{editor.name} ({editor.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
