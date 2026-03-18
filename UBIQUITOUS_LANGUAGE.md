# Ubiquitous Language

## People & Roles

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **User** | An authenticated identity in the system; every person has exactly one account | Account, login |
| **Player** | A User who participates in Games as a member of a Team | Athlete, member, participant |
| **Organizer** | A User who creates and administers a League and its Tournaments | Tournament admin, admin, manager (when referring to league-level role) |
| **Scorekeeper** | A User appointed by an Organizer to record Stats during a specific Game | Score tracker, stat tracker |
| **Captain** | A User who manages a Team and participates in the Draft on behalf of that Team | Team manager, team captain, manager |
| **Spectator** | A User who views Game results and votes for Awards but does not track Stats | Fan, viewer |

## League & Tournament Structure

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **League** | A named community that hosts one or more Tournaments; can be public (location-discoverable) or private (invite-only) | Competition, organization |
| **Tournament** | A competition within a League with a defined Format, Schedule, and set of Teams | Event, season, cup |
| **Format** | The bracket/schedule structure of a Tournament (round robin, single elimination, double elimination, or pool play + bracket) | Structure, type |
| **Schedule** | The auto-generated list of Games with assigned dates, times, and courts/fields within a Tournament | Calendar, fixture list |
| **Game** | A single match between two Teams within a Tournament | Match, bout, contest |
| **Bracket** | The visual elimination-round structure generated from a Tournament's Format | Draw, playoff tree |
| **Standings** | The ranked list of Teams in a round-robin phase based on wins/losses | Table, leaderboard (when referring to team rankings within a tournament) |

## Teams & Rosters

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Team** | A group of Players competing together in a Tournament, created by the Organizer | Squad, club, side |
| **Roster** | The list of Players assigned to a Team for a specific Tournament | Lineup, squad list |

## Draft

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Draft** | The live, real-time process by which Captains select Players to form their Roster before a Tournament | Player selection, pick session |
| **Draft Format** | The style of Draft: Snake Draft, Open Auction, or Blind Auction | Draft type, draft mode |
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
- A **Tournament** contains one or more **Games** and one or more **Teams**
- A **Team** has one **Roster** per **Tournament**; a **Player** may appear on multiple **Teams** across different **Tournaments** but only one **Team** per **Tournament**
- A **Game** has exactly one **Score** (win/loss outcome) and many **Stats** attributed to **Players**
- A **Scorekeeper** is assigned specific **Stat Categories** for a **Game** via **Stat Assignment**
- A **Draft** belongs to one **Tournament** and produces the **Roster** for each **Team**
- An **Award** belongs to one **Tournament**; **Users** cast one **Vote** per **Award Category**
- A **Player** has one **Career Stats** profile unified across all **Sports** and **Leagues**

---

## Example dialogue

> **Dev:** "When a **Spectator** joins a **League**, can they immediately see all **Career Stats** for every **Player**?"
>
> **Domain expert:** "No — a **Player's** profile is private by default. It only becomes visible once the **Player** joins a **League** or explicitly makes it public. A **Spectator** browsing a public **League** can see **Players** on a **Team's** **Roster**, but not their full **Career Stats** unless the **Player** has opted in."
>
> **Dev:** "Got it. And when the **Organizer** sets up a **Draft** — does the **Draft Format** apply to the whole **Tournament**, or can they switch mid-**Draft**?"
>
> **Domain expert:** "The **Draft Format** is set before the **Draft** begins and is locked in. The **Organizer** also sets the **Draft Budget** for **Auction** formats and the **Pick Timer**. Once the **Draft** starts, Captains bid or pick in sequence."
>
> **Dev:** "If a **Captain** doesn't act before the **Pick Timer** expires, what happens?"
>
> **Domain expert:** "The system **Auto-picks** from the **Player Rankings** if the **Organizer** has ranked available **Players**. If not, it picks randomly. The **Captain** can't override it after the fact."
>
> **Dev:** "And for **Stat Tracking** — can two **Scorekeepers** both record **Goals** in the same **Game**?"
>
> **Domain expert:** "No. **Stat Assignment** ensures each **Stat Category** belongs to exactly one **Scorekeeper** per **Game**. That's how we avoid duplicate **Stats** without needing conflict resolution."

---

## Flagged ambiguities

- **"Organizer" vs "Tournament Admin"** — used interchangeably in early discussion. Canonical term is **Organizer**. Avoid "tournament admin" in code and UI copy.
- **"Captain" vs "Manager" vs "Team Captain"** — all refer to the same role. Canonical term is **Captain**. Avoid "manager" except when describing what they do (manage a team).
- **"Score" vs "Stat"** — "score" was sometimes used loosely to mean any tracked number. **Score** is strictly the Game outcome (who won). **Stat** is a Player-level recorded event. These must not be conflated in the data model.
- **"League" vs "Tournament"** — early in the conversation these were used interchangeably. They are distinct: a **League** is the persistent community/organization; a **Tournament** is a time-bound competition within it. A League with one Tournament is still a League containing a Tournament, not just a Tournament.
