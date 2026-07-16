# Launch Dev Server

## Objective
Start the Dewpoint Expo dev server on port 8081 (web, reachable at `localhost`)
and produce a scannable QR code so Sean can open the same session in Expo Go
on his phone — automatically, every session, with no manual steps on his end.

## Why tunnel mode, and why a generated QR (not Metro's own)
- This machine's Wi-Fi is an apartment/building-wide network with client/AP
  isolation: a phone can join the Wi-Fi but can never open a direct
  connection to this computer. The default LAN connection mode fails with
  "Something went wrong" in Expo Go even though nothing is misconfigured.
  `--tunnel` routes the connection through Expo's cloud relay instead of
  direct Wi-Fi, sidestepping AP isolation entirely. Always use tunnel mode
  here, not plain LAN mode — it's a standing environment constraint, not a
  one-off issue.
- Metro's ASCII QR code only renders when attached to an interactive
  terminal (TTY). A server launched non-interactively (which is how this
  workflow starts it — backgrounded, output redirected to a log file) prints
  the plain log lines but no QR at all. Worse, in tunnel mode the `exp://`
  URL itself is *only* ever drawn as part of that same interactive UI — it
  never appears in the log text (confirmed: `.expo/dev-server.log` shows
  "Tunnel connected."/"Tunnel ready." but no URL). So `tools/generate_qr.py`
  reads the tunnel host directly from ngrok's own local admin API
  (`localhost:4040/api/tunnels`, which Expo's tunnel mode runs automatically)
  instead of scraping the log, then renders it as a PNG.
- Tunnel mode still serves the web build at `http://localhost:<port>` at the
  same time — one server, one process, covers both localhost web and phone.

## Required Inputs
- **Port** (optional, default `8081`)

## Steps

1. **Check if port is in use**
   - Run `tools/find_process_on_port.py <port>`
   - If no process found → skip to step 3

2. **Free the port**
   - Run `tools/free_port.py <port>` (finds and kills the blocking process)
   - Confirm port is now free by re-running `tools/find_process_on_port.py <port>`

3. **Start the dev server (tunnel mode)**
   - Run `tools/start_dev_server.py <port> --tunnel`
   - This launches `npx expo start --tunnel` detached, logging to
     `.expo/dev-server.log`, and returns immediately (does not block).
   - The first run on a machine may prompt to install `@expo/ngrok` or sign
     in for a tunnel — if `.expo/dev-server.log` shows a prompt instead of
     progressing, surface it; it may need one-time interactive setup.

4. **Wait for the tunnel URL, then generate the QR code**
   - Run `tools/generate_qr.py --tunnel`
   - This polls ngrok's local admin API (up to 180s) for the tunnel's public
     host, builds the `exp://` URL from it, saves a QR code PNG to
     `.expo/expo-go-qr.png`, and prints the URL.

5. **Show the result**
   - Read `.expo/expo-go-qr.png` directly (it's an image) so it renders in
     the conversation — don't just report the file path.
   - Tell Sean: open `http://localhost:<port>` in a browser for web, or scan
     the QR code with Expo Go for the phone.

## Expected Output
- Expo dev server running in tunnel mode on the specified port, backgrounded
- App accessible in browser at `http://localhost:<port>`
- A QR code image shown in-conversation, scannable from Expo Go

## Edge Cases
- **Port still occupied after kill**: Another process may have grabbed it. Re-run step 2 or try a different port.
- **Expo crashes on start**: Check `.expo/dev-server.log` for missing dependencies or config errors. Run `npx expo install` if needed.
- **Multiple old processes**: `free_port.py` handles killing all PIDs on the port, not just the first.
- **No `exp://` URL after 180s**: tunnel setup may be stuck on a first-time ngrok prompt — check `.expo/dev-server.log` directly for what it's waiting on.
- **QR generation**: `tools/generate_qr.py` renders the PNG via `npx qrcode` (Node), not a Python package — pip on this machine's MSYS2 Python can't install `qrcode`/Pillow (PEP 668 externally-managed environment, no prebuilt wheel for its platform tag). `npx` fetches the npm package on first use.
- **Never run this repo from inside a OneDrive-synced folder** (e.g. `OneDrive\桌面\...`) — OneDrive's sync races `npm install` and corrupts `node_modules` with conflict-renamed files, which then look like unrelated crashes (e.g. Expo CLI errors). Repo now lives at `C:\Users\user\dev\skincareAI`.
