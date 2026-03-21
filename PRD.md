# PRD: Sports Tracker — V1

## Implementation Progress

| Issue | Title | Status |
|-------|-------|--------|
| #3 | Phase 1 [Auth]: Email/password sign up, sign in, sign out, password reset | Closed ✅ |
| #4 | Phase 1 [Auth]: Apple + Google OAuth | Closed ✅ |
| #5 | Phase 1 [Auth]: Player profile — display name, avatar upload, privacy toggle | Closed ✅ |
| #6 | Phase 2 [Leagues]: League creation — name, sport, visibility, location schema | Closed ✅ |
| #7 | Phase 2 [Leagues]: Invite link generation + join via token | Closed ✅ |
| #58 | Phase 2 [Leagues]: Public league discovery — browse and one-click join | Closed ✅ |
| #8 | Phase 2 [Leagues]: Membership management — view members, remove member | Closed ✅ |
| #9 | Phase 3a [Tournament]: Tournament CRUD — format, sport, date range | Closed ✅ |
| #10 | Phase 3a [Tournament]: Tournament publishing + League member visibility | Closed ✅ |
| #11 | Phase 3b [Teams]: Team creation within a Tournament | Closed ✅ |

**Test suite as of #11:** 89 web tests (Vitest + Testing Library) · 71 iOS tests (Swift Testing)

