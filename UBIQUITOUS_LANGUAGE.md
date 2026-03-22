# Ubiquitous Language

## People & Roles

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **User** | An authenticated identity in the system; every person has exactly one account | Account, login |
| **Member** | *(new)* A User who belongs to a League; has role `member` (Player-eligible) or `organizer`; not every Member is a Player — that status is only acquired when assigned to a Team's Roster | Participant, league member |
| **Player** | A Member who has been assigned to a Team's Roster for a specific Tournament; the term only applies within the scope of that Tournament | Athlete, member, participant |
| **Organizer** | A User who creates and administers a League and its Tournaments; the only role that may create Teams and assign Players | Tournament admin, admin, manager (when referring to league-level role) |
| **Scorekeeper** | A User appointed by an Organizer to record Stats during a specific Game | Score tracker, stat tracker |
| **Captain** | *(updated)* A Player designated by an Organizer as the named leader of a Team; in V1 the Captain can view the Roster but does not control assignments — that remains the Organizer's role | Team manager, team captain, manager |
| **Viewer** | *(updated)* An anonymous or authenticated person who consumes public Tournament or Game data without participating — no account required | Fan, spectator (when used to mean anonymous observer) |
| **Spectator** | *(updated)* A logged-in User who views Game results and votes for Awards; distinct from an anonymous Viewer | Fan, viewer (when the person has an account) |

## Player Profile & Eligibility

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Date of Birth** | *(new)* The Player's birth date stored on their profile; the system derives current age from it for Eligibility Criteria checks | Age, birthday |
| **Gender** | *(new)* A Player's self-reported gender identity stored on their profile: Male, Female, or Prefer not to say; used for league Eligibility Criteria filtering | Sex |
| **Experience Level** | *(new)* A per-Sport self-reported skill level stored on a Player's profile (Beginner / Intermediate / Advanced / Elite); informational only — never used as a hard Eligibility Criterion | Skill level, rank |
| **Eligibility Criteria** | *(new)* Age range (min/max) and gender filter set by an Organizer on a League; automatically enforced on join — a Player who does not meet the criteria is denied entry | Join requirements, restrictions |

## League & Tournament Structure

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **League** | *(updated)* A named community that hosts one or more Tournaments; can be public (discoverable) or private (invite-only); may carry Eligibility Criteria that gate membership | Competition, organization |
| **Tournament** | A competition within a League with a defined Format, Schedule, set of Teams, and a Location | Event, season, cup |
| **Tournament Location** | *(new)* A plain-text address describing where a Tournament takes place; displayed on Public Pages and the Schedule; map integration is V2 | Venue, field, address |
| **Format** | The bracket/schedule structure of a Tournament: round robin or single elimination (V1) | Structure, type |
| **Schedule** | The auto-generated list of Games with assigned dates, times, and courts/fields within a Tournament | Calendar, fixture list |
| **Game** | A single match between two Teams within a Tournament | Match, bout, contest |
| **Bracket** | The visual elimination-round structure generated from a Tournament's Format | Draw, playoff tree |
| **Standings** | The ranked list of Teams in a round-robin phase based on wins/losses | Table, leaderboard (when referring to team rankings within a tournament) |

## Public Access

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Public Page** | *(new)* An anonymously accessible web page or iOS deep link showing Tournament or Game data — no login required | Public view, open page |
| **Shareable Link** | *(new)* A URL for a Tournament or Game that resolves to a Public Page and works without authentication; can be posted in a group chat or social media | Invite link (reserve that term for private league join tokens), share URL |

## Teams & Rosters

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Team** | A group of Players competing together in a Tournament, created by the Organizer | Squad, club, side |
| **Roster** | The full list of Players assigned to a Team for a specific Tournament | Lineup, squad list |
| **Roster Entry** | *(new)* A single record that places exactly one Player on exactly one Team within one Tournament; the DB constraint `one_team_per_tournament` is enforced at this level | Roster record, assignment record |
| **Player Assignment** | *(new)* The Organizer action of adding a Member to a Team's Roster, creating a Roster Entry; only Organizers may perform this action in V1 | Assign player, add to team, roster player |

