"""Free a port by finding and killing whatever is listening on it (Windows)."""

import sys
from find_process_on_port import find_process_on_port
from kill_process import kill_process

def free_port(port: int):
    """Kill all processes listening on the given port."""
    pids = find_process_on_port(port)
    if not pids:
        print(f"Port {port} is already free")
        return
    for pid in pids:
        kill_process(pid)
    print(f"Port {port} freed")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python free_port.py <port>")
        sys.exit(1)
    free_port(int(sys.argv[1]))
