#!/usr/bin/env python3
"""Maintainer tool: refresh architecture-diagrams/assets/stencils from draw.io (Apache License 2.0).

Downloads draw.io's electrical, flowchart, basic and network stencil libraries at a pinned commit.
The renderer draws these shapes itself, so imported .drawio files look the same and exported files keep
draw.io's native shape names. Not needed to use the skill. Run: python3 tools/vendor_stencils.py
"""

import json
import urllib.request
from pathlib import Path

DRAWIO_COMMIT = "82af434539c3449d99275b91a91b6b99998a7d58"
BASE = f"https://raw.githubusercontent.com/jgraph/drawio/{DRAWIO_COMMIT}"
API = f"https://api.github.com/repos/jgraph/drawio/contents/src/main/webapp/stencils/electrical?ref={DRAWIO_COMMIT}"
OUT = Path(__file__).resolve().parent.parent / "architecture-diagrams" / "assets" / "stencils"
EXTRA = ["flowchart.xml", "basic.xml", "networks.xml"]


def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    listing = json.loads(fetch(API))
    files = [("electrical/" + f["name"], "electrical-" + f["name"]) for f in listing if f["name"].endswith(".xml")]
    files += [(name, name) for name in EXTRA]
    total = 0
    for src, dst in files:
        data = fetch(f"{BASE}/src/main/webapp/stencils/{src}")
        (OUT / dst).write_bytes(data)
        total += len(data)
    (OUT / "LICENSE-drawio.txt").write_bytes(fetch(f"{BASE}/LICENSE"))
    (OUT / "SOURCE.txt").write_text(
        "These stencil libraries are copied unchanged from draw.io (https://github.com/jgraph/drawio),\n"
        f"commit {DRAWIO_COMMIT}, folder src/main/webapp/stencils.\n"
        "Copyright JGraph Ltd. Licensed under the Apache License 2.0 (see LICENSE-drawio.txt).\n",
        encoding="utf-8")
    print(f"Wrote {len(files)} libraries ({total // 1024} KB) to {OUT}")


if __name__ == "__main__":
    main()