### Phase 1 Deploy — Verified 2026-03-19
- iPadOS (Xcode 26.4, iPad Pro 13" M5 sim): **BUILD SUCCEEDED**, app runs
- Web typecheck + 26 tests: **all pass**
- Swift 27 tests: **all pass**
- Supabase migrations applied: `users` table, `career_stats` table, `avatars` storage bucket, all RLS policies live
- DB trigger verified: sign-up auto-creates `users` + `career_stats` rows, `privacy_setting` defaults to `private`

### Bugs fixed during deploy verification
- `ios/Package.swift`: bumped minimum platform from `.iOS(.v17)` → `.iOS(.v18)` (required by `Tab` API used in `MainTabView`)
- `SportsTrackerApp/`: added Xcode project with correct `SportsTracker` package product dependency wired to app target
- `SportsTrackerApp/Info.plist`: created standalone plist with `SUPABASE_URL`/`SUPABASE_ANON_KEY` build-setting refs; switched to `GENERATE_INFOPLIST_FILE = NO`
- `web/.env`: corrected malformed anon key (trailing garbage text removed)

## Problem Statement

Recreational and competitive sports leagues — particularly Ultimate Frisbee and Basketball — lack a single, cohesive tool that handles the full lifecycle of running a league: organizing tournaments, forming teams through a live draft, tracking player stats in real time during games, and giving players a persistent career profile they can carry across leagues. Organizers currently stitch together spreadsheets, group chats, and generic bracket tools. Players have no way to track their history. Viewers — parents, friends, fans — have no way to follow along without being present. This app solves all three problems in one place, optimized for iPadOS on the sideline and fully accessible via web for users without an iPad.

---

## Solution

A cross-platform sports management and stat-tracking app with:
- **iPadOS + iOS native app** (SwiftUI) as the primary live-tracking experience
- **React web app** as full-parity alternative and the data sync backend (powered by Supabase)
- League and tournament management for Organizers, including eligibility criteria (age, gender) to gate membership
- A live real-time Draft system (snake and auction styles) for Captains
- Real-time stat tracking during Games by appointed Scorekeepers
- Persistent Player profiles with unified Career Stats across all Sports and Leagues
- Spectator engagement via Award voting at end of Tournament
- **Anonymous Viewer access** — public Tournament and Game pages with live scores, rosters, schedule, bracket, and stats; no login required; shareable links work on web and iOS

---

## User Stories

### Authentication & Accounts
1. As a User, I want to sign up with email and password, so that I can create an account without needing a social login.
2. As a User, I want to sign in with Apple, so that I can authenticate quickly and privately on my iOS device.
3. As a User, I want to sign in with Google, so that I can use my existing Google account on web.
4. As a User, I want to reset my password via email, so that I can recover my account if I forget it.
5. As a User, I want to set my display name and upload a profile photo, so that other Users can identify me.
6. As a User, I want to control whether my Career Stats are public or private, so that I decide who can see my history.
7. As a User, I want my Career Stats to become visible to League members automatically when I join a League, so that teammates and opponents can see my history without me needing to manually make it public.

### League Management
8. As an Organizer, I want to create a League with a name and sport, so that I can group my Tournaments under one community.
9. As an Organizer, I want to set my League as private (invite-only) or public (discoverable to all authenticated users), so that I control who can find and join it.
10. As an Organizer, I want to generate an invite link for my private League, so that I can share it directly with Players.
11. As a User, I want to browse all public Leagues and join one with a single tap, so that I can find and join a community to play in. _(Geo-based filtering is deferred to V2.)_
12. As a User, I want to join a League via an invite link, so that I can participate in private Leagues I've been invited to.
13. As an Organizer, I want to view all Players who have joined my League, so that I can assign them to Teams.
14. As an Organizer, I want to remove a Player from my League, so that I can manage membership.

### Tournament Management
15. As an Organizer, I want to create a Tournament within my League and select its Format (round robin or single elimination for V1), so that I can run a structured competition.
16. As an Organizer, I want to set the Tournament's Sport (Ultimate Frisbee or Basketball), so that the correct Stat Template is applied.
17. As an Organizer, I want to auto-generate a Schedule for my Tournament, so that I don't have to manually create every Game.
18. As an Organizer, I want to swap Game time slots on the Schedule after it is generated, so that I can accommodate venue or availability constraints.
19. As an Organizer, I want to set Tournament dates spanning multiple days, so that larger competitions can be hosted over a weekend or season.
20. As an Organizer, I want to create Teams within a Tournament and assign Players from the League roster to them, so that Teams exist before the Draft begins.
21. As an Organizer, I want to assign a Captain to each Team, so that someone can manage the Team and participate in the Draft.
22. As an Organizer, I want to publish the Tournament so Players and Spectators can view the Schedule and Standings, so that the competition is visible to the community.

### Team & Roster Management
23. As an Organizer, I want to create Teams within a Tournament by picking Players who have joined the League, so that every Team has real Player accounts.
24. As a Captain, I want to view my Team's Roster, so that I know which Players are on my Team.
25. As a Player, I want to view the Team I have been assigned to within a Tournament, so that I know which Team I am on.
26. As a Player, I want to be on multiple Teams across different Tournaments or Leagues simultaneously, so that my participation is not restricted to one competition at a time.

### Draft System
27. As an Organizer, I want to configure the Draft Format (Snake Draft, Open Auction, or Blind Auction) before the Draft begins, so that the correct rules are applied.
28. As an Organizer, I want to set the Draft Budget per Team for Auction Drafts, so that each Team has equal spending power.
29. As an Organizer, I want to set the Pick Timer duration (default 60 seconds), so that the Draft pace matches my league's preferences.
30. As an Organizer, I want to rank available Players to define an Auto-pick priority list, so that if a Captain's timer expires the best available Player is selected automatically.
31. As an Organizer, I want to start the Draft when all Captains are ready, so that no Team is disadvantaged by a late start.
32. As a Captain, I want to see the live Draft board showing all available Players and remaining budgets, so that I can make informed picks.
33. As a Captain in a Snake Draft, I want to pick a Player when it is my turn, so that I can build my Roster in draft order.
34. As a Captain in an Open Auction, I want to nominate a Player for bidding and then bid in fixed rotation against other Captains, so that the highest bidder wins the Player.
35. As a Captain in a Blind Auction, I want to submit a sealed bid on a nominated Player before the timer ends, so that the highest hidden bid wins without knowing competitors' amounts.
36. As a Captain, I want to see my remaining Draft Budget at all times during an Auction Draft, so that I don't overspend.
37. As a Captain, I want to see my current Roster as it builds during the Draft, so that I know which positions I still need to fill.
38. As any User, I want to watch the Draft live in real time (read-only), so that Spectators and Players can follow along.
39. As a Captain, I want to be Auto-picked for if I miss my Pick Timer, so that the Draft continues without manual intervention.

### Stat Tracking
40. As an Organizer, I want to toggle individual Stat Categories on or off from the Sport's Stat Template for my Tournament, so that I only track what matters to my league.
41. As an Organizer, I want to add Custom Stats on top of the Stat Template, so that I can capture league-specific metrics.
42. As an Organizer, I want to appoint a Scorekeeper for a specific Game, so that a trusted User is responsible for entering Stats.
43. As an Organizer, I want to assign specific Stat Categories to each Scorekeeper for a Game via Stat Assignment, so that no two Scorekeepers ever track the same Stat and duplicates cannot occur.
44. As a Scorekeeper, I want to open the live stat-tracking view for my assigned Game on my iPad, so that I can record Stats in real time from the sideline.
45. As a Scorekeeper, I want to tap a Player's name and then tap a Stat Category to record a Stat, so that entry is fast and requires minimal interaction during play.
46. As a Scorekeeper, I want to undo the last Stat entry, so that I can correct a mis-tap without disrupting the Game flow.
47. As a Scorekeeper, I want to see only the Stat Categories I have been assigned, so that I am not distracted by Stats that another Scorekeeper is tracking.
48. As a Scorekeeper, I want Stats I record to sync to the server in real time, so that the live Game view reflects current data for all viewers.
49. As a Scorekeeper tracking Ultimate Frisbee offense, I want to record which Player scored and which Player assisted on each point, so that both are credited correctly.
50. As a Scorekeeper tracking Ultimate Frisbee defense, I want to increment individual counts for Fouls, Blocks, and Steals per Player in real time, so that defensive contributions are captured during play.
51. As a Scorekeeper tracking Basketball, I want to record Points, Rebounds, Assists, Turnovers, Steals, and Blocks per Player, so that standard basketball box-score stats are captured.
52. As any User, I want to see the live Score (Game outcome) update in real time while a Game is in progress, so that I can follow without being present.

### Standings & Bracket
53. As any User, I want to view the Standings for a round-robin Tournament, so that I can see how Teams rank.
54. As any User, I want to view the Bracket for a single-elimination Tournament, so that I can see which Teams advance.
55. As any User, I want to see completed Game results within the Bracket or Standings, so that I can review outcomes after Games finish.

### Player Profiles & Career Stats
56. As a Player, I want a unified profile that shows my Stats across all Leagues and Sports I have participated in, so that my full history is in one place.
57. As a Player, I want to see my per-Tournament stat breakdowns, so that I can compare my performance across different competitions.
58. As a Player, I want to see my per-Sport career aggregates, so that I understand my performance in each discipline separately.
59. As any User with access, I want to view another Player's profile and Career Stats, so that I can scout opponents or track teammates' progress.

### Awards & Voting
60. As an Organizer, I want to create Award Categories for a Tournament (e.g. MVP, Rising Star), so that the community can recognize standout Players.
61. As an Organizer, I want to select from default Award Category templates (MVP, Defensive Player, Rising Star, etc.), so that I don't have to create common awards from scratch.
62. As a User, I want to cast one vote per Award Category at the end of a Tournament, so that I can recognize a standout Player.
63. As any User, I want to see the Award winners once voting closes, so that the results are visible to the whole community.

### Notifications
64. As a User, I want to receive a push notification when a Draft I am participating in is about to start, so that I don't miss it.
65. As a Captain, I want to receive a push notification when it is my turn to pick in a Draft, so that I don't miss my window.
66. As a Player, I want to receive a push notification when a Game I am scheduled to play is about to begin, so that I am ready on time.
67. As a User, I want to receive a push notification when Award voting opens for a Tournament I participated in, so that I remember to vote.
68. As a User, I want to be able to manage my notification preferences, so that I only receive the alerts I care about.

### Player Profile — Eligibility Fields
69. As a Player, I want to set my date of birth on my profile, so that Leagues can verify I meet their age requirements.
70. As a Player, I want to set my gender on my profile (Male / Female / Prefer not to say), so that gender-restricted Leagues can evaluate my eligibility.
71. As a Player, I want to record my experience level per Sport on my profile (Beginner / Intermediate / Advanced / Elite), so that Organizers can understand my background — even though this is not used as a hard eligibility gate.

### League Eligibility
72. As an Organizer, I want to set a minimum and/or maximum age on my League, so that only Players in the right age range can join.
73. As an Organizer, I want to set a gender filter on my League (Any / Male / Female), so that gender-specific leagues are restricted appropriately.
74. As a Player, I want to be automatically denied when I try to join a League whose Eligibility Criteria I do not meet, so that I receive immediate feedback instead of a pending request.

### Viewer & Public Pages
75. As a Viewer, I want to open a public Tournament page without logging in, so that I can see the Schedule, Teams, Standings or Bracket, and Tournament Location.
76. As a Viewer, I want to open a public Game page without logging in and see the live Score, Rosters, and Stat feed updating in real time, so that I can follow a Game remotely.
77. As an Organizer or Player, I want to share a Shareable Link to a Tournament or Game that anyone can open without an account, so that friends and family can follow along.
78. As a Viewer on iOS, I want Shareable Links to open the native app (if installed) via a deep link, so that the experience is native rather than web-only.

---

## Implementation Decisions

### Architecture Overview
- **iOS/iPadOS app:** SwiftUI, targeting iPadOS as primary form factor with iPhone support
- **Web app:** React (full parity — not view-only), deployed to a custom domain
- **Backend:** Supabase — provides PostgreSQL database, REST + realtime API, auth, file storage, and edge functions
- **Real-time:** Supabase Realtime (WebSocket-based) for live Draft state, live Score updates, and live Stat sync
- **Push notifications:** Apple Push Notification service (APNs) for iOS; Web Push API for browser

### Core Modules

**Auth Module**
- Handles sign-up, sign-in, password reset, and OAuth (Apple, Google)
- Issues and validates JWTs via Supabase Auth
- Interface: `signUp`, `signIn`, `signInWithApple`, `signInWithGoogle`, `signOut`, `resetPassword`

**League Module**
- CRUD for Leagues, membership management, invite link generation and validation
- Eligibility Criteria (min_age, max_age, gender_filter) set by Organizer; auto-enforced on join via DB function
- Public League discovery by geographic proximity (lat/lng stored per League; geo-browse is V2)
- Interface: `createLeague`, `joinLeague(inviteToken)`, `joinPublicLeague`, `getLeaguesByLocation`, `addMember`, `removeMember`

**Tournament Module**
- CRUD for Tournaments within a League
- Format configuration (round robin, single elimination)
- Auto-schedule generation algorithm; slot-swap operation
- Interface: `createTournament`, `generateSchedule`, `swapGameSlots`, `publishTournament`

**Team & Roster Module**
- Team creation within a Tournament, Player assignment, Captain designation
- Enforces one-Team-per-Player-per-Tournament constraint
- Interface: `createTeam`, `assignPlayer`, `assignCaptain`, `getRoster`

**Draft Module**
- Manages Draft lifecycle: configuration → open → in-progress → complete
- Handles Snake Draft turn order and Blind/Open Auction bid logic
- Real-time state broadcast via Supabase Realtime channel per Draft
- Pick Timer with server-side enforcement and Auto-pick fallback
- Interface: `configureDraft`, `startDraft`, `makePick`, `placeBid`, `submitBlindBid`, `autoPick`

**Stat Template Module**
- Stores hardcoded Stat Category definitions per Sport
- Manages per-Tournament Stat Template customization (toggle, add Custom Stats)
- Interface: `getTemplate(sport)`, `toggleStatCategory`, `addCustomStat`, `getTournamentTemplate`

**Stat Tracking Module**
- Records individual Stat events attributed to a Player in a Game
- Enforces Stat Assignment (Scorekeeper can only write their assigned categories)
- Provides undo for last entry
- Broadcasts Stat events via Supabase Realtime
- Interface: `recordStat`, `undoLastStat`, `getGameStats`, `assignScorekeeper`

**Score Module**
- Derives and stores the running Score for a Game from Stat events (goal counts)
- Updates Standings and Bracket on Game completion
- Interface: `getLiveScore`, `finalizeGame`, `getStandings`, `getBracket`

**Player Profile Module**
- Aggregates Career Stats per Player across all Games, Tournaments, and Sports
- Stores eligibility fields: date_of_birth, gender, sport_experience (per-sport, informational only)
- Enforces privacy rules (private by default; auto-visible on League join or explicit opt-in)
- Interface: `getProfile(userId)`, `getCareerStats(userId, sport?)`, `setPrivacy`, `updateEligibilityFields`

**Public Page Module**
- Serves anonymously accessible Tournament and Game pages — no auth required
- Tournament Public Page: location, schedule, teams/rosters, standings/bracket
- Game Public Page: live score (Realtime), rosters, stat feed
- Shareable Links resolve to Public Pages on web; iOS Universal Links open native app if installed
- RLS: public tournaments and their games/stats are readable by `anon` role
- Interface: `getPublicTournament(id)`, `getPublicGame(id)`, `getLiveScore(gameId)`

**Award Module**
- Organizer creates Award Categories; Users cast Votes (one per category per User)
- Voting opens at Tournament end; results published after voting closes
- Interface: `createAwardCategory`, `castVote`, `getResults`

**Notification Module**
- Handles APNs token registration (iOS) and Web Push subscription (browser)
- Sends notifications for Draft start/turn, Game start, voting open
- Interface: `registerDevice`, `sendNotification(userId, event)`, `updatePreferences`

### Data Schema (key entities)
- `users` — id, display_name, avatar_url, privacy_setting, date_of_birth, gender, sport_experience (jsonb: `{sport: level}`)
- `leagues` — id, name, sport, visibility, location (lat/lng), organizer_id, invite_token, min_age, max_age, gender_filter
- `league_members` — league_id, user_id, joined_at
- `tournaments` — id, league_id, sport, format, status, start_date, end_date, location (text)
- `teams` — id, tournament_id, name, created_by, created_at _(captain_id added in roster phase)_
- `roster_entries` — team_id, player_id (unique constraint: player_id + tournament_id)
- `games` — id, tournament_id, home_team_id, away_team_id, scheduled_at, status
- `drafts` — id, tournament_id, format, budget_per_team, pick_timer_seconds, status
- `draft_picks` — id, draft_id, team_id, player_id, pick_number, timestamp
- `draft_bids` — id, draft_id, team_id, player_id, amount, is_blind
- `stat_categories` — id, sport, name, is_default
- `tournament_stat_config` — tournament_id, stat_category_id, enabled
- `scorekeeper_assignments` — game_id, user_id, stat_category_ids[]
- `stat_events` — id, game_id, player_id, stat_category_id, recorded_by, timestamp
- `award_categories` — id, tournament_id, name
- `votes` — award_category_id, voter_id, nominated_player_id (unique: award_category_id + voter_id)

### API Contract Notes
- All real-time state (Draft board, live Score, live Stats) flows via Supabase Realtime channels, not polling
- REST endpoints handle all mutations (create, update, delete) and one-time fetches
- Server-side Pick Timer is enforced via a Supabase Edge Function that fires Auto-pick when the timer lapses — client timers are display-only
- Stat Assignment is enforced server-side: any Stat event write is rejected if the Scorekeeper is not assigned that Stat Category for that Game

---

## Testing Decisions

**What makes a good test:**
Test only external, observable behavior — what goes in and what comes out — never internal implementation details. A good test breaks when behavior changes, not when code is refactored.

**Modules to test:**

| Module | What to test |
|--------|-------------|
| **Draft Module** | Snake turn order correctness; auction bid resolution (open and blind); Auto-pick fires when timer elapses; budget enforcement rejects over-budget bids; duplicate pick prevention |
| **Stat Tracking Module** | Stat Assignment enforcement (rejects writes to unassigned categories); undo removes exactly the last event; Career Stat aggregation totals are correct after multiple events |
| **Score Module** | Score correctly derived from Stat events; Standings update correctly on Game finalization; Bracket advances correct Team on win |
| **Stat Template Module** | Toggle correctly enables/disables a Stat Category for a Tournament; Custom Stats appear in the Tournament template; hardcoded defaults are present per Sport |
| **League Module** | Invite token validates correctly; expired/invalid tokens are rejected; Player appears in roster after joining |
| **Tournament Module** | Auto-generated Schedule contains exactly N*(N-1)/2 Games for round robin with N Teams; slot swap updates exactly two Games and leaves others unchanged |
| **Auth Module** | Unauthenticated requests to protected routes are rejected; JWT expiry is handled correctly |
| **Player Profile Module** | Private profile is not returned to non-member requests; Career Stats aggregate correctly across multiple Tournaments |

**Testing approach:**
- Backend logic (Draft, Stat, Score): integration tests against a local Supabase instance (Docker) — test against real DB, not mocks
- SwiftUI: unit tests for view models / business logic; UI tests for critical flows (stat entry, draft pick)
- React: component tests with Testing Library; E2E tests with Playwright for Draft and Stat tracking flows

---

## Out of Scope (V2+)

- Game Clock & Period Management (Phase 5d): server-authoritative countdown clock per period, Scorekeeper pause/resume, stat locking at period end with 30-second grace window, per-stage OT configuration (allowed/duration/sudden death), Organizer PIN + live approval for post-period stat edits, Basketball quarter/halftime break timers, Ultimate Frisbee soft cap / hard cap logic with dynamic game total recalculation — see GitHub issue #50
- **Announcements**: Organizer broadcasts a message to all League members; visible as a pinned notice in the League and on the Public Page
- **Game-day attendance / RSVP**: Players confirm or decline attendance for a specific Game; substitute slot management
- **Geo-based League discovery**: browse public Leagues near the Player's location using lat/lng stored on Leagues and Player profiles
- Offline stat tracking with multi-device sync and Stat Assignment (deferred due to sync complexity)
- Additional sports: Flag Football, Cricket, Soccer, Tennis
- Double elimination and pool play + bracket Tournament Formats
- Custom Stat field definitions per Tournament
- Award voting and Award Categories
- Push notifications
- Blind Auction Draft format (Open Auction and Snake are V1; Blind Auction is V2)
- Player ranking / Auto-pick priority list UI (V1 uses random Auto-pick)
- Monetization / paid tier
- Public League discovery by location (V1 supports invite-only private Leagues and manually shared public Leagues; geo-browse is V2)
- Spectator fantasy draft (separate from team-building Draft)

---

## Further Notes

- The internal test league (~50 Players) should be used as the primary QA environment before any public release. Onboard this league early to validate the Draft flow and Stat tracking UX on real iPads.
- The SwiftUI app should be designed tablet-first (split-view, large tap targets for sideline use) and then adapted down to iPhone, not the reverse.
- The Supabase Row Level Security (RLS) policies are load-bearing for this app's privacy model — they must be defined and tested before any data is exposed via the API. Privacy defaults (profile hidden until League join) must be enforced at the database layer, not just the application layer.
- All references to domain concepts in code, API routes, database table names, and UI copy should use the terms defined in `UBIQUITOUS_LANGUAGE.md`.
