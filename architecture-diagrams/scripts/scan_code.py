#!/usr/bin/env python3
"""Scan a source repository and write a draft architecture-diagrams spec.

Reads imports in Python, JavaScript/TypeScript, Go, Java/Kotlin and C/C++,
and module instances in Verilog/SystemVerilog. Groups files into folders
("units") and writes a spec with:

* an overview of the units and the imports between them, with circular
  dependencies marked and a short generated walkthrough;
* a drill-down diagram for each of the largest units;
* an RTL module hierarchy when Verilog/SystemVerilog sources are present.

Nothing is executed: files are only read. Treat the result as a first draft;
rename cards, write real descriptions and tell the story before sharing.

Usage:
    python3 scan_code.py <repo-or-folder> [-o spec.json] [--lang en|vi]
        [--title TEXT] [--max-nodes 18] [--details 4] [--include-tests]
        [--exclude GLOB ...] [--facts facts.json]

Standard library only, Python 3.8+.
"""

import argparse
import ast
import fnmatch
import json
import os
import posixpath
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.dont_write_bytecode = True  # keep the skill folder free of __pycache__
sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate import validate_spec  # noqa: E402

# --------------------------------------------------------------------------- settings

LANG_BY_EXT = {
    ".py": "python",
    ".js": "js", ".jsx": "js", ".mjs": "js", ".cjs": "js",
    ".ts": "js", ".tsx": "js", ".mts": "js", ".cts": "js",
    ".go": "go",
    ".java": "java", ".kt": "java",
    ".c": "c", ".h": "c", ".cc": "c", ".cpp": "c", ".cxx": "c", ".hpp": "c", ".hh": "c", ".hxx": "c",
    ".v": "verilog", ".sv": "verilog", ".svh": "verilog", ".vh": "verilog",
}
EXT_LABEL = {
    ".py": "Python", ".js": "JavaScript", ".jsx": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
    ".ts": "TypeScript", ".tsx": "TypeScript", ".mts": "TypeScript", ".cts": "TypeScript",
    ".go": "Go", ".java": "Java", ".kt": "Kotlin",
    ".c": "C", ".h": "C", ".cc": "C++", ".cpp": "C++", ".cxx": "C++", ".hpp": "C++", ".hh": "C++", ".hxx": "C++",
    ".v": "Verilog", ".sv": "SystemVerilog", ".svh": "SystemVerilog", ".vh": "Verilog",
}
SKIP_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "bower_components", "dist", "build", "out", "target", "coverage",
    "__pycache__", "venv", "env", "site-packages", "vendor", "third_party", "Pods", "generated", "__generated__",
}
SKIP_FILES = ("*.min.js", "*.bundle.js", "*.d.ts", "*.d.mts", "*.d.cts", "*.pb.go", "*_pb2.py", "*_pb2_grpc.py", "*.generated.*")
EXTRA_DIRS = {"docs", "doc", "examples", "example", "storybook", "stories"}   # skipped in the first two levels
EXTRA_TOP_DIRS = {"demo", "demos", "sample", "samples"}                           # skipped at the top level only
TOOL_CONFIGS = (
    "eslint", "prettier", "jest", "vitest", "vite", "webpack", "rollup", "babel", "metro", "next", "nuxt", "tailwind",
    "postcss", "commitlint", "lint-staged", "stylelint", "tsup", "playwright", "cypress", "karma", "gulpfile", "gruntfile",
    "svelte", "astro", "turbo", "nx", "drizzle", "knip", "size-limit",
)
TEST_DIRS = {"test", "tests", "__tests__", "__mocks__", "spec", "specs", "e2e", "fixtures", "testbench", "tb", "sim", "dv", "verif"}
TEST_FILES = (
    "test_*.py", "*_test.py", "conftest.py", "*.test.*", "*.spec.*", "*_test.go", "*Test.java", "*Tests.java",
    "*Test.kt", "tb_*.sv", "*_tb.sv", "tb_*.v", "*_tb.v",
)
MAX_BYTES = 1_000_000

NODE_BUILTINS = {
    "assert", "async_hooks", "buffer", "child_process", "cluster", "console", "constants", "crypto", "dgram",
    "diagnostics_channel", "dns", "domain", "events", "fs", "http", "http2", "https", "inspector", "module", "net",
    "os", "path", "perf_hooks", "process", "punycode", "querystring", "readline", "repl", "stream",
    "string_decoder", "sys", "timers", "tls", "trace_events", "tty", "url", "util", "v8", "vm", "wasi",
    "worker_threads", "zlib",
}
PY_STDLIB = set(getattr(sys, "stdlib_module_names", ())) or {
    "__future__", "abc", "argparse", "array", "ast", "asyncio", "base64", "binascii", "bisect", "builtins", "bz2",
    "calendar", "cmath", "codecs", "collections", "concurrent", "configparser", "contextlib", "contextvars", "copy",
    "csv", "ctypes", "dataclasses", "datetime", "decimal", "difflib", "dis", "email", "enum", "errno", "fnmatch",
    "fractions", "functools", "gc", "getpass", "glob", "gzip", "hashlib", "heapq", "hmac", "html", "http", "imaplib",
    "importlib", "inspect", "io", "ipaddress", "itertools", "json", "keyword", "logging", "lzma", "math",
    "mimetypes", "multiprocessing", "numbers", "operator", "os", "pathlib", "pickle", "platform", "pprint",
    "queue", "random", "re", "secrets", "select", "shlex", "shutil", "signal", "socket", "sqlite3", "ssl", "stat",
    "statistics", "string", "struct", "subprocess", "sys", "tarfile", "tempfile", "textwrap", "threading", "time",
    "timeit", "tkinter", "token", "tokenize", "traceback", "types", "typing", "unicodedata", "unittest", "urllib",
    "uuid", "venv", "warnings", "weakref", "xml", "zipfile", "zlib", "zoneinfo",
}
C_SYSTEM_DIRS = {"sys", "linux", "arpa", "netinet", "net", "bits", "asm", "asm-generic", "mach", "machine", "uapi", "gnu"}
JVM_PLATFORM = ("java.", "javax.", "jdk.", "kotlin.", "kotlinx.", "sun.", "android.", "androidx.")
V_KEYWORDS = {
    "always", "always_comb", "always_ff", "always_latch", "and", "assert", "assign", "assume", "automatic", "begin",
    "bind", "bit", "break", "byte", "case", "casex", "casez", "chandle", "class", "clocking", "const", "constraint",
    "context", "continue", "cover", "covergroup", "coverpoint", "cross", "deassign", "default", "defparam",
    "disable", "do", "else", "end", "endcase", "endfunction", "endgenerate", "endmodule", "endtask", "enum",
    "event", "export", "extern", "final", "for", "force", "foreach", "forever", "fork", "function", "generate",
    "genvar", "if", "iff", "import", "initial", "inout", "input", "int", "integer", "interface", "join",
    "join_any", "join_none", "local", "localparam", "logic", "longint", "modport", "module", "negedge", "new",
    "not", "or", "output", "package", "parameter", "posedge", "priority", "program", "property", "protected",
    "pure", "rand", "randc", "real", "realtime", "ref", "reg", "release", "repeat", "return", "sequence",
    "shortint", "shortreal", "signed", "specify", "static", "string", "struct", "super", "supply0", "supply1",
    "task", "this", "time", "tri", "tri0", "tri1", "typedef", "union", "unique", "unique0", "unsigned", "var",
    "virtual", "void", "wait", "wand", "while", "wire", "wor",
}
V_PRIMITIVES = {
    "and", "nand", "or", "nor", "xor", "xnor", "buf", "not", "bufif0", "bufif1", "notif0", "notif1", "pullup",
    "pulldown", "tran", "rtran", "tranif0", "tranif1", "rtranif0", "rtranif1", "nmos", "pmos", "rnmos", "rpmos",
    "cmos", "rcmos",
}
CATEGORY_COLORS = ("blue", "teal", "amber", "violet", "green", "slate")

