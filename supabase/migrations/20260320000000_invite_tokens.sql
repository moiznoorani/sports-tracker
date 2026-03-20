-- Phase 2 [Leagues]: Invite link generation + join via token (issue #7)
--
-- 1. Add invite_token to leagues — generated once on creation, never changes.
-- 2. join_league_by_token RPC — SECURITY DEFINER so a non-member can call it
--    without needing SELECT access to the leagues table.

ALTER TABLE public.leagues
  ADD COLUMN invite_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;

-- RPC: authenticated user joins a league by presenting the invite token.
-- Returns the league_id so the client can navigate to it.
CREATE OR REPLACE FUNCTION public.join_league_by_token(p_token uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_league_id uuid;
BEGIN
  SELECT id INTO v_league_id
    FROM public.leagues
   WHERE invite_token = p_token;

  IF v_league_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite token';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.league_members
     WHERE league_id = v_league_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this league';
  END IF;

  INSERT INTO public.league_members (league_id, user_id, role)
  VALUES (v_league_id, auth.uid(), 'member');

  RETURN v_league_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_league_by_token(uuid) TO authenticated;
