-- 1. Update leagues SELECT policy to allow any authenticated user to read public leagues.
--    Previously only creators and existing members could read league rows.
DROP POLICY IF EXISTS "League members can view their League" ON public.leagues;

CREATE POLICY "League members can view their League"
  ON public.leagues FOR SELECT
  USING (
    visibility = 'public'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_id = leagues.id AND user_id = auth.uid()
    )
  );

-- 2. View that enriches public league rows with a member_count.
--    Used by the browse query so the app doesn't need a separate RPC.
CREATE OR REPLACE VIEW public.public_leagues AS
  SELECT
    l.id,
    l.name,
    l.sport,
    l.visibility,
    l.lat,
    l.lng,
    COUNT(lm.user_id)::int AS member_count
  FROM public.leagues l
  LEFT JOIN public.league_members lm ON lm.league_id = l.id
  WHERE l.visibility = 'public'
  GROUP BY l.id;

GRANT SELECT ON public.public_leagues TO authenticated;

-- 3. RPC: join a public league directly (no token required).
--    SECURITY DEFINER so non-members can INSERT into league_members.
CREATE OR REPLACE FUNCTION public.join_league(p_league_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Must be public
  IF NOT EXISTS (
    SELECT 1 FROM public.leagues
    WHERE id = p_league_id AND visibility = 'public'
  ) THEN
    RAISE EXCEPTION 'League is not public or does not exist';
  END IF;

  -- Already a member?
  IF EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = p_league_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this league';
  END IF;

  INSERT INTO public.league_members (league_id, user_id, role)
  VALUES (p_league_id, auth.uid(), 'member');
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_league(uuid) TO authenticated;
