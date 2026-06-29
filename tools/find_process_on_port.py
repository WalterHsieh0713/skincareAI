"""Find the PID of any process listening on a given port (Windows)."""

import re
import subprocess
import sys

def find_process_on_port(port: int) -> list[int]:
    """Return a list of PIDs listening on the given port."""
    result = subprocess.run(
        ["netstat", "-ano"],
        capture_output=True, text=True
    )
    pids = set()
    for line in result.stdout.splitlines():
        if f":{port} " in line and "LISTENING" in line:
            parts = line.split()
            if parts:
                try:
                    pids.add(int(parts[-1]))
                except ValueError:
                    continue
    return sorted(pids)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python find_process_on_port.py <port>")
        sys.exit(1)
    port = int(sys.argv[1])
    pids = find_process_on_port(port)
    if pids:
        for pid in pids:
            print(f"Port {port} -> PID {pid}")
    else:
        print(f"No process listening on port {port}")
