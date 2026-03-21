# Sports Tracker — Claude Code Guide

## Test commands

Run these before every commit. All must pass green.

```bash
# React web app
cd web && npm run typecheck && npm test

# Swift iOS/iPadOS
cd ios && swift test
```

**Current baseline (as of issue #11):** 89 web tests · 71 iOS tests

## Project layout

```
web/        React (Vite + TypeScript) — full-parity web app
ios/        Swift Package — iOS/iPadOS native app
supabase/   Migrations, config, edge functions
plans/      Implementation plan
```

Each domain module lives in its own subdirectory:
- `ios/Sources/SportsTracker/<Module>/` — `<Module>Service.swift`, `<Module>ViewModel.swift`, views
- `ios/Tests/SportsTrackerTests/<Module>/` — `Mock<Module>Service.swift`, `<Module>ViewModelTests.swift`
- `web/src/services/<module>Service.ts` — Supabase queries
- `web/src/pages/<module>/` — React page components
- `web/src/test/<module>.test.tsx` — Vitest + Testing Library tests

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
- **`@State` for owned ViewModels**: ViewModels used inside a view (not passed from a parent) must be declared `@State private var vm = MyViewModel()` — not created in the init parameter default, which causes recreation on every render
- **Pass all flags through NavigationLink destinations**: if a parent view has state like `isOrganizer`, explicitly pass it to child destination views — don't rely on defaults
- **gh issue list** default pagination is 30 — always pass `--limit 100` when fetching the full queue

## Web-specific conventions

- **Tournament service mock**: any test file that renders `LeagueDetailPage` must mock `tournamentService` and stub `getTournaments.mockResolvedValue([])` in `beforeEach` — otherwise the component hangs
- **TournamentDetailPage**: mocks `leagueService.getMembers` and `teamService.getTeams/createTeam` in its `beforeEach` — add these whenever expanding that test suite
- Use `getByRole('heading', { name: /…/i })` not `getByText` when matching section headings that also appear as body text

## DB / migrations

- New schema changes always go in a new file under `supabase/migrations/` with a timestamp prefix
- Never modify existing migration files — always add a new one
- `created_by` defaults are set via `DEFAULT auth.uid()` in the DB, not passed from the client
