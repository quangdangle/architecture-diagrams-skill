#!/usr/bin/env python3
"""Screenshot a built diagram page with a headless Chromium-based browser.

Use it to look at your own output before handing it over. It needs Chrome,
Chromium, Edge or Brave installed; set CHROME_PATH to pick a specific binary.

Usage:
    python3 render_png.py diagram.html [-o out.png] [--diagram ID]
                          [--theme light|dark] [--width 1440] [--height auto] [--scale 1]

Without -o the file is named after the page, the tab and the theme, for example
diagram.png, diagram-errors.png or diagram-errors-dark.png, so several checks
never overwrite each other.

Exit code: 0 = screenshot written, 1 = the browser failed,
2 = no supported browser found (skip the visual check). Python 3.8+.
"""

import argparse
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path
from urllib.parse import urlencode

APP_PATHS = (
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
)
COMMANDS = (
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
    "microsoft-edge", "microsoft-edge-stable", "msedge", "chrome", "brave-browser",
)


def find_browser():
    env = os.environ.get("CHROME_PATH")
    if env and Path(env).exists():
        return env
    for path in APP_PATHS:
        if Path(path).exists():
            return path
    for name in COMMANDS:
        found = shutil.which(name)
        if found:
            return found
    return None


def stop(proc):
    """Headless Chrome often keeps running after it has finished, so end its whole process group."""
    if proc.poll() is not None:
        return
    try:
        if os.name == "posix":
            os.killpg(proc.pid, signal.SIGTERM)
        else:
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(proc.pid)], capture_output=True)
        proc.wait(timeout=5)
    except Exception:
        try:
            if os.name == "posix":
                os.killpg(proc.pid, signal.SIGKILL)
            else:
                proc.kill()
        except Exception:
            pass


def run_browser(browser, profile, width, height, scale, url, out=None, timeout=90, budget=4000):
    """Return the page DOM (when out is None) or write a screenshot to out."""
    cmd = [
        browser, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
        "--no-default-browser-check", "--disable-extensions", "--disable-background-networking",
        "--disable-component-update", "--disable-sync", "--no-pings", "--password-store=basic",
        "--use-mock-keychain", f"--user-data-dir={profile}", f"--window-size={width},{height}",
        f"--force-device-scale-factor={scale}", f"--virtual-time-budget={budget}",
        "--dump-dom" if out is None else f"--screenshot={out}", url,
    ]
    kwargs = {"stdout": subprocess.PIPE if out is None else subprocess.DEVNULL, "stderr": subprocess.DEVNULL}
    if os.name == "posix":
        kwargs["start_new_session"] = True
    else:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    proc = subprocess.Popen(cmd, **kwargs)
    deadline = time.time() + timeout
    chunks = []
    try:
        if out is None:
            reader = threading.Thread(target=lambda: chunks.extend(iter(proc.stdout.readline, b"")), daemon=True)
            reader.start()
            while time.time() < deadline:
                if b"</html>" in b"".join(chunks) or proc.poll() is not None:
                    break
                time.sleep(0.2)
        else:
            last, stable = -1, 0
            while time.time() < deadline:
                size = out.stat().st_size if out.exists() else -1
                stable = stable + 1 if size > 0 and size == last else 0
                last = size
                if stable >= 3 or (proc.poll() is not None and size > 0):
                    break
                time.sleep(0.25)
    finally:
        stop(proc)
        # the pipe is closed here, once the reader thread has seen its end, so nothing is left open
        if out is None:
            reader.join(timeout=2)
            proc.stdout.close()
    return b"".join(chunks).decode("utf-8", "replace")


def main():
    ap = argparse.ArgumentParser(description="Screenshot a built diagram page.")
    ap.add_argument("html", help="built diagram page")
    ap.add_argument("-o", "--output", help="PNG path (default: next to the page)")
    ap.add_argument("--diagram", help="diagram id to show when the page has tabs")
    ap.add_argument("--theme", choices=("light", "dark"), default="light", help="theme to capture (default light)")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--height", default="auto", help="pixels, or auto to fit the page (max 6000)")
    ap.add_argument("--scale", type=float, default=1.0, help="device pixel ratio, 2 for sharp images")
    args = ap.parse_args()

    page = Path(args.html).resolve()
    if not page.exists():
        print(f"ERROR: {page} not found")
        return 1
    browser = find_browser()
    if not browser:
        print("No Chrome, Chromium, Edge or Brave found; skip the visual check (or set CHROME_PATH).")
        return 2

    query = {"shot": "1", "theme": args.theme}
    url = page.as_uri() + "?" + urlencode(query) + (f"#{args.diagram}" if args.diagram else "")
    suffix = (f"-{args.diagram}" if args.diagram else "") + ("-dark" if args.theme == "dark" else "")
    out = Path(args.output) if args.output else page.with_name(page.stem + suffix + ".png")
    if not out.is_absolute():
        out = Path.cwd() / out

    if out.exists():
        out.unlink()
    height = 1100
    with tempfile.TemporaryDirectory() as profile:
        if args.height == "auto":
            dom = run_browser(browser, profile, args.width, 1000, 1, url)
            match = re.search(r'data-shot-height="(\d+)"', dom)
            if match:
                height = min(max(int(match.group(1)) + 8, 400), 6000)
        else:
            height = int(args.height)
    with tempfile.TemporaryDirectory() as profile:
        run_browser(browser, profile, args.width, height, args.scale, url, out=out)

    if not out.exists() or out.stat().st_size == 0:
        print("ERROR: the browser did not write a screenshot.")
        return 1
    print(f"Wrote {out} ({args.width}x{height}, {args.theme} theme, scale {args.scale}) using {Path(browser).name}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
