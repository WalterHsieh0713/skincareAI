"""Generate a scannable QR code image from an Expo dev server's `exp://` URL.

Metro's own ASCII QR code only renders when attached to an interactive
terminal (TTY) -- a server launched non-interactively (e.g. by an agent, or
with output piped to a log file) prints the plain log lines but no QR at
all. Worse, in tunnel mode the `exp://` URL itself is *only* ever drawn as
part of that same interactive UI -- it never appears in the log text at all
(confirmed: `.expo/dev-server.log` shows "Tunnel connected."/"Tunnel ready."
but no URL). So this doesn't scrape the log; instead it reads the tunnel
host directly from ngrok's own local admin API (which Expo's tunnel mode
runs on `localhost:4040`), then renders that as a PNG.
"""

import re
import subprocess
import sys
import time
import urllib.request
import json
from pathlib import Path

DEFAULT_OUT = Path(".expo/expo-go-qr.png")
NGROK_API = "http://localhost:4040/api/tunnels"
LOG_URL_PATTERN = re.compile(r"exp://\S+")


def ensure_qrcode_installed():
    try:
        import qrcode  # noqa: F401
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "qrcode"], check=True)


def find_tunnel_url(timeout: int = 180) -> str:
    """Poll ngrok's local admin API until the tunnel is up, then build the
    exp:// URL from its public host (https variant preferred)."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(NGROK_API, timeout=5) as resp:
                data = json.load(resp)
            tunnels = data.get("tunnels", [])
            https = next((t for t in tunnels if t.get("proto") == "https"), None)
            chosen = https or (tunnels[0] if tunnels else None)
            if chosen:
                host = chosen["public_url"].split("://", 1)[1]
                return f"exp://{host}"
        except (urllib.error.URLError, ConnectionError, OSError):
            pass
        time.sleep(2)
    raise TimeoutError(
        f"No tunnel found at {NGROK_API} after {timeout}s -- is the dev server "
        "running with --tunnel? Check .expo/dev-server.log."
    )


def find_url_in_log(log_path: Path, timeout: int = 180) -> str:
    """Fallback for LAN (non-tunnel) mode, where Metro does log the exp:// URL."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if log_path.exists():
            match = LOG_URL_PATTERN.search(log_path.read_text(errors="ignore"))
            if match:
                return match.group(0)
        time.sleep(2)
    raise TimeoutError(f"No exp:// URL found in {log_path} after {timeout}s")


def generate_qr(url: str, out_path: Path = DEFAULT_OUT) -> Path:
    ensure_qrcode_installed()
    import qrcode

    out_path.parent.mkdir(parents=True, exist_ok=True)
    qrcode.make(url).save(out_path)
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: generate_qr.py <exp-url> [out_path]")
        print("       generate_qr.py --tunnel [out_path]           (reads ngrok's local API)")
        print("       generate_qr.py --from-log <log_path> [out_path]  (LAN mode only)")
        sys.exit(1)

    if sys.argv[1] == "--tunnel":
        found_url = find_tunnel_url()
        output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT
    elif sys.argv[1] == "--from-log":
        found_url = find_url_in_log(Path(sys.argv[2]))
        output_path = Path(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_OUT
    else:
        found_url = sys.argv[1]
        output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT

    saved_path = generate_qr(found_url, output_path)
    print(f"URL: {found_url}")
    print(f"QR code saved to {saved_path}")
