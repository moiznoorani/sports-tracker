-- Supabase Storage bucket for profile avatars.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Anyone can read avatars (public bucket), only the owner can upload/update/delete.
create policy "Avatar is publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "User can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Career stats: one row per user, aggregates populated later by stat events.
-- Created as an empty shell here so privacy rules are enforced from day one.
create table public.career_stats (
  user_id     uuid primary key references public.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger career_stats_updated_at
  before update on public.career_stats
  for each row execute procedure public.set_updated_at();

-- Auto-create a career_stats row alongside the users row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id) values (new.id);
  insert into public.career_stats (user_id) values (new.id);
  return new;
end;
$$;

-- RLS: career_stats visibility mirrors the user's privacy_setting.
alter table public.career_stats enable row level security;

create policy "User can read own career stats"
  on public.career_stats for select
  using (auth.uid() = user_id);

-- Public profiles: readable by any authenticated user.
-- Private profiles: readable only by the owner (league-member visibility added in Phase 2).
create policy "Public career stats readable by authenticated users"
  on public.career_stats for select
  using (
    auth.role() = 'authenticated' and
    (
      auth.uid() = user_id
      or exists (
        select 1 from public.users
        where id = user_id and privacy_setting = 'public'
      )
    )
  );

-- Extend users RLS to allow any authenticated user to read public profiles.
create policy "Public profiles readable by authenticated users"
  on public.users for select
  using (
    auth.uid() = id
    or (auth.role() = 'authenticated' and privacy_setting = 'public')
  );
