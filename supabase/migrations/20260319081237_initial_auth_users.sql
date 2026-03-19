-- Users table extends Supabase auth.users with app-specific profile data.
-- Created automatically on sign-up via trigger.

create table public.users (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text,
  avatar_url      text,
  privacy_setting text not null default 'private' check (privacy_setting in ('private', 'public')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

-- Auto-create a users row when a new auth.users record is inserted
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS: users can only read/write their own row.
-- Other users' rows become visible to League members in later migrations.
alter table public.users enable row level security;

create policy "User can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "User can update own profile"
  on public.users for update
  using (auth.uid() = id);
