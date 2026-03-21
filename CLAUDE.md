# Sports Tracker — Claude Code Guide

## Test commands

Run these before every commit. All must pass green.

```bash
# React web app
cd web && npm run typecheck && npm test

# Swift iOS/iPadOS
cd ios && swift test
```

## Project layout

```
web/        React (Vite + TypeScript) — full-parity web app
ios/        Swift Package — iOS/iPadOS native app
supabase/   Migrations, config, edge functions
plans/      Implementation plan
```

## Key conventions

- Every issue must be implemented on **both** React (web) and Swift (ios)
- All schema names, API routes, and UI copy follow `UBIQUITOUS_LANGUAGE.md`
- RLS policies are load-bearing — define and test at DB layer, not application layer
- Tests verify external behavior through public interfaces only — never implementation details
- SwiftUI views are iPad-first, adapted down to iPhone