TEXT = {
    "en": {
        "title": "{name}: architecture map",
        "subtitle": "Generated from the source code; edit the spec to turn it into a story.",
        "overview": "Overview", "tag": "Generated from code",
        "summary": "Generated from the source of {name} ({files} {langs} {file_w}{commit}). Each card is a folder. Arrows point from the folder that imports to the folder it uses; the number counts import statements.",
        "cycles": " Orange dashed arrows mark {n} {pair_w} of folders that import each other (circular dependencies).",
        "commit": " at commit {sha}",
        "unit_desc": "{files} {file_w}, {lines} {line_w}.",
        "file_desc": "{lines} {line_w}.",
        "loose": "Files directly in {path}/.", "loose_root": "Files at the top level of the repo.",
        "loose_plus": "Loose files in {path}/ plus small folders: {dirs}.", "loose_root_plus": "Top-level files plus small folders: {dirs}.",
        "uses": "Uses {libs}.",
        "imports": "{n} imports", "import1": "1 import",
        "inside": "Inside {title}",
        "inside_summary": "The {what} inside {path}/ and how they import each other. Dashed cards are other parts of the repo that this folder talks to.",
        "files_word": "files", "folders_word": "folders",
        "neighbor_desc": "Another part of the repo: {path}.",
        "rtl": "RTL hierarchy", "rtl_tag": "Generated from RTL",
        "rtl_summary": "Module hierarchy found in the Verilog and SystemVerilog sources. Arrows go from a module to the modules it instantiates; labels are instance names. Dashed cards have no source in the repo (IP, cell libraries or modules from elsewhere).",
        "rtl_ext_desc": "No source in this repo: IP, cell library or external module.",
        "rtl_more": " Also instantiates {n} more {module_w} not shown.",
        "step_entry": "Entry point: nothing else imports {title}, and it uses {n} other {part_w} of the repo.",
        "step_core": "Core: {n} other parts import {title}, so changes here have the widest impact.",
        "step_cycle": "Circular dependency: {a} and {b} import each other. Moving the shared code into its own folder would untangle them.",
        "step_rtl_top": "{title} is a top module; it instantiates {n} {module_w}.",
        "legend_cycle": "Circular dependency", "legend_import": "Import",
        "legend_other": "Other folders", "root": "repo root", "in_repo": "in the repo",
        "file_one": "file", "file_many": "files", "line_one": "line", "line_many": "lines", "part_one": "part", "part_many": "parts",
        "pair_one": "pair", "pair_many": "pairs", "module_one": "module", "module_many": "modules",
    },
    "vi": {
        "title": "{name}: bản đồ kiến trúc",
        "subtitle": "Sinh tự động từ mã nguồn; sửa file spec để biến nó thành một câu chuyện dễ hiểu.",
        "overview": "Tổng quan", "tag": "Sinh từ mã nguồn",
        "summary": "Sơ đồ sinh tự động từ mã nguồn {name} ({files} {file_w} {langs}{commit}). Mỗi khối là một thư mục. Mũi tên đi từ thư mục chứa lệnh import tới thư mục được dùng, con số trên mũi tên là số lệnh import.",
        "cycles": " Mũi tên nét đứt màu cam đánh dấu {n} cặp thư mục import lẫn nhau, tức là phụ thuộc vòng.",
        "commit": ", commit {sha}",
        "unit_desc": "{files} {file_w}, {lines} {line_w}.",
        "file_desc": "{lines} {line_w}.",
        "loose": "Các file nằm trực tiếp trong {path}/.", "loose_root": "Các file nằm ngay ở gốc repo.",
        "loose_plus": "Các file lẻ trong {path}/ và các thư mục nhỏ: {dirs}.", "loose_root_plus": "Các file ở gốc repo và các thư mục nhỏ: {dirs}.",
        "uses": "Dùng {libs}.",
        "imports": "{n} lệnh import", "import1": "1 lệnh import",
        "inside": "Bên trong {title}",
        "inside_summary": "Các {what} bên trong {path}/ và cách chúng import lẫn nhau. Khối viền nét đứt là phần khác của repo có liên quan.",
        "files_word": "file", "folders_word": "thư mục con",
        "neighbor_desc": "Phần khác của repo: {path}.",
        "rtl": "Cây module RTL", "rtl_tag": "Sinh từ RTL",
        "rtl_summary": "Cây module tìm thấy trong mã Verilog và SystemVerilog. Mũi tên đi từ một module tới các module con mà nó khởi tạo, nhãn là tên instance. Khối viền nét đứt là module không có mã nguồn trong repo, ví dụ IP, thư viện cell hoặc module từ nơi khác.",
        "rtl_ext_desc": "Không có mã nguồn trong repo này: IP, thư viện cell hoặc module bên ngoài.",
        "rtl_more": " Còn khởi tạo thêm {n} module không hiện trên sơ đồ.",
        "step_entry": "Điểm vào: không phần nào khác import {title}, còn {title} dùng {n} phần khác của repo.",
        "step_core": "Phần lõi: {n} phần khác import {title}, nên sửa ở đây ảnh hưởng rộng nhất.",
        "step_cycle": "Phụ thuộc vòng: {a} và {b} import lẫn nhau. Nên tách phần dùng chung ra một thư mục riêng.",
        "step_rtl_top": "{title} là module đỉnh, khởi tạo {n} module con.",
        "legend_cycle": "Phụ thuộc vòng", "legend_import": "Lệnh import",
        "legend_other": "Thư mục khác", "root": "gốc repo", "in_repo": "trong repo",
        "file_one": "file", "file_many": "file", "line_one": "dòng", "line_many": "dòng", "part_one": "phần", "part_many": "phần",
        "pair_one": "cặp", "pair_many": "cặp", "module_one": "module", "module_many": "module",
    },
}


# --------------------------------------------------------------------------- helpers

def dirname(path):
    return path.rsplit("/", 1)[0] if "/" in path else ""


def read_text(path):
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""


def number(n, lang):
    s = f"{n:,}"
    return s.replace(",", ".") if lang == "vi" else s


def first_sentence(text, limit=120):
    text = " ".join(str(text).split())
    if not text:
        return ""
    m = re.match(r"(.+?[.!?])(?:\s|$)", text)
    s = m.group(1) if m else text
    return s if len(s) <= limit else s[: limit - 1].rstrip() + "…"


def clip(text, limit):
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


C_TOKENS = re.compile(r"""//[^\n]*|/\*.*?\*/|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`""", re.S)
C_TOKENS_NO_BACKTICK = re.compile(r"""//[^\n]*|/\*.*?\*/|"(?:\\.|[^"\\\n])*\"""", re.S)


def strip_comments(text, backtick_strings=True):
    """Remove // and /* */ comments but keep string literals (they hold import paths)."""
    pattern = C_TOKENS if backtick_strings else C_TOKENS_NO_BACKTICK

    def repl(m):
        s = m.group(0)
        if s.startswith("//"):
            return ""
        if s.startswith("/*"):
            return "\n" * s.count("\n")
        return s
    return pattern.sub(repl, text)


HEADER_BLOCK = re.compile(r"\s*/\*(.*?)\*/", re.S)
HEADER_LINES = re.compile(r"\s*((?:[ \t]*//[^\n]*(?:\n|$))+)")
BOILERPLATE = re.compile(
    r"^(author|date|created|modified|revision|version|file ?name|file|project|company|engineer|designer|copyright|"
    r"license|history|change ?log|module ?name|module|target devices?|tool versions?|dependencies|additional comments)\b\s*[:=-]",
    re.I,
)
NOISE = re.compile(r"copyright|licen[cs]e|spdx|all rights reserved|@generated|eslint|prettier|tslint|jshint|istanbul|@ts-|use strict", re.I)
LEAD_LABEL = re.compile(r"^(description|desc|brief|summary|purpose|overview)\s*[:=-]\s*", re.I)


def header_comment(text):
    """First meaningful sentence of the comment block(s) at the top of a C-style file."""
    pos = text.find("\n") + 1 if text.startswith("#!") else 0
    for _ in range(6):
        m = HEADER_BLOCK.match(text, pos) or HEADER_LINES.match(text, pos)
        if not m:
            break
        pos = m.end()
        lines = []
        for raw in m.group(1).splitlines():
            line = re.sub(r"^\s*(?:\*+|//+|!)\s?", "", raw).strip()
            line = LEAD_LABEL.sub("", line)
            if not line or line.startswith("@") or BOILERPLATE.match(line) or not re.search(r"[A-Za-zÀ-ỹ]", line):
                continue
            lines.append(line)
        cleaned = " ".join(lines)
        if cleaned and not NOISE.search(cleaned):
            return first_sentence(cleaned)
    return ""


def load_jsonc(path):
    text = strip_comments(read_text(path), backtick_strings=False)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    try:
        return json.loads(text)
    except ValueError:
        return {}


# --------------------------------------------------------------------------- file discovery

