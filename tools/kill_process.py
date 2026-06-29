"""Kill a process by PID (Windows)."""

import subprocess
import sys

def kill_process(pid: int):
    """Forcefully terminate a process by PID using taskkill."""
    try:
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/F"],
            check=True, capture_output=True, text=True
        )
        print(f"Killed PID {pid}")
    except subprocess.CalledProcessError:
        try:
            subprocess.run(
                ["powershell", "-Command", f"Stop-Process -Id {pid} -Force"],
                check=True, capture_output=True, text=True
            )
            print(f"Killed PID {pid} (via PowerShell)")
        except subprocess.CalledProcessError as e:
            print(f"Failed to kill PID {pid}: {e}")
            sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python kill_process.py <pid>")
        sys.exit(1)
    kill_process(int(sys.argv[1]))
