-- Add captain designation to teams
ALTER TABLE public.teams ADD COLUMN captain_id uuid REFERENCES public.users(id);

-- Roster entries — one player per tournament constraint enforced here
CREATE TABLE public.roster_entries (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  tournament_id uuid        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id     uuid        NOT NULL REFERENCES public.users(id),
  joined_at     timestamptz NOT NULL DEFAULT now(),
  -- A player can only be on one team within a given tournament
  CONSTRAINT one_team_per_tournament UNIQUE (player_id, tournament_id)
);

ALTER TABLE public.roster_entries ENABLE ROW LEVEL SECURITY;

-- League members can see rosters in tournaments they belong to
CREATE POLICY "Roster visibility"
  ON public.roster_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      JOIN public.league_members lm ON lm.league_id = t.league_id
      WHERE t.id = roster_entries.tournament_id
        AND lm.user_id = auth.uid()
        AND (t.status = 'published' OR t.created_by = auth.uid())
    )
  );

-- Only league organizers can assign players to teams
CREATE POLICY "Organizers can assign players"
  ON public.roster_entries FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.tournaments t
      JOIN public.league_members lm ON lm.league_id = t.league_id
      WHERE t.id = roster_entries.tournament_id
        AND lm.user_id = auth.uid()
        AND lm.role = 'organizer'
    )
  );

-- Organizers can remove players from teams
CREATE POLICY "Organizers can remove players"
  ON public.roster_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      JOIN public.league_members lm ON lm.league_id = t.league_id
      WHERE t.id = roster_entries.tournament_id
        AND lm.user_id = auth.uid()
        AND lm.role = 'organizer'
    )
  );