class FileInfo:
    __slots__ = ("path", "lang", "ext", "lines", "doc", "raw", "deps", "externals", "modules", "instances", "packages", "jpackage", "ports")

    def __init__(self, path, lang):
        self.path, self.lang = path, lang
        self.ext = posixpath.splitext(path)[1].lower()
        self.lines = 0
        self.doc = ""
        self.raw = []                # language-specific import records
        self.deps = Counter()        # resolved file path, or "dir/" for a package folder -> count
        self.externals = Counter()   # outside package -> count
        self.modules = []            # Verilog modules defined here
        self.ports = {}              # Verilog module -> {"in": [...], "out": [...], "inout": [...]}
        self.instances = []          # Verilog (parent, child type, instance name)
        self.packages = []           # SystemVerilog packages defined here
        self.jpackage = ""           # Java/Kotlin package


def list_repo(root):
    """Every file path under root (posix, relative), honouring .gitignore when root is inside a git work tree."""
    try:
        res = subprocess.run(
            ["git", "-C", str(root), "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
            capture_output=True, timeout=120,
        )
        if res.returncode == 0:
            paths = [p for p in res.stdout.decode("utf-8", "replace").split("\0") if p]
            if paths:
                return paths
    except (OSError, subprocess.SubprocessError):
        pass
    paths = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS and not d.startswith("."))
        for f in filenames:
            paths.append(os.path.relpath(os.path.join(dirpath, f), root).replace(os.sep, "/"))
    return paths


def is_test(rel):
    parts = rel.split("/")
    return any(p.lower() in TEST_DIRS for p in parts[:-1]) or any(fnmatch.fnmatch(parts[-1], pat) for pat in TEST_FILES)


def is_tool_config(name):
    low = name.lower()
    return any(low.startswith(t + ".config.") or low.startswith("." + t + "rc") or low.startswith(t + ".js") and t in ("gulpfile", "gruntfile")
               for t in TOOL_CONFIGS)


def select_code(root, listed, include_tests, excludes, include_extra=False):
    chosen = []
    for rel in listed:
        parts = rel.split("/")
        if any(p in SKIP_DIRS or (p.startswith(".") and p not in (".", "..")) for p in parts[:-1]):
            continue
        if not include_extra and (any(p.lower() in EXTRA_DIRS for p in parts[:-1][:2])
                                  or (len(parts) > 1 and parts[0].lower() in EXTRA_TOP_DIRS)):
            continue
        name = parts[-1]
        lang = LANG_BY_EXT.get(posixpath.splitext(name)[1].lower())
        if not lang or any(fnmatch.fnmatch(name, pat) for pat in SKIP_FILES) or is_tool_config(name):
            continue
        if not include_tests and is_test(rel):
            continue
        if any(fnmatch.fnmatch(rel, pat) or fnmatch.fnmatch(name, pat) for pat in excludes):
            continue
        full = root / rel
        try:
            if not full.is_file() or full.stat().st_size > MAX_BYTES:
                continue
        except OSError:
            continue
        chosen.append((rel, lang))
    return sorted(chosen)


# --------------------------------------------------------------------------- parsers

def parse_python(info, text):
    try:
        tree = ast.parse(text)
    except (SyntaxError, ValueError):
        for m in re.finditer(r"^\s*from\s+(\.*)([\w.]*)\s+import\s+([\w*, ()]+)|^\s*import\s+([\w., ]+)", text, re.M):
            if m.group(4):
                for name in m.group(4).split(","):
                    name = name.strip().split(" ")[0]
                    if name:
                        info.raw.append(("import", 0, name, ()))
            else:
                names = tuple(n.strip().split(" ")[0] for n in m.group(3).strip("() ").split(",") if n.strip())
                info.raw.append(("from", len(m.group(1)), m.group(2), names))
        return
    info.doc = first_sentence(ast.get_docstring(tree) or "")
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                info.raw.append(("import", 0, alias.name, ()))
        elif isinstance(node, ast.ImportFrom):
            info.raw.append(("from", node.level or 0, node.module or "", tuple(a.name for a in node.names)))


JS_IMPORTS = (
    re.compile(r"""\bimport\s+(?:type\s+)?(?:[\w$*{}\s,]+?\s+from\s+)?(['"])([^'"\n]+)\1"""),
    re.compile(r"""\bexport\s+(?:type\s+)?(?:\*(?:\s+as\s+[\w$]+)?|\{[^}]*\})\s*from\s+(['"])([^'"\n]+)\1"""),
    re.compile(r"""\b(?:require|import)\s*\(\s*(['"])([^'"\n]+)\1\s*\)"""),
)


def parse_js(info, text):
    info.doc = header_comment(text)
    clean = strip_comments(text)
    for pattern in JS_IMPORTS:
        for m in pattern.finditer(clean):
            info.raw.append(m.group(2))


GO_BLOCK = re.compile(r"\bimport\s*\((.*?)\)", re.S)
GO_SINGLE = re.compile(r'\bimport\s+(?:[\w.]+\s+)?"([^"]+)"')
GO_SPEC = re.compile(r'"([^"]+)"')


def parse_go(info, text):
    info.doc = header_comment(text)
    clean = strip_comments(text)
    for m in GO_BLOCK.finditer(clean):
        info.raw.extend(GO_SPEC.findall(m.group(1)))
    info.raw.extend(GO_SINGLE.findall(clean))


JAVA_PACKAGE = re.compile(r"^\s*package\s+([\w.]+)", re.M)
JAVA_IMPORT = re.compile(r"^\s*import\s+(?:static\s+)?([\w.]+(?:\.\*)?)", re.M)


def parse_java(info, text):
    info.doc = header_comment(text)
    clean = strip_comments(text, backtick_strings=False)
    m = JAVA_PACKAGE.search(clean)
    info.jpackage = m.group(1) if m else ""
    for m in JAVA_IMPORT.finditer(clean):
        info.raw.append(m.group(1))


C_INCLUDE = re.compile(r'^\s*#\s*include\s*([<"])([^>"\n]+)[>"]', re.M)


def parse_c(info, text):
    info.doc = header_comment(text)
    clean = strip_comments(text, backtick_strings=False)
    for m in C_INCLUDE.finditer(clean):
        info.raw.append((m.group(1), m.group(2).strip()))


V_MODULE = re.compile(r"\b(module|macromodule|interface|program)\s+(?:(?:automatic|static)\s+)?([A-Za-z_]\w*)")
V_PACKAGE = re.compile(r"\bpackage\s+([A-Za-z_]\w*)\s*;")
V_IMPORT = re.compile(r"\bimport\s+([A-Za-z_]\w*)\s*::")
V_INCLUDE = re.compile(r'`include\s+"([^"]+)"')
V_INSTANCE = re.compile(
    r"(?m)^[ \t]*([A-Za-z_]\w*)(?:\s*#\s*\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)\s*|\s+)([A-Za-z_]\w*)\s*(?:\[[^\]]*\]\s*)?\("
)


V_NET_WORDS = {"wire", "reg", "logic", "bit", "var", "signed", "unsigned", "tri", "tri0", "tri1", "wand", "wor", "supply0", "supply1",
               "integer", "int", "shortint", "longint", "byte", "real", "time", "string", "interconnect", "uwire"}
V_DIR = {"input": "in", "output": "out", "inout": "inout", "ref": "inout"}


def _split_top(text):
    """Split on commas that are not inside (), [] or {}."""
    parts, depth, cur = [], 0, []
    for ch in text:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    if "".join(cur).strip():
        parts.append("".join(cur))
    return parts


def _port_name(entry):
    """Name and packed range of one port entry such as 'input logic [7:0] data = 0'."""
    t = re.sub(r"=.*$", "", entry, flags=re.S).strip()
    t = re.sub(r"(\s*\[[^\]]*\])+\s*$", "", t)            # unpacked dimensions after the name
    m = re.search(r"([A-Za-z_]\w*)\s*$", t)
    if not m:
        return None, None, t
    head = t[:m.start()]
    ranges = re.findall(r"\[[^\]]*\]", head)
    return m.group(1), ranges[-1].replace(" ", "") if ranges else None, head.strip()