## Draft

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Draft** | The live, real-time process by which Captains select Players to form their Roster before a Tournament | Player selection, pick session |
| **Draft Format** | The style of Draft: Snake Draft or Open Auction (V1) | Draft type, draft mode |
| **Snake Draft** | A Draft where Captains pick in a fixed order that reverses each round | Serpentine draft |
| **Open Auction** | A Draft where one Player is nominated at a time and Captains bid in fixed order; highest bid wins | Live auction, open bid |
| **Blind Auction** | A Draft where all Captains submit sealed bids simultaneously; highest bid when the timer ends wins | Sealed bid, silent auction |
| **Draft Budget** | The amount of fake currency allocated to each Team by the Organizer for use in Auction Drafts | Salary cap, coins, credits |
| **Pick Timer** | The countdown within which a Captain must act during a Draft; defaults to 60 seconds, configurable by Organizer | Clock, countdown |
| **Auto-pick** | Automatic assignment of the highest-ranked available Player to a Team when the Pick Timer expires | Default pick |
| **Player Rankings** | An Organizer-defined ordered list of available Players used as the basis for Auto-pick | Priority list |

## Stat Tracking

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Stat** | A single recorded event attributed to a Player during a Game (e.g. a goal, a block) | Point, event, action |
| **Stat Category** | A named type of Stat belonging to a Sport (e.g. Goal, Assist, Block, Foul) | Stat type, metric |
| **Stat Template** | The hardcoded set of Stat Categories available for a Sport, which the Organizer can toggle on/off or extend with Custom Stats | Default stats, sport stats |
| **Custom Stat** | An Organizer-defined Stat Category added on top of a Sport's Stat Template | Custom field, extra stat |
| **Stat Assignment** | The pre-game configuration that maps specific Stat Categories to specific Scorekeepers, preventing duplicate tracking | Scorekeeper assignment |
| **Score** | The Game-level count of points (goals) used to determine the winner; distinct from player-level Stats | Result (when referring to the final game outcome only) |
| **Career Stats** | A Player's aggregated Stat totals across all Games, Tournaments, and Leagues they have participated in | All-time stats, historical stats |

## Awards & Voting

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Award** | A recognition given to a Player at the end of a Tournament, determined by User votes | Trophy, honor |
| **Award Category** | A named award Users vote within (e.g. MVP, Rising Star); created by Organizer or selected from defaults | Award type |
| **Vote** | A User's single selection within one Award Category; one vote per User per Award Category | Ballot |

## Sports

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Sport** | A type of athletic competition with its own Stat Template (e.g. Ultimate Frisbee, Basketball) | Game type, discipline |

---

## Relationships

- A **League** contains one or more **Tournaments**
- A **League** may carry **Eligibility Criteria**; a **Player** who does not meet them is automatically denied membership
- A **Player's** profile stores **Date of Birth**, **Gender**, and per-Sport **Experience Level**; **Date of Birth** and **Gender** are evaluated against **Eligibility Criteria** on League join
- A **Tournament** has one **Tournament Location** (text address, V1) and belongs to one **League**
- A **Tournament** has a **Shareable Link** that opens its **Public Page** without authentication
- A **Game** has a **Shareable Link** that opens its **Public Page** — a live scoreboard accessible to any **Viewer**
- A **Tournament** contains one or more **Games** and one or more **Teams**
- A **Team** has one **Roster** per **Tournament**; a **Member** may be a **Player** on at most one **Team** per **Tournament** (enforced by the `one_team_per_tournament` DB constraint on **Roster Entry**)
- A **Roster** is the aggregate view of all **Roster Entries** for a **Team**; a **Player Assignment** creates a **Roster Entry**
- A **Team** has at most one **Captain**; the **Captain** is designated by an **Organizer** and is always a **Player** on that Team's **Roster**
- A **Game** has exactly one **Score** (win/loss outcome) and many **Stats** attributed to **Players**
- A **Scorekeeper** is assigned specific **Stat Categories** for a **Game** via **Stat Assignment**
- A **Draft** belongs to one **Tournament** and produces the **Roster** for each **Team**
- An **Award** belongs to one **Tournament**; **Users** cast one **Vote** per **Award Category**
- A **Player** has one **Career Stats** profile unified across all **Sports** and **Leagues**

