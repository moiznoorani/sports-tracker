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

## iOS-specific conventions

- **UUID casing**: `session.user.id.uuidString` returns uppercase; Supabase returns lowercase UUIDs. Always call `.lowercased()` when comparing user IDs from Supabase (e.g. `session.user.id.uuidString.lowercased()`)
- **Every new service method** added to a `*ServiceProtocol` must also be added to the corresponding `Mock*Service` in `ios/Tests/`
- **`@Observable` ViewModels** use `@Bindable` at call sites — never `@ObservedObject`
- **gh issue list** default pagination is 30 — always pass `--limit 100` when fetching the full queue

## Web-specific conventions

- **Tournament service mock**: any test file that renders `LeagueDetailPage` must mock `tournamentService` and stub `getTournaments.mockResolvedValue([])` in `beforeEach` — otherwise the component hangs
- Use `getByRole('heading', { name: /…/i })` not `getByText` when matching section headings that also appear as body text

## DB / migrations

- New schema changes always go in a new file under `supabase/migrations/` with a timestamp prefix
- Never modify existing migration files — always add a new one
- `created_by` defaults are set via `DEFAULT auth.uid()` in the DB, not passed from the client
