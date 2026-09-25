"""draw.io diagrams kept inside PNG files (.drawio.png, as the draw.io app and its VS Code extension save them)."""

import struct
import subprocess
import sys
import tempfile
import unittest
import urllib.parse
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "architecture-diagrams"
sys.dont_write_bytecode = True
sys.path.insert(0, str(SKILL / "scripts"))
import build  # noqa: E402

SAMPLE = ROOT / "tests" / "fixtures" / "drawio" / "sample.drawio"
SAMPLE_PNG = ROOT / "tests" / "fixtures" / "drawio" / "sample.drawio.png"


def chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def png_with(extra):
    head = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    return head + extra + chunk(b"IDAT", zlib.compress(b"\x00\xff\xff\xff")) + chunk(b"IEND", b"")


class DrawioPng(unittest.TestCase):
    def test_text_chunk_as_draw_io_writes_it(self):
        self.assertEqual(build.read_drawio_text(SAMPLE_PNG), SAMPLE.read_text(encoding="utf-8").strip())

    def test_compressed_and_international_chunks(self):
        xml = SAMPLE.read_text(encoding="utf-8")
        ztxt = png_with(chunk(b"zTXt", b"mxfile\x00\x00" + zlib.compress(urllib.parse.quote(xml, safe="").encode("ascii"))))
        itxt = png_with(chunk(b"iTXt", b"mxfile\x00\x01\x00\x00\x00" + zlib.compress(xml.encode("utf-8"))))
        old = png_with(chunk(b"tEXt", b"mxGraphModel\x00" + urllib.parse.quote(xml, safe="").encode("ascii")))
        for data in (ztxt, itxt, old):
            self.assertEqual(build.png_drawio_text(data), xml.strip())

    def test_a_plain_png_says_what_is_missing(self):
        with self.assertRaises(ValueError) as caught:
            build.png_drawio_text(png_with(b""))
        self.assertIn("no draw.io diagram", str(caught.exception))
        with self.assertRaises(ValueError):
            build.png_drawio_text(b"GIF89a")

    def test_build_opens_a_drawio_png(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "page.html"
            proc = subprocess.run([sys.executable, str(SKILL / "scripts" / "build.py"), str(SAMPLE_PNG), "-o", str(out)],
                                  capture_output=True, text=True)
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            page = out.read_text(encoding="utf-8")
            self.assertIn("<title>sample</title>", page)
            self.assertIn("mxfile", page)


if __name__ == "__main__":
    unittest.main()
