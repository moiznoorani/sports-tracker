-- Fix: infinite recursion in league_members RLS policy.
-- The original policy queried league_members to check membership, which triggered
-- its own RLS evaluation — causing infinite recursion.
-- Replace with a direct auth.uid() = user_id check (no self-join needed).

drop policy if exists "League members can view membership" on public.league_members;

create policy "Members can view their own membership row"
  on public.league_members for select
  using (auth.uid() = user_id);