def verilog_ports(header, body):
    """Ports of one module: ANSI lists in the header, or old-style declarations in the body."""
    ports = {"in": [], "out": [], "inout": []}
    lists = []
    depth, start = 0, None
    for i, ch in enumerate(header):
        if ch == "(":
            if depth == 0:
                start = i + 1
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0 and start is not None:
                lists.append(header[start:i])
    if not lists:
        return ports
    port_list = lists[-1]
    if re.search(r"\b(input|output|inout|ref)\b", port_list):
        direction, width = None, None
        for entry in _split_top(port_list):
            name, rng, head = _port_name(entry)
            if not name:
                continue
            words = head.replace("[", " [").split()
            first = words[0] if words else ""
            if first in V_DIR:
                direction, width = V_DIR[first], rng
            elif words and first not in V_NET_WORDS and not first.startswith("["):
                direction, width = "inout", None          # interface port such as axi_if.master m_axi
            elif rng:
                width = rng
            if direction:
                ports[direction].append(name + (width or ""))
        return ports
    for m in re.finditer(r"\b(input|output|inout)\b([^;]*);", body):
        direction, rng = V_DIR[m.group(1)], None
        for k, entry in enumerate(_split_top(m.group(2))):
            name, r, _ = _port_name(entry if k else m.group(1) + " " + entry)
            if not name:
                continue
            rng = r or rng if k else r
            ports[direction].append(name + (rng or ""))
    return ports


def parse_verilog(info, text):
    info.doc = header_comment(text)
    clean = strip_comments(text, backtick_strings=False)
    info.packages = V_PACKAGE.findall(clean)
    info.raw = [("pkg", p) for p in V_IMPORT.findall(clean)] + [("inc", p) for p in V_INCLUDE.findall(clean)]
    for m in V_MODULE.finditer(clean):
        kind, name = m.group(1), m.group(2)
        end_word = "endmodule" if kind in ("module", "macromodule") else "end" + kind
        end = re.compile(r"\b" + end_word + r"\b").search(clean, m.end())
        body = clean[m.end(): end.start() if end else len(clean)]
        depth, start = 0, len(body)
        for i, ch in enumerate(body):
            if ch == "(":
                depth += 1
            elif ch == ")":
                depth -= 1
            elif ch == ";" and depth <= 0:
                start = i + 1
                break
        info.modules.append(name)
        ports = verilog_ports(body[:start], body[start:])
        if any(ports.values()):
            info.ports[name] = ports
        for im in V_INSTANCE.finditer(body, start):
            child, inst = im.group(1), im.group(2)
            if child in V_KEYWORDS or child in V_PRIMITIVES or inst in V_KEYWORDS:
                continue
            info.instances.append((name, child, inst))


PARSERS = {"python": parse_python, "js": parse_js, "go": parse_go, "java": parse_java, "c": parse_c, "verilog": parse_verilog}


# --------------------------------------------------------------------------- resolution

class Repo:
    def __init__(self, root, listed, files):
        self.root = root
        self.listed = listed
        self.files = {f.path: f for f in files}
        self.code_dirs = set()
        for p in self.files:
            d = dirname(p)
            while True:
                self.code_dirs.add(d)
                if not d:
                    break
                d = dirname(d)
        self.unresolved = Counter()


def py_index(repo):
    index = defaultdict(list)
    for path, f in repo.files.items():
        if f.lang != "python":
            continue
        parts = path[:-3].split("/")
        mod = parts[:-1] if parts[-1] == "__init__" else parts
        for i in range(len(mod)):
            name = mod[i:]
            if name and all(p.isidentifier() for p in name):
                index[".".join(name)].append((path, "/".join(mod[:i])))
    return index


def closest(candidates, importer):
    """Prefer a candidate whose import root contains the importer (same project), then the nearest one."""
    imp_dir = dirname(importer)
    best, best_key = None, None
    for path, root in candidates:
        if path == importer:
            continue
        inside = root == "" or imp_dir == root or imp_dir.startswith(root + "/")
        key = (inside, len(root) if inside else -len(root), len(os.path.commonprefix([path, importer])))
        if best_key is None or key > best_key:
            best, best_key = path, key
    return best


def py_path(repo, parts):
    base = "/".join(parts)
    for cand in (base + ".py", base + "/__init__.py"):
        if cand in repo.files:
            return cand
    return None


def resolve_python(repo):
    index = py_index(repo)
    for f in repo.files.values():
        if f.lang != "python":
            continue
        for kind, level, module, names in f.raw:
            targets = []
            if level:
                base = f.path.split("/")[:-1]
                if level - 1 > len(base):
                    continue
                base = base[: len(base) - (level - 1)]
                mod = module.split(".") if module else []
                for n in names:
                    if n != "*":
                        t = py_path(repo, base + mod + [n])
                        if t:
                            targets.append(t)
                if not targets:
                    t = py_path(repo, base + mod)
                    if t:
                        targets.append(t)
                if not targets:
                    repo.unresolved[("python", "." * level + module)] += 1
            else:
                names_to_try = [module + "." + n for n in names if n != "*"] if kind == "from" else []
                for full in names_to_try:
                    if full in index:
                        t = closest(index[full], f.path)
                        if t:
                            targets.append(t)
                if not targets:
                    parts = module.split(".")
                    for k in range(len(parts), 0, -1):
                        name = ".".join(parts[:k])
                        if name in index:
                            t = closest(index[name], f.path)
                            if t:
                                targets.append(t)
                            break
                if not targets:
                    top = module.split(".")[0]
                    if top and top not in PY_STDLIB:
                        f.externals[top] += 1
            for t in targets:
                if t != f.path:
                    f.deps[t] += 1


JS_EXTS = (".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs")


def js_file(repo, base):
    base = posixpath.normpath(base)
    if base.startswith("../"):
        return None
    stem, ext = posixpath.splitext(base)
    cands = [base]
    if ext in (".js", ".jsx", ".mjs", ".cjs"):
        cands += [stem + e for e in (".ts", ".tsx", ".mts", ".cts")]
    cands += [base + e for e in JS_EXTS] + [base + "/index" + e for e in JS_EXTS]
    for c in cands:
        if c in repo.files:
            return c
    return None


def load_tsconfigs(repo):
    configs = {}
    cache = {}

    def load(rel, depth=0):
        if rel in cache or depth > 5:
            return cache.get(rel, {})
        data = load_jsonc(repo.root / rel)
        co = data.get("compilerOptions") or {}
        result = {}
        ext = data.get("extends")
        if isinstance(ext, str) and ext.startswith("."):
            parent = posixpath.normpath(posixpath.join(dirname(rel), ext))
            if not parent.endswith(".json"):
                parent += ".json"
            result.update(load(parent, depth + 1))
        here = dirname(rel)
        if isinstance(co.get("baseUrl"), str):
            result["base"] = posixpath.normpath(posixpath.join(here, co["baseUrl"]))
        if isinstance(co.get("paths"), dict):
            result["paths"] = co["paths"]
            result["paths_base"] = result.get("base", here) if isinstance(co.get("baseUrl"), str) else here
        cache[rel] = result
        return result

    for rel in repo.listed:
        name = rel.rsplit("/", 1)[-1]
        if name in ("tsconfig.json", "jsconfig.json") and "node_modules/" not in rel:
            configs[dirname(rel)] = load(rel)
    return configs


def load_workspace_packages(repo):
    packages = {}
    for rel in repo.listed:
        if rel.rsplit("/", 1)[-1] == "package.json" and "node_modules/" not in rel:
            data = load_jsonc(repo.root / rel)
            name = data.get("name")
            if isinstance(name, str) and name:
                packages[name] = (dirname(rel), data)
    return packages


def nearest(configs, path):
    d = dirname(path)
    while True:
        if d in configs:
            return configs[d]
        if not d:
            return None
        d = dirname(d)


def package_entry(repo, pkg_dir, data, sub):
    join = lambda *p: posixpath.normpath(posixpath.join(pkg_dir, *p)) if pkg_dir else posixpath.normpath(posixpath.join(*p))
    if sub:
        for base in (join(sub), join("src", sub)):
            hit = js_file(repo, base)
            if hit:
                return hit
    else:
        for field in ("source", "module", "main", "types", "typings"):
            value = data.get(field)
            if isinstance(value, str):
                value = re.sub(r"\.d\.(ts|mts|cts)$", "", value)
                hit = js_file(repo, join(value))
                if not hit:
                    hit = js_file(repo, join(re.sub(r"^(\./)?(dist|lib|build|out)/", "src/", value)))
                if hit:
                    return hit
        for base in (join("src", "index"), join("index")):
            hit = js_file(repo, base)
            if hit:
                return hit
    return (pkg_dir + "/") if pkg_dir in repo.code_dirs else None


