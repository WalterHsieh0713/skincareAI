"""Start the Expo dev server for web on a specified port."""

import os
import subprocess
import sys

DEFAULT_PORT = 8081

def start_dev_server(port: int = DEFAULT_PORT):
    """Launch `npx expo start --web` on the given port."""
    cmd = ["npx", "expo", "start", "--web", "--port", str(port)]
    print(f"Starting Expo dev server on port {port}...")
    try:
        # On Windows, npx is a .cmd shim that CreateProcess can't launch
        # directly without going through the shell.
        subprocess.run(cmd, check=True, shell=(os.name == "nt"))
    except subprocess.CalledProcessError as e:
        print(f"Expo dev server exited with code {e.returncode}")
        sys.exit(e.returncode)
    except KeyboardInterrupt:
        print("\nDev server stopped.")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    start_dev_server(port)
