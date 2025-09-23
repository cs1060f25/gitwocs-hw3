-- Supabase schema for Commutr prototype
-- Run this in the SQL editor of your Supabase project

-- 1) Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- 2) Profiles table keyed by auth.users.id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  commute_duration integer default 25 check (commute_duration between 5 and 180),
  interests jsonb default '[]'::jsonb,
  streak integer default 0 check (streak >= 0),
  current_vibe text default 'curious',
  updated_at timestamptz default now()
);

-- 3) Helpful index for interests lookup
create index if not exists idx_profiles_interests on public.profiles using gin (interests);

-- 4) Row Level Security
alter table public.profiles enable row level security;

-- 5) Policies: users can read/update only their own profile
create policy if not exists "Profiles are viewable by owner" on public.profiles
  for select using ( auth.uid() = id );

create policy if not exists "Profiles are updatable by owner" on public.profiles
  for update using ( auth.uid() = id );

create policy if not exists "Profiles are insertable by owner" on public.profiles
  for insert with check ( auth.uid() = id );

-- 6) (Optional) Seed from existing auth user on sign-up using edge function or trigger (simpler: app upsert)
-- In this prototype, we upsert from the front-end after auth, so no trigger is required.
