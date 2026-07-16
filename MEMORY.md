# Memory Index

Project memory for **Dewpoint** (skincare coaching app). Loaded at the start of every session via `CLAUDE.md`.

## Linked notes
- [Dewpoint launch (local)](dewpoint-launch-local.md) — run `npx expo start --web` in the Dewpoint dir, open localhost:8081
- [Dewpoint progress log](dewpoint-progress-log.md) — running log of dev sessions and what got done

## Project location
- App root: `C:\Users\user\dev\skincareAI` (moved 2026-07-15 out of OneDrive — the old `OneDrive\桌面\...` path caused `node_modules` sync-conflict corruption; keep this repo outside any OneDrive-synced folder)
- Stack: Expo SDK 54 (downgraded from 56) + Expo Router (file-based routing), React Native, React 19. Read the versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing code.

## Where the app code lives (the whole `src/` folder)
- **Entry point**: `package.json` → `"main": "expo-router/entry"` → loads the `src/app/` folder.
- **Root wrapper**: `src/app/_layout.tsx` — a root **Stack**: hosts the `(tabs)` group (chromeless) plus the `settings/*` pages (native header). Themes via `useResolvedColorScheme`.
- **Tab screens** live in `src/app/(tabs)/` (the `(tabs)` group is URL-transparent, so routes stay `/`, `/scan`, etc.). `(tabs)/_layout.tsx` renders `<AppTabs/>`.
  - `index.tsx` — home (route `/`)
  - `scan.tsx` — skin scan (Features 1 & 2); gated by `lib/scan-calibration` (CV validate+calibrate)
  - `routine.tsx` — routine builder + adherence (Feature 3); AM/PM uses device tz via `lib/time`
  - `ingredients.tsx` — ingredient audit + conflict checker (Feature 4)
  - `progress.tsx` — progress / time-lapse (Feature 5)
- **Settings** in `src/app/settings/`: `index` (hub) + `account`, `subscription`, `preferences` (light/dark), `language`, `privacy` (username/password), `terms`. Opened via the **Settings** button in the `Screen` top-row toolbar (`components/ui/screen.tsx`). Persisted via `lib/settings-store` + `hooks/use-settings`. T&C source: `src/constants/legal.ts` (also exported as `legal/terms-and-conditions.md`).
- **`src/components/`** — reusable UI (button, card, camera-capture, skin-score, app-tabs, settings-row, text-field).
- **i18n** in `src/i18n/`: `catalogs/*` (en is the source of truth + es, fr, de, pt-BR, it, ja, ko, zh-Hans; ~50 other picker languages fall back to English). `index.ts` = registry + `translate(tag, key, params)`; `hooks/use-translation.ts` exposes `t`/`tn` bound to `settings.language`, so changing language in Settings → Language re-renders the whole app. ALL user-facing strings live in catalogs — never hardcode UI text in screens; add a key + translations. The T&C legal body stays English by design.
- **`src/lib/`** — core logic: `ocr.ts` (read ingredient text), `scan-image.ts` (analyze selfie), `match-ingredients.ts` (conflict checker), `scan-store.ts` / `routine-store.ts` (persistence), `timelapse.ts`.
- **`src/hooks/`** — shared state (`use-scans`, `use-routine`, theme).
- **`src/constants/`** — `ingredients.ts` (INCI data), `theme.ts` (colors).
- **Platform variants**: `*.web.tsx` / `*.web.ts` run in the browser; plain `*.tsx` run on phones. Expo auto-picks.
- **Not app code**: `MEMORY.md`, `CLAUDE.md`, `AGENTS.md`, `Sean.md`, `package.json`, `app.json`, `eas.json` are instructions/config.