def resolve_js(repo):
    configs = load_tsconfigs(repo)
    packages = load_workspace_packages(repo)
    names = sorted(packages, key=len, reverse=True)
    for f in repo.files.values():
        if f.lang != "js":
            continue
        cfg = nearest(configs, f.path) or {}
        for spec in f.raw:
            spec = spec.split("?")[0]
            target = None
            if spec.startswith("."):
                target = js_file(repo, posixpath.join(dirname(f.path), spec))
                if not target:
                    if posixpath.splitext(spec)[1] in ("", ".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"):
                        repo.unresolved[("js", spec)] += 1
                    continue
            else:
                if spec.startswith("node:") or spec.split("/")[0] in NODE_BUILTINS or re.match(r"^[a-z]+:", spec):
                    continue
                for pattern, targets in (cfg.get("paths") or {}).items():
                    if not isinstance(targets, list):
                        continue
                    if "*" in pattern:
                        pre, post = pattern.split("*", 1)
                        if not (spec.startswith(pre) and spec.endswith(post) and len(spec) >= len(pre) + len(post)):
                            continue
                        star = spec[len(pre): len(spec) - len(post) if post else len(spec)]
                    elif spec != pattern:
                        continue
                    else:
                        star = ""
                    for t in targets:
                        if isinstance(t, str):
                            target = js_file(repo, posixpath.join(cfg["paths_base"], t.replace("*", star)))
                            if target:
                                break
                    if target:
                        break
                if not target and cfg.get("base"):
                    target = js_file(repo, posixpath.join(cfg["base"], spec))
                if not target:
                    for name in names:
                        if spec == name or spec.startswith(name + "/"):
                            pkg_dir, data = packages[name]
                            target = package_entry(repo, pkg_dir, data, spec[len(name) + 1:])
                            break
                if not target:
                    parts = spec.split("/")
                    ext_name = "/".join(parts[:2]) if spec.startswith("@") else parts[0]
                    if ext_name and not ext_name.startswith(("~", "#", "$")):
                        f.externals[ext_name] += 1
                    continue
            if target and target != f.path:
                f.deps[target] += 1


def resolve_go(repo):
    modules = []
    for rel in repo.listed:
        if rel.rsplit("/", 1)[-1] == "go.mod":
            m = re.search(r"^\s*module\s+(\S+)", read_text(repo.root / rel), re.M)
            if m:
                modules.append((m.group(1).strip('"'), dirname(rel)))
    modules.sort(key=lambda x: -len(x[0]))
    for f in repo.files.values():
        if f.lang != "go":
            continue
        for imp in f.raw:
            target = None
            for mod_path, mod_dir in modules:
                if imp == mod_path or imp.startswith(mod_path + "/"):
                    sub = imp[len(mod_path):].lstrip("/")
                    d = posixpath.join(mod_dir, sub) if mod_dir else sub
                    d = d.rstrip("/")
                    if d in repo.code_dirs and d != dirname(f.path):
                        target = d + "/"
                    elif d != dirname(f.path):
                        repo.unresolved[("go", imp)] += 1
                    break
            else:
                first = imp.split("/")[0]
                if "." in first:
                    parts = imp.split("/")
                    f.externals["/".join(parts[:3]) if first in ("github.com", "gitlab.com", "bitbucket.org", "golang.org") else first] += 1
            if target:
                f.deps[target] += 1


def resolve_java(repo):
    by_package = defaultdict(set)
    for f in repo.files.values():
        if f.lang == "java" and f.jpackage:
            by_package[f.jpackage].add(f.path)
    for f in repo.files.values():
        if f.lang != "java":
            continue
        for imp in f.raw:
            name = imp[:-2] if imp.endswith(".*") else imp
            if name.startswith(JVM_PLATFORM):
                continue
            parts = name.split(".")
            target = None
            for k in range(len(parts), 0, -1):
                pkg = ".".join(parts[:k])
                if pkg in by_package:
                    cls = parts[k] if k < len(parts) else None
                    files = by_package[pkg]
                    if cls:
                        for p in files:
                            if posixpath.splitext(p.rsplit("/", 1)[-1])[0] == cls:
                                target = p
                                break
                    if not target:
                        target = dirname(sorted(files)[0]) + "/"
                    break
            if target:
                if target != f.path and target != dirname(f.path) + "/":
                    f.deps[target] += 1
            else:
                f.externals[".".join(parts[:2])] += 1


def suffix_index(repo, langs):
    index = defaultdict(list)
    for p, f in repo.files.items():
        if f.lang in langs:
            index[p.rsplit("/", 1)[-1]].append(p)
    return index


def resolve_include(repo, f, inc, index):
    for base in (dirname(f.path), ""):
        cand = posixpath.normpath(posixpath.join(base, inc)) if base else posixpath.normpath(inc)
        if cand in repo.files:
            return cand
    hits = [p for p in index.get(inc.rsplit("/", 1)[-1], []) if p == inc or p.endswith("/" + inc)]
    if hits:
        return max(hits, key=lambda p: len(os.path.commonprefix([p, f.path])))
    return None


def resolve_c(repo):
    index = suffix_index(repo, ("c",))
    for f in repo.files.values():
        if f.lang != "c":
            continue
        for kind, inc in f.raw:
            target = resolve_include(repo, f, inc, index)
            if target:
                if target != f.path:
                    f.deps[target] += 1
            elif kind == "<" and "/" in inc and inc.split("/")[0] not in C_SYSTEM_DIRS:
                f.externals[inc.split("/")[0]] += 1
            elif kind == '"':
                repo.unresolved[("c", inc)] += 1


def resolve_verilog(repo):
    defined, packages = {}, {}
    for f in repo.files.values():
        if f.lang == "verilog":
            for m in f.modules:
                defined.setdefault(m, f.path)
            for p in f.packages:
                packages.setdefault(p, f.path)
    index = suffix_index(repo, ("verilog",))
    for f in repo.files.values():
        if f.lang != "verilog":
            continue
        for kind, name in f.raw:
            target = packages.get(name) if kind == "pkg" else resolve_include(repo, f, name, index)
            if target and target != f.path:
                f.deps[target] += 1
        for _parent, child, _inst in f.instances:
            target = defined.get(child)
            if target and target != f.path:
                f.deps[target] += 1
            elif not target:
                f.externals[child] += 1
    return defined


# --------------------------------------------------------------------------- units

