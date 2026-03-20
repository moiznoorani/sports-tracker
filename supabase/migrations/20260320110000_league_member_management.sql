-- Returns all members of a league with their profile info.
-- Checks that the caller is a member before returning data.
CREATE OR REPLACE FUNCTION public.get_league_members(p_league_id uuid)
RETURNS TABLE(
  user_id      uuid,
  role         text,
  display_name text,
  avatar_url   text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lm.user_id,
    lm.role,
    u.display_name,
    u.avatar_url
  FROM league_members lm
  LEFT JOIN users u ON u.id = lm.user_id
  WHERE lm.league_id = p_league_id
    AND EXISTS (
      SELECT 1 FROM league_members
      WHERE league_id = p_league_id AND user_id = auth.uid()
    )
  ORDER BY lm.role DESC, u.display_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_league_members(uuid) TO authenticated;
