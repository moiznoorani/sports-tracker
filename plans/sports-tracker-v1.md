# Plan: Sports Tracker V1

> Source PRD: `PRD.md`

## Architectural Decisions

- **UI Design System:** All screens on both web and iOS/iPadOS use the Vector-style dark-glass design system — deep near-black backgrounds, purple accent (#7B3F85), warm cream text (#FFF1DE), liquid glass cards. Implemented in:
  - Web: CSS custom properties + Tailwind v4 components (`GlassCard`, `GlassInput`, `GlassSelect`, `Button`, `AppShell`) — see `web/src/components/`
  - iOS: `AppTheme` + `GlassComponents` in `ios/Sources/SportsTracker/Theme/` — tracked in issue #56
  - Every new screen must use these components; no raw `Form`, `List`, or unstyled HTML elements

Durable decisions that apply across all phases:

- **Backend:** Supabase — PostgreSQL database, Realtime (WebSockets), Auth, Storage, Edge Functions
- **iOS/iPadOS app:** SwiftUI, iPad-first layout adapted down to iPhone
- **Web app:** React, full parity with native app — not view-only
- **Real-time:** Supabase Realtime channels for live Draft board, live Score, and live Stat events
- **Auth:** Supabase Auth — email/password, Apple Sign-In, Google OAuth
- **Privacy enforcement:** Supabase Row Level Security (RLS) at DB layer — not enforced solely in application code
- **Pick Timer:** Server-side enforcement via Supabase Edge Function; client-side countdown is display-only
- **Stat conflict prevention:** Stat Assignment enforced at DB layer — Scorekeepers can only write Stat Categories assigned to them for a given Game
- **Domain language:** All schema names, API routes, and UI copy follow `UBIQUITOUS_LANGUAGE.md`

### Key models
`users`, `leagues`, `league_members`, `tournaments`, `teams`, `roster_entries`, `games`, `drafts`, `draft_picks`, `draft_bids`, `stat_categories`, `tournament_stat_config`, `scorekeeper_assignments`, `stat_events`, `award_categories`, `votes`

### Route structure
- Web: `/leagues`, `/leagues/:id`, `/leagues/:id/tournaments/:id`, `/leagues/:id/tournaments/:id/draft`, `/leagues/:id/tournaments/:id/games/:id`, `/profile/:userId`
- API (Supabase auto-REST + RPC for complex operations): `/rpc/generate_schedule`, `/rpc/auto_pick`, `/rpc/finalize_game`

---

## Phase 1: Auth & Identity

**User stories:** 1–7

### What to build

End-to-end authentication flow on both iPadOS and web. A User can create an account via email/password, Apple Sign-In, or Google OAuth, and is immediately given a Player profile. The profile includes display name, avatar upload (stored in Supabase Storage), and a privacy setting (private by default). The Career Stats profile record is created at sign-up as an empty shell — schema and RLS policies are in place so privacy rules are enforced from day one. A User can reset their password via email.

### Acceptance criteria

- [ ] User can sign up with email and password on both web and iPadOS
- [ ] User can sign in with Apple on iPadOS
- [ ] User can sign in with Google on web
- [ ] User can reset password via email link
- [ ] User can set display name and upload a profile photo
- [ ] Profile privacy defaults to private on account creation
- [ ] User can toggle privacy to public
- [ ] RLS policy: private profiles are not returned to unauthenticated or non-member requests
- [ ] Career Stats record is created for every new User (empty aggregates, correct schema)

### UI acceptance criteria
- All auth screens use full-screen dark gradient background with centered `LogoMark` + `GlassCard` form container
- Form fields use `GlassTextField` / `GlassInput` with labelled focus rings; errors shown in `ErrorBanner`
- Profile screen uses avatar card (accent gradient initials fallback) + glass form with `GlassSelect` for privacy toggle
- Primary actions use `PrimaryButtonStyle` (web: primary Button variant); secondary actions use `GlassButtonStyle`

---

## Phase 2: Leagues

**User stories:** 8–14

### What to build

An Organizer can create a League, choose private (invite-only) or public visibility, and receive a shareable invite link. Any User with the link can join the League. The Organizer can view all League members and remove a Player from the League. A User browsing the app can see the Leagues they belong to on their home screen. Public League records store location (lat/lng) for future geo-browse (Phase 2 lays the schema; browsing by location is V2).

### Acceptance criteria

- [ ] Organizer can create a League with name, sport, and visibility setting
- [ ] Private League generates a unique invite token
- [ ] User can join a League via invite link — invalid or reused tokens are rejected
- [ ] Organizer can view full League member list
- [ ] Organizer can remove a Player from the League
- [ ] Removed Player loses access to League content
- [ ] League list on home screen shows all Leagues the current User belongs to
- [ ] RLS policy: League content is only visible to members

### UI acceptance criteria
- League list uses glass card rows with sport + visibility `GlassTag` badges; empty state with icon + CTA button
- League detail shows header card with name, sport/visibility tags, and invite link in monospace glass container with copy button
- Create League and Join League use glass card forms; navigation uses back chevron link
- Member list (issue #8) uses glass card rows with avatar initials; remove action uses destructive button style

---

## Phase 3a: Tournament Creation

**User stories:** 15–16, 19, 22

### What to build

An Organizer can create a Tournament within a League by selecting a Format (round robin or single elimination), a Sport (Ultimate Frisbee or Basketball), and a date range (multi-day supported). The Tournament can be published, at which point it becomes visible to all League members. Unpublished Tournaments are only visible to the Organizer.

### Acceptance criteria

- [ ] Organizer can create a Tournament within a League
- [ ] Organizer can select Format: round robin or single elimination
- [ ] Organizer can select Sport: Ultimate Frisbee or Basketball
- [ ] Tournament supports a start date and end date (multi-day)
- [ ] Organizer can publish the Tournament
- [ ] Published Tournament is visible to all League members
- [ ] Unpublished Tournament is only visible to the Organizer
- [ ] League members can view Tournament details (format, sport, dates, status)

### UI acceptance criteria
- Tournament list within a League uses glass card rows with format, sport, and status `GlassTag`
- Tournament CRUD form uses `GlassCard` container with `GlassTextField` for name, `GlassSelect` for format/sport, date pickers styled to match glass aesthetic
- Published vs draft state shown with distinct tag colour (accent = published, subtle = draft)
- Tournament detail shows header card + tabbed sections (Schedule, Teams, Standings/Bracket)

---

## Phase 3b: Teams & Roster

**User stories:** 17, 20–21, 23–25

### What to build

Within a published Tournament, the Organizer can create Teams and assign Players from the League's member roster to each Team. The Organizer designates one Player per Team as Captain. A Player can only appear on one Team within a given Tournament (enforced at DB layer). Players can view which Team they have been assigned to. A Player may be on multiple Teams across different Tournaments.

### Acceptance criteria

- [ ] Organizer can create Teams within a Tournament
- [ ] Organizer can assign League members to Teams from the roster
- [ ] Organizer can designate exactly one Captain per Team
- [ ] DB constraint: a Player cannot be assigned to more than one Team in the same Tournament
- [ ] Player can view their assigned Team and Roster for each Tournament
- [ ] Captain can view their full Team Roster
- [ ] Same Player can appear on Teams in different Tournaments simultaneously

### UI acceptance criteria
- Team list within a Tournament uses glass card rows with team name and captain badge
- Roster assignment uses scrollable player grid/list with glass toggle rows; Captain designation uses accent highlight
- Player's "my team" view uses glass card with team name header and roster list
- One-player-per-tournament constraint violations surface as inline `ErrorBanner`

---

## Phase 3c: Schedule Generation

**User stories:** 17–18

### What to build

Once Teams are set, the Organizer triggers auto-schedule generation. For round robin, the system generates a complete round-robin fixture list (every Team plays every other Team once). For single elimination, it generates a first-round bracket with seeded slots. Games are assigned dates and times within the Tournament's date range. The Organizer can then swap two Games' time slots if needed; all other Games remain unchanged.

### Acceptance criteria

- [ ] Organizer can trigger Schedule generation once Teams are finalized
- [ ] Round-robin Schedule contains exactly N×(N−1)/2 Games for N Teams
- [ ] Single-elimination Schedule generates correct first-round matchups
- [ ] Games are distributed across the Tournament date range
- [ ] Organizer can swap exactly two Games' time slots; no other Games are affected
- [ ] All League members can view the published Schedule

### UI acceptance criteria
- Schedule view uses date-grouped glass card sections; each game row shows teams, time, and status tag
- Organizer swap flow uses selection highlight (accent outline) on picked game slots
- Generated schedule confirmation uses a glass card summary before committing

---

## Phase 4a: Draft Configuration

**User stories:** 27–31

### What to build

Before a Draft begins, the Organizer configures it: selects Draft Format (Snake Draft or Open Auction), sets the Draft Budget per Team (for Auction), sets the Pick Timer duration (default 60 seconds), and optionally ranks available Players to define Auto-pick priority order. The Organizer can open the Draft lobby, where Captains join and signal readiness. The Organizer starts the Draft when all Captains are ready.

### Acceptance criteria

- [ ] Organizer can configure Draft Format (Snake or Open Auction) before the Draft starts
- [ ] Organizer can set Draft Budget per Team for Open Auction format
- [ ] Organizer can set Pick Timer duration (default 60 seconds, configurable)
- [ ] Organizer can rank available Players to set Auto-pick priority order
- [ ] Draft lobby shows which Captains have joined and marked themselves ready
- [ ] Organizer can start the Draft; it cannot start without Organizer action
- [ ] All Users can view the Draft lobby in read-only mode

### UI acceptance criteria
- Draft configuration uses glass card form with segmented control for format selection
- Draft lobby shows connected Captains as glass card rows with a ready/waiting status badge
- Organizer start button is disabled until all Captains are ready; uses `PrimaryButtonStyle`
- Player ranking UI uses drag-reorder list with glass row handles

---

## Phase 4b: Snake Draft Session

**User stories:** 32–33, 37–39

### What to build

A live real-time Snake Draft session. All connected Users see the same Draft board via a Supabase Realtime channel. Captains pick in a fixed order that reverses each round. When it is a Captain's turn, the Pick Timer starts server-side. The Captain selects an available Player; the pick is recorded and the board updates for all viewers instantly. If the timer expires without a pick, the server Auto-picks the highest-ranked available Player (or a random Player if no ranking exists). Each Captain can see their growing Roster alongside the board. The Draft ends when all Roster slots are filled.

### Acceptance criteria

- [ ] Draft board is visible to all connected Users in real time
- [ ] Turn order follows snake pattern (reverses each round)
- [ ] Only the Captain whose turn it is can make a pick
- [ ] Pick Timer countdown is visible to all Users; expiry is enforced server-side
- [ ] Auto-pick fires on timer expiry using Player Rankings; falls back to random if unranked
- [ ] Picked Players are removed from the available pool immediately for all viewers
- [ ] Captain's current Roster is visible alongside the board during the Draft
- [ ] Draft concludes and Rosters are locked when all slots are filled

### UI acceptance criteria
- Draft board is iPad-primary split view: available players on left, team rosters on right
- Active-turn row highlighted with accent glow; other rows dimmed
- Pick timer uses `MetricRing`-style circular countdown in accent colour; turns red below 10s
- Player cards use glass rows with position/stats; tapping opens a glass detail sheet
- Real-time updates animate in with spring transition (no jarring reloads)

---

## Phase 4c: Open Auction Draft Session

**User stories:** 34, 36–39

### What to build

A live real-time Open Auction Draft session. Captains take turns nominating a Player for auction. Once nominated, all Captains bid in a fixed order; each Captain can raise the bid or pass. The Captain with the highest bid when the round resolves wins the Player and the amount is deducted from their Budget. Pick Timer applies per bid turn. Budget is displayed live for all Captains. Auto-pick applies when a nominating Captain's timer expires.

### Acceptance criteria

- [ ] Captains take turns nominating a Player in fixed order
- [ ] All Captains can bid on each nominated Player in fixed rotation
- [ ] Highest bid wins the Player; amount deducted from winning Captain's Budget
- [ ] A bid above a Captain's remaining Budget is rejected
- [ ] Remaining Budget for each Team is visible to all Users in real time
- [ ] Pick Timer applies per bid action; Auto-pick fires on expiry
- [ ] Captains who pass do not win the Player at a lower price
- [ ] Draft concludes and Rosters are locked when all slots are filled or Budgets are exhausted

### UI acceptance criteria
- Auction board shows current nomination card (glass, prominent) with bid history below
- Budget bar per team uses accent gradient fill; turns warning colour below 20% remaining
- Bid/pass action buttons use `PrimaryButtonStyle` / `GlassButtonStyle` respectively
- Timer ring identical to Phase 4b; auto-pick fires with a visible "Auto-pick" badge

---

## Phase 5a: Stat Configuration & Assignment

**User stories:** 40–43

### What to build

The Organizer configures the Stat Template for a Tournament by toggling Stat Categories from the Sport's hardcoded defaults on or off, and optionally adding Custom Stats. Before each Game, the Organizer appoints a Scorekeeper (a User from the League). The Organizer then performs Stat Assignment: mapping specific Stat Categories to that Scorekeeper. The DB layer enforces that a Scorekeeper can only write events for their assigned categories — any write outside assignment is rejected.

### Acceptance criteria

- [ ] Organizer can toggle individual Stat Categories on or off from the Sport's Stat Template
- [ ] Organizer can add Custom Stat Categories to a Tournament's template
- [ ] Organizer can appoint a Scorekeeper for a specific Game
- [ ] Organizer assigns Stat Categories to each Scorekeeper for a Game (Stat Assignment)
- [ ] DB constraint: a Stat event write is rejected if the Scorekeeper is not assigned that category for that Game
- [ ] Scorekeeper's tracking UI shows only their assigned Stat Categories

### UI acceptance criteria
- Stat template toggle list uses glass rows with on/off toggle; disabled defaults shown with dimmed style
- Custom stat creation uses inline glass text field row (no modal unless on compact width)
- Scorekeeper assignment uses glass card with picker for user + multi-select for stat categories
- Assignment summary shown as `GlassTag` chips on the game detail card

---

## Phase 5b: Ultimate Frisbee Live Tracking

**User stories:** 44–52 (Ultimate Frisbee)

### What to build

A live stat-tracking experience for Ultimate Frisbee, optimized for iPad. The Scorekeeper sees their assigned Players and Stat Categories. For offense: the Scorekeeper logs each scoring play by selecting the Player who scored and the Player who assisted — both are tallied against their profiles. For defense: the Scorekeeper taps a Player and increments individual counts for Fouls, Blocks, and Steals in real time. All Stat events are broadcast via Supabase Realtime, updating the live Score and stat totals for all viewers instantly. The Scorekeeper can undo the last entry.

### Acceptance criteria

- [ ] Scorekeeper can open live-tracking view for their assigned Game on iPad
- [ ] Offense flow: Scorekeeper selects scorer and assister for each point; both Players' tallies update
- [ ] Defense flow: Scorekeeper taps a Player and increments Fouls, Blocks, or Steals
- [ ] Undo removes exactly the last recorded Stat event
- [ ] All Stat events sync to Supabase in real time
- [ ] Live Score (point totals) updates for all viewers as points are recorded
- [ ] Non-Scorekeepers see the live Score and Stat totals in read-only mode
- [ ] Stat events are attributed to the correct Player in the DB

### UI acceptance criteria
- iPad layout: player grid fills most of screen; stat categories are column headers in glass style
- Tapping a player cell shows an action sheet (glass modal) to pick scorer/assister or increment defense stat
- Each point recorded shows a brief success animation (accent flash) before resetting
- Undo button is always visible; uses `GlassButtonStyle` with undo icon
- Live score banner is pinned at top in large accent typography; updates with spring animation

---

## Phase 5c: Basketball Live Tracking

**User stories:** 44–52 (Basketball)

### What to build

The same live stat-tracking experience extended to Basketball. The Basketball Stat Template includes: Points, Rebounds, Assists, Turnovers, Steals, and Blocks per Player. The Scorekeeper UI adapts to the basketball template — tap a Player, tap a Stat Category, and the count increments. All real-time broadcast and undo behavior is identical to Phase 5b. Score is derived from Points tallied.

### Acceptance criteria

- [ ] Basketball Stat Template contains: Points, Rebounds, Assists, Turnovers, Steals, Blocks
- [ ] Scorekeeper can record any basketball Stat Category for any Player on either Team
- [ ] Live Score updates from Points events in real time
- [ ] Undo, real-time sync, and read-only viewer behavior identical to Ultimate Frisbee tracking
- [ ] Stat Assignment enforcement applies to basketball categories identically

### UI acceptance criteria
- Same iPad grid layout as Phase 5b; columns match basketball stat template
- Tap-to-increment interaction: tap player → tap stat category → confirm (or one-tap if unambiguous)
- Score derived from Points events shown in same pinned banner as UF; same spring animation
- Identical undo, real-time sync, and read-only viewer styling

---

## Phase 6a: Standings

**User stories:** 53, 55

### What to build

For round-robin Tournaments, a Standings view ranks Teams by wins and losses. Standings update automatically when the Organizer finalizes a Game (marks it complete with a final Score). Completed Game results are visible within the Standings view. All League members can view Standings for any published Tournament.

### Acceptance criteria

- [ ] Standings view ranks all Teams by win/loss record for a round-robin Tournament
- [ ] Standings update immediately when a Game is finalized
- [ ] Completed Game results (score, winner) are visible in the Standings view
- [ ] Standings are read-only for all Users except the Organizer

### UI acceptance criteria
- Standings table uses alternating glass card rows; top team highlighted with accent left border
- W/L/D columns right-aligned in monospaced secondary text
- Finalize game action accessible via swipe or context button on game row; confirmation dialog uses glass card

---

## Phase 6b: Bracket

**User stories:** 54–55

### What to build

For single-elimination Tournaments, a Bracket view shows all matchups and advances the correct Team when a Game is finalized. Completed results are shown inline in the Bracket. The Bracket updates in real time as Games are finalized throughout the Tournament.

### Acceptance criteria

- [ ] Bracket renders the correct structure for the number of Teams
- [ ] Winning Team advances to the next round when a Game is finalized
- [ ] Completed Game results are shown within the Bracket
- [ ] Bracket is accessible to all League members in read-only mode
- [ ] Bracket updates without requiring a page/view reload

### UI acceptance criteria
- Bracket renders as a horizontal scroll view of glass matchup cards connected by lines
- Advancing team highlighted with accent colour; eliminated team shown with dimmed/strikethrough
- On iPad, full bracket visible without scroll where team count permits
- Real-time advancement animates the winning team card moving to the next round slot

---

## Phase 6c: Career Stats & Player Profiles

**User stories:** 56–59

### What to build

Player profiles aggregate Career Stats from all Stat events across every Game, Tournament, and League the Player has participated in. The profile view shows per-Tournament stat breakdowns and cross-sport career aggregates. Privacy rules (set in Phase 1) are enforced: private profiles are not returned to Users who are not League members or explicit opt-in viewers. Players can view their own full profile regardless of privacy setting.

### Acceptance criteria

- [ ] Player profile shows Career Stats aggregated across all Tournaments and Sports
- [ ] Profile shows per-Tournament breakdown (which Tournament, which Sport, which stats)
- [ ] Cross-sport aggregates are shown separately per Sport
- [ ] Private profile: not visible to Users who are not a member of a shared League
- [ ] Private profile: automatically becomes visible to League members when Player joins a League
- [ ] Player can always view their own full profile
- [ ] Any User with access can view another Player's profile and Career Stats

### UI acceptance criteria
- Player profile header uses same avatar card pattern as ProfileView (glass card, initials fallback)
- Career stat aggregates displayed as glass metric cards with large number + label
- Per-tournament breakdown uses collapsible glass card sections grouped by sport
- Private profile state shows a locked glass card with lock icon and explanation text

---

## Phase 7: Awards & Notifications

**User stories:** 60–68

### What to build

At the end of a Tournament, the Organizer creates Award Categories (selecting from defaults like MVP and Rising Star, or creating custom ones). Once the final Game is complete, voting opens. Each User casts one vote per Award Category. Voting closes at Organizer discretion; results are published and visible to all. Push notifications are delivered via APNs (iOS) and Web Push (browser) for: Draft starting, Captain's Draft turn, upcoming Game, and Award voting open. Users can manage their notification preferences.

### Acceptance criteria

- [ ] Organizer can create Award Categories from default templates (MVP, Rising Star, Defensive Player, etc.)
- [ ] Organizer can create fully custom Award Categories
- [ ] Voting opens after the final Game is completed (Organizer triggers)
- [ ] Each User can cast exactly one vote per Award Category
- [ ] Duplicate votes (same User, same category) are rejected at DB layer
- [ ] Award results are published and visible to all League members after voting closes
- [ ] iOS devices receive APNs push notification when a Draft they are in is starting
- [ ] Captains receive push notification when it is their Draft turn
- [ ] Players receive push notification when a Game they are scheduled for is about to begin
- [ ] Users receive push notification when Award voting opens for a Tournament they participated in
- [ ] Users can enable/disable individual notification types in their preferences

### UI acceptance criteria
- Award categories shown as glass card rows with icon; custom categories use accent `GlassTag`
- Voting screen shows nominee list with player avatar cards; selected nominee gets accent highlight ring
- Results view shows winner card (prominent) + runner-up list below in glass rows
- Notification preferences use glass toggle rows grouped by notification type
