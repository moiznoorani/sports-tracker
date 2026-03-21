CREATE TABLE public.tournaments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id   uuid        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  format      text        NOT NULL CHECK (format IN ('round_robin', 'single_elimination')),
  sport       text        NOT NULL CHECK (sport IN ('ultimate_frisbee', 'basketball')),
  start_date  date        NOT NULL,
  end_date    date        NOT NULL,
  status      text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by  uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT end_after_start CHECK (end_date >= start_date)
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Draft visible to creator only; published visible to all league members.
CREATE POLICY "Tournament visibility"
  ON public.tournaments FOR SELECT
  USING (
    created_by = auth.uid()
    OR (
      status = 'published'
      AND EXISTS (
        SELECT 1 FROM public.league_members
        WHERE league_id = tournaments.league_id AND user_id = auth.uid()
      )
    )
  );

-- Only league organizers can create tournaments.
CREATE POLICY "League organizers can create tournaments"
  ON public.tournaments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_id = tournaments.league_id
        AND user_id = auth.uid()
        AND role = 'organizer'
    )
  );

-- Only the creator can update.
CREATE POLICY "Creator can update tournament"
  ON public.tournaments FOR UPDATE
  USING (created_by = auth.uid());

-- Only the creator can delete.
CREATE POLICY "Creator can delete tournament"
  ON public.tournaments FOR DELETE
  USING (created_by = auth.uid());
