-- Fix: "new row violates row-level security policy for table leagues"
--
-- Root cause: PostgREST applies the SELECT policy to rows returned by
-- INSERT ... RETURNING. The SELECT policy required a league_members row
-- to exist, but that row is created by an AFTER INSERT trigger — which
-- may not be visible when PostgREST evaluates the RETURNING clause.
--
-- Fix: allow the creator to see their own league directly (created_by = auth.uid())
-- so the read-back after INSERT always succeeds, independent of trigger timing.

DROP POLICY IF EXISTS "League members can view their League" ON public.leagues;

CREATE POLICY "League members can view their League"
  ON public.leagues FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_id = leagues.id AND user_id = auth.uid()
    )
  );
