# Launch Dev Server

## Objective
Start the Dewpoint Expo dev server for web on port 8081, ensuring no conflicting process is already using the port.

## Required Inputs
- **Port** (optional, default `8081`)

## Steps

1. **Check if port is in use**
   - Run `tools/find_process_on_port.py <port>`
   - If no process found → skip to step 3

2. **Free the port**
   - Run `tools/free_port.py <port>` (finds and kills the blocking process)
   - Confirm port is now free by re-running `tools/find_process_on_port.py <port>`

3. **Start the dev server**
   - Run `tools/start_dev_server.py <port>`
   - Server launches at `http://localhost:<port>`

## Expected Output
- Expo dev server running on the specified port
- App accessible in browser at `http://localhost:<port>`

## Edge Cases
- **Port still occupied after kill**: Another process may have grabbed it. Re-run step 2 or try a different port.
- **Expo crashes on start**: Check terminal output for missing dependencies or config errors. Run `npx expo install` if needed.
- **Multiple old processes**: `free_port.py` handles killing all PIDs on the port, not just the first.