def choose_units(paths, base, max_units, min_split=4):
    """Pick folders under base, splitting the biggest first, up to max_units.

    A unit is ("dir", path, ()) for a whole folder, or ("files", path, small) for the
    files directly in a folder plus any sub-folders too small to deserve a card.
    """
    total, direct, kids = Counter(), Counter(), defaultdict(set)
    for p in paths:
        d = dirname(p)
        direct[d] += 1
        cur = d
        while True:
            total[cur] += 1
            if cur == base:
                break
            parent = dirname(cur)
            kids[parent].add(cur)
            cur = parent
    small = 0 if total[base] <= max_units * 4 else max(3, total[base] // 100)

    def collapse(d):
        while not direct[d] and len(kids[d]) == 1:
            d = next(iter(kids[d]))
        return d

    def expand(d):
        big = [k for k in sorted(kids[d]) if total[k] > small]
        tiny = tuple(k for k in sorted(kids[d]) if total[k] <= small)
        out = [("dir", collapse(k), ()) for k in big]
        if direct[d] or tiny:
            out.append(("files", d, tiny))
        return out

    units = expand(collapse(base))
    while True:
        cands = sorted((u for u in units if u[0] == "dir" and total[u[1]] >= min_split and len(expand(u[1])) > 1),
                       key=lambda u: -total[u[1]])
        for u in cands:
            new = expand(u[1])
            if len(units) - 1 + len(new) <= max_units:
                i = units.index(u)
                units[i:i + 1] = new
                break
        else:
            break
    return units


def unit_mapper(units):
    dirs = sorted(((u[1], u) for u in units if u[0] == "dir"), key=lambda x: -len(x[0]))
    folded = sorted(((f, u) for u in units if u[0] == "files" for f in u[2]), key=lambda x: -len(x[0]))
    loose = {u[1]: u for u in units if u[0] == "files"}

    def unit_of(target):
        probe = target[:-1] if target.endswith("/") else target
        for p, u in dirs:
            if probe == p or probe.startswith(p + "/"):
                return u
        for p, u in folded:
            if probe == p or probe.startswith(p + "/"):
                return u
        return loose.get(probe if target.endswith("/") else dirname(target))
    return unit_of


def members(unit, paths):
    kind, p, folded = unit
    if kind == "dir":
        return [x for x in paths if x.startswith(p + "/")]
    return [x for x in paths if dirname(x) == p or any(x.startswith(f + "/") for f in folded)]


def tarjan(nodes, adj):
    index, low, on, stack, out, counter = {}, {}, set(), [], [], [0]

    def visit(v):
        index[v] = low[v] = counter[0]
        counter[0] += 1
        stack.append(v)
        on.add(v)
        for w in adj.get(v, ()):
            if w not in index:
                visit(w)
                low[v] = min(low[v], low[w])
            elif w in on:
                low[v] = min(low[v], index[w])
        if low[v] == index[v]:
            comp = []
            while True:
                w = stack.pop()
                on.discard(w)
                comp.append(w)
                if w == v:
                    break
            out.append(comp)

    sys.setrecursionlimit(max(10000, len(nodes) * 4))
    for v in nodes:
        if v not in index:
            visit(v)
    return out


def make_id(text, used):
    base = re.sub(r"[^A-Za-z0-9_.-]+", "-", text).strip("-.")[:56] or "n"
    cand, k = base, 2
    while cand in used:
        cand, k = f"{base}-{k}", k + 1
    used.add(cand)
    return cand


def readme_sentence(root, d):
    for name in ("README.md", "readme.md", "Readme.md", "README.rst", "README.txt", "README"):
        text = read_text(root / d / name) if d else read_text(root / name)
        if not text:
            continue
        for block in re.split(r"\n\s*\n", text):
            block = block.strip()
            if not block or block.startswith(("#", "!", "[!", "<", "```", "|", "---", "===")):
                continue
            block = re.sub(r"!\[[^\]]*\]\([^)]*\)|<[^>]+>", "", block)
            block = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", block)
            block = re.sub(r"[*_`]+", "", block).strip()
            if len(block) > 20:
                return first_sentence(block)
    return ""


def unit_doc(repo, unit, paths):
    kind, d = unit[0], unit[1]
    if kind == "dir":
        doc = readme_sentence(repo.root, d)
        if doc:
            return doc
        pkg = load_jsonc(repo.root / d / "package.json") if (repo.root / d / "package.json").is_file() else {}
        if isinstance(pkg.get("description"), str) and pkg["description"].strip():
            return first_sentence(pkg["description"])
        init = repo.files.get(d + "/__init__.py")
        if init and init.doc:
            return init.doc
    fan_in = Counter()
    for p in paths:
        for t in repo.files[p].deps:
            if t in repo.files and repo.files[t].path in paths:
                fan_in[t] += 1
    ranked = sorted(paths, key=lambda p: (-fan_in[p], -repo.files[p].lines))
    for p in ranked[:5]:
        if repo.files[p].doc:
            return repo.files[p].doc
    return ""


# --------------------------------------------------------------------------- spec building

def unit_title(unit, base_name, lang):
    kind, d = unit[0], unit[1]
    name = d.rsplit("/", 1)[-1] if d else base_name
    return clip(name + "/*" if kind == "files" else name, 40)


def loose_text(T, unit):
    names = ", ".join(f.rsplit("/", 1)[-1] for f in unit[2][:4]) + (", …" if len(unit[2]) > 4 else "")
    if unit[2]:
        return T["loose_plus"].format(path=unit[1], dirs=names) if unit[1] else T["loose_root_plus"].format(dirs=names)
    return T["loose"].format(path=unit[1]) if unit[1] else T["loose_root"]


def w(T, key, n):
    return T[key + ("_one" if n == 1 else "_many")]


def label_count(n, T):
    return T["import1"] if n == 1 else T["imports"].format(n=n)


def build_groups(units, base, used_ids, T):
    """Folders that hold two or more units become groups (at most two nesting levels)."""
    under = defaultdict(set)
    for u in units:
        d = u[1] if u[0] == "files" else dirname(u[1])
        while True:
            if d != base and (not base or d.startswith(base + "/")):
                under[d].add(u)
            if d == base or not d:
                break
            d = dirname(d)
    candidates = {d for d, s in under.items() if len(s) >= 2}
    for d in sorted(candidates, key=len):
        child_sets = [under[c] for c in candidates if c != d and dirname(c) == d or (c.startswith(d + "/") and c != d)]
        if any(s == under[d] for s in child_sets):
            candidates.discard(d)
    groups = {}
    for d in sorted(candidates, key=len):
        parts = d.split("/")
        label = "/".join(parts[-3:]) if len("/".join(parts[-3:])) <= 28 else "…/" + "/".join(parts[-2:])
        groups[d] = {"id": make_id("g-" + d, used_ids), "label": clip(label, 34), "icon": "📁"}
    for d, g in groups.items():
        parents = [p for p in groups if d.startswith(p + "/")]
        if parents:
            g["parent"] = groups[max(parents, key=len)]["id"]
    for d, g in groups.items():
        chain, cur = 0, g
        while cur.get("parent"):
            chain += 1
            cur = next(x for x in groups.values() if x["id"] == cur["parent"])
        if chain >= 2:
            outer = cur
            g["parent"] = outer["id"]

    def group_of(u):
        d = u[1] if u[0] == "files" else dirname(u[1])
        best = None
        for gd in groups:
            if d == gd or d.startswith(gd + "/"):
                if best is None or len(gd) > len(best):
                    best = gd
        return groups[best]["id"] if best is not None else None
    return list(groups.values()), group_of


def category_colors(units, base, sizes, T):
    def top(u):
        rel = u[1][len(base) + 1:] if base and u[1].startswith(base + "/") else (u[1] if not base else "")
        return rel.split("/")[0] if rel else ""
    weight = Counter()
    for u in units:
        weight[top(u)] += sizes[u]
    order = [k for k, _ in weight.most_common()]
    colors, legend = {}, {}
    for i, k in enumerate(order):
        color = CATEGORY_COLORS[i] if i < len(CATEGORY_COLORS) - 1 else "slate"
        colors[k] = color
        name = (k + "/") if k else T["root"]
        legend[color] = name if color not in legend else legend[color]
        if i >= len(CATEGORY_COLORS) - 1:
            legend["slate"] = T["legend_other"]
    return (lambda u: colors[top(u)]), legend


def overview_diagram(repo, units, base, max_nodes, T, lang, meta):
    paths = sorted(repo.files)
    unit_of = unit_mapper(units)
    used = set()
    ids = {u: make_id("u-" + (u[1] or "root") + ("-files" if u[0] == "files" else ""), used) for u in units}
    members_of = {u: members(u, paths) for u in units}
    sizes = {u: len(members_of[u]) for u in units}
    weights = Counter()
    ext_by_unit = defaultdict(Counter)
    for p in paths:
        f = repo.files[p]
        src = unit_of(p)
        if src is None:
            continue
        ext_by_unit[src].update(f.externals)
        for t, n in f.deps.items():
            dst = unit_of(t)
            if dst is not None and dst != src:
                weights[(src, dst)] += n
    adj = defaultdict(set)
    for a, b in weights:
        adj[a].add(b)
    in_cycle = set()
    for comp in tarjan(units, adj):
        if len(comp) > 1:
            in_cycle.update(comp)
    fan_in = Counter(b for (a, b) in weights)
    fan_out = Counter(a for (a, b) in weights)
    groups, group_of = build_groups(units, base, used, T)
    color_of, legend_colors = category_colors(units, base, sizes, T)
    titles = {u: unit_title(u, meta["name"], lang) for u in units}
    dup = Counter(titles.values())
    for u in units:
        if dup[titles[u]] > 1 and u[1]:
            parent = dirname(u[1]).rsplit("/", 1)[-1]
            titles[u] = clip((parent + "/" if parent else "") + titles[u], 40)
    top_core = [u for u, n in fan_in.most_common(3) if n >= 2]
    nodes = []
    for u in units:
        lines = sum(repo.files[p].lines for p in members_of[u])
        desc = T["unit_desc"].format(files=number(sizes[u], lang), lines=number(lines, lang),
                                     file_w=w(T, "file", sizes[u]), line_w=w(T, "line", lines))
        doc = loose_text(T, u) if u[0] == "files" else unit_doc(repo, u, members_of[u])
        if doc:
            desc += " " + doc
        libs = [k for k, _ in ext_by_unit[u].most_common(3)]
        if libs and len(desc) < 110:
            desc += " " + T["uses"].format(libs=", ".join(libs))
        node = {"id": ids[u], "title": titles[u], "desc": clip(desc, 160), "color": color_of(u)}
        if u in top_core:
            node["size"] = "lg"
        elif sizes[u] <= 2 and fan_in[u] <= 1:
            node["size"] = "sm"
        g = group_of(u)
        if g:
            node["group"] = g
        nodes.append(node)
    ordered = sorted(weights.items(), key=lambda kv: -kv[1])
    edges, cycle_pairs = [], set()
    for rank, ((a, b), n) in enumerate(ordered):
        cyc = a in in_cycle and b in in_cycle and (b, a) in weights
        edge = {"from": ids[a], "to": ids[b]}
        if rank < 30 or cyc:
            edge["label"] = label_count(n, T)
        if cyc:
            edge["kind"] = "feedback"
            cycle_pairs.add(tuple(sorted((ids[a], ids[b]))))
        if n >= 5:
            edge["weight"] = min(n, 10)
        edges.append(edge)
    steps = []
    title_by_id = {ids[u]: titles[u] for u in units}
    entries = [u for u in units if fan_in[u] == 0 and fan_out[u] > 0]
    for u in sorted(entries, key=lambda u: -fan_out[u])[:2]:
        steps.append({"node": ids[u], "text": T["step_entry"].format(title=titles[u], n=fan_out[u], part_w=w(T, "part", fan_out[u]))})
    for u in top_core[:2]:
        steps.append({"node": ids[u], "text": T["step_core"].format(title=titles[u], n=fan_in[u], part_w=w(T, "part", fan_in[u]))})
    for a_id, b_id in sorted(cycle_pairs)[:1]:
        steps.append({"edge": [a_id, b_id] if any(e["from"] == a_id and e["to"] == b_id for e in edges) else [b_id, a_id],
                      "text": T["step_cycle"].format(a=title_by_id[a_id], b=title_by_id[b_id])})
    summary = T["summary"].format(name=meta["name"], files=number(meta["files"], lang), langs=meta["langs"], commit=meta["commit"],
                                  file_w=w(T, "file", meta["files"]))
    if cycle_pairs:
        summary += T["cycles"].format(n=len(cycle_pairs), pair_w=w(T, "pair", len(cycle_pairs)))
    diagram = {
        "id": "overview", "title": T["overview"], "tag": T["tag"], "summary": summary,
        "direction": "TB" if len(units) > 6 else "LR",
        "groups": [{"id": g["id"], "label": g["label"], "icon": g["icon"], "color": "slate", **({"parent": g["parent"]} if g.get("parent") else {})} for g in groups],
        "nodes": nodes, "edges": edges, "steps": steps,
        "legend": {"colors": legend_colors, "edges": {"normal": T["legend_import"], "feedback": T["legend_cycle"]}},
    }
    stats = {"units": len(units), "edges": len(edges), "cycles": len(cycle_pairs), "weights": weights, "ids": ids,
             "titles": titles, "sizes": sizes, "members": members_of}
    return diagram, stats


def detail_diagram(repo, unit, stats, units, max_nodes, T, lang):
    paths = stats["members"][unit]
    d = unit[1]
    used = set()
    unit_of = unit_mapper(units)
    if len(paths) <= max_nodes:
        subs = [("file", p, ()) for p in paths]
        file_set = set(paths)

        def sub_of(target):
            return ("file", target, ()) if target in file_set else None
    else:
        subs = choose_units(paths, d, max_nodes)
        sub_map = unit_mapper(subs)

        def sub_of(target):
            return sub_map(target) if unit_of(target) == unit else None

    ids = {s: make_id(("f-" if s[0] == "file" else "d-") + s[1] + ("-files" if s[0] == "files" else ""), used) for s in subs}
    weights, outside = Counter(), Counter()
    for p in paths:
        src = sub_of(p)
        for t, n in repo.files[p].deps.items():
            dst = sub_of(t)
            if dst is not None:
                if dst != src:
                    weights[(src, dst)] += n
                continue
            other = unit_of(t)
            if other is not None and other != unit:
                outside[(src, other, "out")] += n
    for p in sorted(repo.files):
        other = unit_of(p)
        if other is None or other == unit:
            continue
        for t, n in repo.files[p].deps.items():
            dst = sub_of(t) if unit_of(t) == unit else None
            if dst is not None:
                outside[(dst, other, "in")] += n
    neighbor_weight = Counter()
    for (s, o, _), n in outside.items():
        neighbor_weight[o] += n
    neighbors = [o for o, _ in neighbor_weight.most_common(8)]
    nids = {o: make_id("x-" + (o[1] or "root"), used) for o in neighbors}
    nodes = []
    sub_groups = {}
    for s in subs:
        if s[0] == "file":
            f = repo.files[s[1]]
            desc = T["file_desc"].format(lines=number(f.lines, lang), line_w=w(T, "line", f.lines)) + (" " + f.doc if f.doc else "")
            title = s[1].rsplit("/", 1)[-1]
            rel_dir = dirname(s[1])[len(d) + 1:] if dirname(s[1]).startswith(d + "/") else ""
            if rel_dir:
                sub_groups.setdefault(rel_dir.split("/")[0], None)
            node = {"id": ids[s], "title": clip(title, 40), "desc": clip(desc, 160), "color": "blue"}
            if rel_dir:
                node["_grp"] = rel_dir.split("/")[0]
        else:
            sub_paths = members(s, paths)
            lines = sum(repo.files[p].lines for p in sub_paths)
            desc = T["unit_desc"].format(files=number(len(sub_paths), lang), lines=number(lines, lang),
                                         file_w=w(T, "file", len(sub_paths)), line_w=w(T, "line", lines))
            doc = loose_text(T, s) if s[0] == "files" else unit_doc(repo, s, sub_paths)
            node = {"id": ids[s], "title": clip(s[1].rsplit("/", 1)[-1] + ("/*" if s[0] == "files" else ""), 40),
                    "desc": clip(desc + (" " + doc if doc else ""), 160), "color": "blue"}
        nodes.append(node)
    groups = []
    if len(sub_groups) >= 2 or (sub_groups and any("_grp" not in n for n in nodes)):
        for name in sorted(sub_groups):
            gid = make_id("g-" + name, used)
            sub_groups[name] = gid
            groups.append({"id": gid, "label": clip(name, 34), "icon": "📁", "color": "slate"})
    for n in nodes:
        grp = n.pop("_grp", None)
        if grp and sub_groups.get(grp):
            n["group"] = sub_groups[grp]
    fan_in = Counter(b for (a, b) in weights)
    for s, _ in fan_in.most_common(2):
        for n in nodes:
            if n["id"] == ids[s]:
                n["size"] = "lg"
    for o in neighbors:
        nodes.append({"id": nids[o], "title": stats["titles"].get(o, clip(o[1].rsplit("/", 1)[-1] or ".", 40)),
                      "desc": clip(T["neighbor_desc"].format(path=(o[1] or ".") + ("/*" if o[0] == "files" else "/")), 160),
                      "color": "slate", "size": "sm", "external": True})
    edges = []
    for (a, b), n in sorted(weights.items(), key=lambda kv: -kv[1])[:60]:
        edges.append({"from": ids[a], "to": ids[b], "label": label_count(n, T)})
    for (s, o, direction), n in sorted(outside.items(), key=lambda kv: -kv[1]):
        if o not in nids or s is None:
            continue
        a, b = (ids[s], nids[o]) if direction == "out" else (nids[o], ids[s])
        edges.append({"from": a, "to": b, "label": label_count(n, T), "kind": "normal"})
        if len(edges) >= 80:
            break
    title = stats["titles"][unit]
    what = T["files_word"] if subs and subs[0][0] == "file" else T["folders_word"]
    return {
        "id": make_id("inside-" + (d or "root"), set()),
        "title": clip(T["inside"].format(title=title), 40),
        "tag": T["tag"],
        "summary": T["inside_summary"].format(what=what, path=d or "."),
        "direction": "TB" if len(nodes) > 7 else "LR",
        "groups": groups, "nodes": nodes, "edges": edges,
        "legend": {"edges": {"normal": T["legend_import"]}},
    }


def rtl_diagram(repo, defined, max_nodes, T, lang):
    children = defaultdict(Counter)
    inst_names = defaultdict(list)
    for f in repo.files.values():
        if f.lang != "verilog":
            continue
        for parent, child, inst in f.instances:
            children[parent][child] += 1
            inst_names[(parent, child)].append(inst)
    instantiated = {c for p in children for c in children[p] if p in defined}
    tops = sorted(m for m in defined if m not in instantiated and children.get(m))
    if not tops:
        tops = sorted(m for m in defined if m not in instantiated)[:3]
    if not tops:
        return None
    keep, frontier = [], list(tops)
    seen = set()
    while frontier and len(keep) < max_nodes:
        nxt = []
        for m in frontier:
            if m in seen or len(keep) >= max_nodes:
                continue
            seen.add(m)
            keep.append(m)
            nxt.extend(c for c, _ in children.get(m, Counter()).most_common())
        frontier = nxt
    kept = set(keep)
    used = set()
    ids = {m: make_id("m-" + m, used) for m in keep}
    dirs = {m: dirname(defined[m]) for m in keep if m in defined}
    groups, gid_of = [], {}
    distinct = sorted(set(dirs.values()))
    if len(distinct) >= 2:
        for dd in distinct:
            if sum(1 for v in dirs.values() if v == dd) >= 2:
                gid_of[dd] = make_id("g-" + (dd or "root"), used)
                groups.append({"id": gid_of[dd], "label": clip(dd or T["root"], 34), "icon": "📁", "color": "slate"})
    nodes, edges = [], []
    for m in keep:
        if m in defined:
            f = repo.files[defined[m]]
            hidden = sum(n for c, n in children.get(m, Counter()).items() if c not in kept)
            desc = f.doc if f.doc and len(f.modules) == 1 else defined[m]
            if hidden:
                desc += T["rtl_more"].format(n=hidden, module_w=w(T, "module", hidden))
            node = {"id": ids[m], "title": clip(m, 40), "desc": clip(desc, 160), "icon": "🔲",
                    "color": "blue" if m in tops else "teal"}
            ports = f.ports.get(m)
            if ports:
                node["ports"] = {k: [clip(p, 40) for p in v] for k, v in ports.items() if v}
            if m in tops:
                node["size"] = "lg"
            if dirs.get(m) in gid_of:
                node["group"] = gid_of[dirs[m]]
        else:
            node = {"id": ids[m], "title": clip(m, 40), "desc": T["rtl_ext_desc"], "icon": "📦",
                    "color": "slate", "size": "sm", "external": True}
        nodes.append(node)
    for parent in keep:
        for child, n in children.get(parent, Counter()).items():
            if child in kept:
                names = inst_names[(parent, child)]
                label = ", ".join(names) if len(names) <= 2 else f"×{len(names)}"
                edges.append({"from": ids[parent], "to": ids[child], "label": clip(label, 40)})
    steps = [{"node": ids[m], "text": T["step_rtl_top"].format(title=m, n=sum(children[m].values()), module_w=w(T, "module", sum(children[m].values())))}
             for m in tops[:2] if m in ids]
    return {
        "id": "rtl", "title": T["rtl"], "tag": T["rtl_tag"], "summary": T["rtl_summary"], "direction": "TB",
        "groups": groups, "nodes": nodes, "edges": edges, "steps": steps,
        "legend": {"colors": {"blue": "Top module" if lang == "en" else "Module đỉnh", "teal": ("Module " + T["in_repo"]) if lang == "vi" else "Module in the repo"}},
    }


# --------------------------------------------------------------------------- main

def git_commit(root):
    try:
        res = subprocess.run(["git", "-C", str(root), "rev-parse", "--short", "HEAD"], capture_output=True, text=True, timeout=10)
        return res.stdout.strip() if res.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def main():
    ap = argparse.ArgumentParser(description="Scan a repository and write a draft architecture-diagrams spec.")
    ap.add_argument("repo", help="repository or folder to scan")
    ap.add_argument("-o", "--output", help="spec path (default: <folder name>-architecture.json)")
    ap.add_argument("--lang", choices=("en", "vi"), default="en", help="language of generated text")
    ap.add_argument("--title", help="page title")
    ap.add_argument("--max-nodes", type=int, default=18, help="most cards in the overview (default 18)")
    ap.add_argument("--details", type=int, default=4, help="drill-down diagrams for the N largest folders (default 4)")
    ap.add_argument("--include-tests", action="store_true", help="also scan tests and testbenches")
    ap.add_argument("--all", action="store_true", help="also scan tests, docs, examples and demo folders")
    ap.add_argument("--exclude", action="append", default=[], help="glob of paths to skip (repeatable)")
    ap.add_argument("--facts", help="also write the raw findings (files, imports, units) as JSON")
    args = ap.parse_args()

    root = Path(args.repo).resolve()
    if not root.is_dir():
        print(f"ERROR: {root} is not a folder")
        return 2
    T = TEXT[args.lang]
    listed = list_repo(root)
    chosen = select_code(root, listed, args.include_tests or args.all, args.exclude, include_extra=args.all)
    if not chosen:
        print("No supported source files found (Python, JS/TS, Go, Java/Kotlin, C/C++, Verilog/SystemVerilog).")
        return 1
    files = []
    for rel, lang in chosen:
        f = FileInfo(rel, lang)
        text = read_text(root / rel)
        f.lines = text.count("\n") + (1 if text and not text.endswith("\n") else 0)
        PARSERS[lang](f, text)
        files.append(f)
    repo = Repo(root, listed, files)
    resolve_python(repo)
    resolve_js(repo)
    resolve_go(repo)
    resolve_java(repo)
    resolve_c(repo)
    defined = resolve_verilog(repo)

    by_label = Counter(EXT_LABEL[f.ext] for f in files)
    top_labels = [k for k, _ in by_label.most_common(3)]
    joiner = " và " if args.lang == "vi" else " and "
    langs = (", ".join(top_labels[:-1]) + joiner + top_labels[-1]) if len(top_labels) > 1 else top_labels[0]
    sha = git_commit(root)
    meta = {"name": root.name, "files": len(files), "langs": langs, "commit": T["commit"].format(sha=sha) if sha else ""}

    units = choose_units(sorted(repo.files), "", max(4, args.max_nodes))
    overview, stats = overview_diagram(repo, units, "", args.max_nodes, T, args.lang, meta)
    diagrams = [overview]
    big = sorted((u for u in units if stats["sizes"][u] >= 4), key=lambda u: -stats["sizes"][u])[: max(0, args.details)]
    for u in big:
        diagrams.append(detail_diagram(repo, u, stats, units, 16, T, args.lang))
    rtl = rtl_diagram(repo, defined, 28, T, args.lang) if defined else None
    if rtl:
        diagrams.append(rtl)
    seen_ids = set()
    for dgm in diagrams:
        dgm["id"] = make_id(dgm["id"], seen_ids)

    spec = {
        "title": args.title or T["title"].format(name=root.name),
        "subtitle": T["subtitle"],
        "lang": args.lang,
        "diagrams": diagrams,
    }
    errors, warnings = validate_spec(spec)
    out = Path(args.output) if args.output else Path.cwd() / f"{root.name}-architecture.json"
    out.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.facts:
        facts = {
            "root": str(root), "commit": sha,
            "files": [{"path": f.path, "lang": f.lang, "lines": f.lines, "doc": f.doc,
                       "imports": dict(f.deps), "external": dict(f.externals),
                       **({"modules": f.modules, "instances": [list(i) for i in f.instances], "ports": f.ports} if f.lang == "verilog" else {})}
                      for f in files],
            "units": [{"kind": u[0], "path": u[1], "small_folders": list(u[2]), "files": stats["sizes"][u]} for u in units],
            "unit_imports": [{"from": a[1] + ("/*" if a[0] == "files" else ""), "to": b[1] + ("/*" if b[0] == "files" else ""), "count": n}
                             for (a, b), n in stats["weights"].most_common()],
            "unresolved": [{"lang": k[0], "import": k[1], "count": n} for k, n in repo.unresolved.most_common(200)],
        }
        Path(args.facts).write_text(json.dumps(facts, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    internal = sum(sum(f.deps.values()) for f in files)
    externals = Counter()
    for f in files:
        externals.update(f.externals)
    print(f"Scanned {len(files)} files: " + ", ".join(f"{k} {v}" for k, v in by_label.most_common()) + ".")
    print(f"Resolved {internal} internal imports; {len(externals)} outside packages or modules"
          + (f" (top: {', '.join(k for k, _ in externals.most_common(5))})" if externals else "") + ".")
    if repo.unresolved:
        sample = ", ".join(k[1] for k, _ in repo.unresolved.most_common(5))
        print(f"Could not resolve {sum(repo.unresolved.values())} local imports (for example: {sample}).")
    print(f"Overview: {stats['units']} folders, {stats['edges']} connections, {stats['cycles']} circular dependenc{'y' if stats['cycles'] == 1 else 'ies'}.")
    for u in big:
        print(f"Drill-down: {u[1] or '.'}{'/*' if u[0] == 'files' else ''} ({stats['sizes'][u]} files).")
    if rtl:
        print(f"RTL hierarchy: {len(defined)} modules defined, {len(rtl['nodes'])} shown.")
    print(f"Wrote {out} with {len(diagrams)} diagram(s); validation: {len(errors)} error(s), {len(warnings)} warning(s).")
    for e in errors:
        print(f"ERROR: {e}")
    print("Next: rename cards, write descriptions and steps that answer the reader's question, then run build.py.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
