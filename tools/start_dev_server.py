"""Start the Dewpoint Expo dev server in the background, optionally tunneled."""

import os
import subprocess
import sys
from pathlib import Path

DEFAULT_PORT = 8081
LOG_PATH = Path(".expo/dev-server.log")


def start_dev_server(port: int = DEFAULT_PORT, tunnel: bool = False) -> subprocess.Popen:
    """Launch `npx expo start` detached, logging to `.expo/dev-server.log`.

    Tunnel mode routes the connection through Expo's cloud relay instead of
    direct Wi-Fi. Needed on networks with client/AP isolation (common on
    apartment/building-wide Wi-Fi) -- a phone on such a network can join Wi-Fi
    but can never open a direct connection to this computer, so the default
    LAN mode fails with "Something went wrong" in Expo Go even though nothing
    is misconfigured. See `tools/generate_qr.py` to turn the resulting
    `exp://` URL into something scannable -- Metro's own QR code only renders
    in an interactive terminal, not in a backgrounded/logged process like this.
    """
    cmd = ["npx", "expo", "start", "--port", str(port)]
    if tunnel:
        cmd.append("--tunnel")

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    log_file = open(LOG_PATH, "w")
    print(f"Starting Expo dev server on port {port}{' (tunnel)' if tunnel else ''}...")
    # Detached background process; on Windows npx is a .cmd shim that
    # CreateProcess can't launch directly without going through the shell.
    proc = subprocess.Popen(
        cmd, stdout=log_file, stderr=subprocess.STDOUT, shell=(os.name == "nt")
    )
    print(f"Server starting in background (pid {proc.pid}). Logs: {LOG_PATH}")
    return proc


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else DEFAULT_PORT
    tunnel = "--tunnel" in sys.argv
    start_dev_server(port, tunnel)
