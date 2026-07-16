---
name: dewpoint-launch-local
description: How to run the Dewpoint app locally in a browser (Expo web dev server)
metadata: 
  node_type: memory
  type: project
  originSessionId: 1034e6d6-6a3c-4b3a-a9aa-592022f4d181
---

Dewpoint is an Expo app at `C:\Users\user\dev\skincareAI` (moved out of OneDrive on 2026-07-15 — see [[dewpoint-progress-log]]). To run it in a browser locally:
run `npx expo start --web` from that directory, then open `http://localhost:8081` in Chrome.

The web server listens on port **8081**. Dewpoint is NOT hosted at dewpoint.app — that was a wrong first guess; it is a local dev server only. See [[dewpoint-progress-log]].