---

## Example dialogue

> **Dev:** "Can a **Viewer** watch a live **Game** without creating an account?"
>
> **Domain expert:** "Yes. Any **Game** in a public **Tournament** has a **Shareable Link** that opens a **Public Page** — live **Score**, **Roster**, and **Stat** feed — no login required. If the **Tournament** is private, only **League** members can view it."
>
> **Dev:** "What stops a 14-year-old from joining an 18+ **League**?"
>
> **Domain expert:** "**Eligibility Criteria**. The **Organizer** sets a minimum age on the **League**. When the **Player** taps Join, the system computes their age from their **Date of Birth** and auto-denies if they don't qualify. No request reaches the **Organizer**."
>
> **Dev:** "Is **Experience Level** also checked?"
>
> **Domain expert:** "No — **Experience Level** is stored on the profile and visible to **Organizers**, but it's not a hard gate. It's too subjective. Only age and **Gender** are enforced automatically."
>
> **Dev:** "When a **Spectator** joins a **League**, can they immediately see all **Career Stats** for every **Player**?"
>
> **Domain expert:** "No — a **Player's** profile is private by default. It only becomes visible once the **Player** joins a **League** or explicitly makes it public. A **Spectator** browsing a public **League** can see **Players** on a **Team's** **Roster**, but not their full **Career Stats** unless the **Player** has opted in."
>
> **Dev:** "And for **Stat Tracking** — can two **Scorekeepers** both record **Goals** in the same **Game**?"
>
> **Domain expert:** "No. **Stat Assignment** ensures each **Stat Category** belongs to exactly one **Scorekeeper** per **Game**. That's how we avoid duplicate **Stats** without needing conflict resolution."

---

## Flagged ambiguities

- **"Viewer" vs "Spectator"** — previously used interchangeably. Now distinct: a **Viewer** is anonymous (no account); a **Spectator** is a logged-in User who watches and votes. Code and UI must not conflate them — anonymous read paths use **Viewer**, authenticated passive users are **Spectators**.
- **"Organizer" vs "Tournament Admin"** — used interchangeably in early discussion. Canonical term is **Organizer**. Avoid "tournament admin" in code and UI copy.
- **"Captain" vs "Manager" vs "Team Captain"** — all refer to the same role. Canonical term is **Captain**. Avoid "manager" except when describing what they do (manage a team).
- **"Score" vs "Stat"** — "score" was sometimes used loosely to mean any tracked number. **Score** is strictly the Game outcome (who won). **Stat** is a Player-level recorded event. These must not be conflated in the data model.
- **"League" vs "Tournament"** — early in the conversation these were used interchangeably. They are distinct: a **League** is the persistent community/organization; a **Tournament** is a time-bound competition within it. A League with one Tournament is still a League containing a Tournament, not just a Tournament.
- **"Shareable Link" vs "Invite Link"** — an **Invite Link** is a private token for joining a private **League** (requires authentication). A **Shareable Link** opens a public **Public Page** with no auth required. Never use these terms interchangeably.
- **"Member" vs "Player"** — *(new)* used interchangeably in early Phase 3b discussion and in the `league_members` table name vs `RosterPlayer` type. A **Member** has a League-scoped role; a **Player** is a Member who has been assigned to a Team's Roster in a specific Tournament. Every Player is a Member; not every Member is a Player. In code: `league_members` rows are Members; `roster_entries` rows make them Players.
- **"Creator" vs "Organizer"** — *(new)* the `teams` table has a `created_by` column (the Creator) and the RLS UPDATE policy was initially written as `created_by = auth.uid()`, restricting updates to the Team's Creator. The correct intent is any league **Organizer** may update any Team in their league — Creator and Organizer are not the same thing. "Creator" is an implementation detail of the row; "Organizer" is the domain role with authority. Use **Organizer** in domain conversations and documentation; use `created_by` only when discussing the DB schema.
