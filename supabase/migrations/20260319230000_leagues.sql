-- Leagues table: a named community that hosts one or more Tournaments.
-- Visibility controls whether the League is private (invite-only) or public (discoverable).
-- lat/lng stored for V2 geo-browse; browsing by location is out of scope for Phase 2.

create table public.leagues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sport       text not null check (sport in ('ultimate_frisbee', 'basketball')),
  visibility  text not null default 'private' check (visibility in ('private', 'public')),
  lat         double precision,
  lng         double precision,
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger leagues_updated_at
  before update on public.leagues
  for each row execute procedure public.set_updated_at();

-- League membership: one row per (league, user) pair.
-- role: 'organizer' (created the league) or 'member' (joined via invite).

create table public.league_members (
  league_id  uuid not null references public.leagues (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'member' check (role in ('organizer', 'member')),
  joined_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

-- Auto-insert the creator as organizer when a League is created.
create or replace function public.handle_new_league()
returns trigger language plpgsql security definer as $$
begin
  insert into public.league_members (league_id, user_id, role)
  values (new.id, new.created_by, 'organizer');
  return new;
end;
$$;

create trigger on_league_created
  after insert on public.leagues
  for each row execute procedure public.handle_new_league();

-- RLS: League content is only visible to members.
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;

-- Authenticated users can create leagues (they become organizer via trigger).
create policy "Authenticated users can create a League"
  on public.leagues for insert
  with check (auth.uid() = created_by);

-- League is visible only to its members.
create policy "League members can view their League"
  on public.leagues for select
  using (
    exists (
      select 1 from public.league_members
      where league_id = id and user_id = auth.uid()
    )
  );

-- Only the creator (organizer) can update the League.
create policy "Organizer can update their League"
  on public.leagues for update
  using (created_by = auth.uid());

-- Members can view their own membership rows and co-member rows in shared leagues.
create policy "League members can view membership"
  on public.league_members for select
  using (
    exists (
      select 1 from public.league_members lm
      where lm.league_id = league_id and lm.user_id = auth.uid()
    )
  );

-- Organizer can remove members (Phase 2 [Leagues]: Membership management — issue #8).
create policy "Organizer can delete league membership"
  on public.league_members for delete
  using (
    exists (
      select 1 from public.leagues
      where id = league_id and created_by = auth.uid()
    )
  );
