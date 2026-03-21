CREATE TABLE public.teams (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  created_by    uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_team_name_per_tournament UNIQUE (tournament_id, name)
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- League members can see teams in published tournaments they belong to.
-- Tournament creator can always see their teams (draft or published).
CREATE POLICY "Team visibility"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      JOIN public.league_members lm ON lm.league_id = t.league_id
      WHERE t.id = teams.tournament_id
        AND lm.user_id = auth.uid()
        AND (t.status = 'published' OR t.created_by = auth.uid())
    )
  );

-- Only league organizers can create teams, and only in published tournaments.
CREATE POLICY "Organizers can create teams in published tournaments"
  ON public.teams FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.tournaments t
      JOIN public.league_members lm ON lm.league_id = t.league_id
      WHERE t.id = teams.tournament_id
        AND lm.user_id = auth.uid()
        AND lm.role = 'organizer'
        AND t.status = 'published'
    )
  );

-- Only the creator can update or delete a team.
CREATE POLICY "Creator can update team"
  ON public.teams FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Creator can delete team"
  ON public.teams FOR DELETE
  USING (created_by = auth.uid());
