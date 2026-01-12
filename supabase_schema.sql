-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TABLES CREATION (If they don't exist)
create table if not exists public.players (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  division text not null,
  age integer,
  position text,
  height numeric,
  weight numeric,
  minutes_played integer default 0,
  matches_played integer default 0,
  is_injured boolean default false,
  technical_report text,
  goals integer default 0,
  photo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.matches (
  id uuid default uuid_generate_v4() primary key,
  division text not null,
  date date not null,
  opponent text not null,
  result text not null,
  created_by text,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.match_players (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  player_name text,
  minutes_played integer default 0,
  was_injured boolean default false,
  goals integer default 0
);

create table if not exists public.trainings (
  id uuid default uuid_generate_v4() primary key,
  division text not null,
  date date not null,
  description text,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  player_id uuid references public.players(id) on delete cascade,
  professional_id uuid,
  professional_name text,
  professional_role text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  content text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.area_reports (
  id uuid default uuid_generate_v4() primary key,
  area text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.area_events (
  id uuid default uuid_generate_v4() primary key,
  area text not null,
  date timestamp with time zone not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.formations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  formation_type text not null,
  division text,
  players jsonb not null default '[]'::jsonb,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ENABLE RLS
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.trainings enable row level security;
alter table public.reports enable row level security;
alter table public.area_reports enable row level security;
alter table public.area_events enable row level security;
alter table public.formations enable row level security;

-- 3. CLEANUP ALL POLICIES (To avoid "policy already exists" errors)
-- Old insecure policies
drop policy if exists "Enable all access for all users" on public.players;
drop policy if exists "Enable all access for all users" on public.matches;
drop policy if exists "Enable all access for all users" on public.match_players;
drop policy if exists "Enable all access for all users" on public.trainings;
drop policy if exists "Enable all access for all users" on public.reports;
drop policy if exists "Enable all access for all users" on public.area_reports;
drop policy if exists "Enable all access for all users" on public.area_events;
drop policy if exists "Enable all access for all users" on public.formations;

-- New secure policies (drop first to ensure we can recreate them)
drop policy if exists "Authenticated users can access players" on public.players;
drop policy if exists "Authenticated users can access matches" on public.matches;
drop policy if exists "Authenticated users can access match_players" on public.match_players;
drop policy if exists "Authenticated users can access trainings" on public.trainings;
drop policy if exists "Authenticated users can access reports" on public.reports;
drop policy if exists "Authenticated users can access area_reports" on public.area_reports;
drop policy if exists "Authenticated users can access area_events" on public.area_events;
drop policy if exists "Authenticated users can access formations" on public.formations;

-- 4. CREATE SECURE POLICIES (Authenticated Users Only)
create policy "Authenticated users can access players" 
  on public.players for all to authenticated using (true) with check (true);

create policy "Authenticated users can access matches" 
  on public.matches for all to authenticated using (true) with check (true);

create policy "Authenticated users can access match_players" 
  on public.match_players for all to authenticated using (true) with check (true);

create policy "Authenticated users can access trainings" 
  on public.trainings for all to authenticated using (true) with check (true);

create policy "Authenticated users can access reports" 
  on public.reports for all to authenticated using (true) with check (true);

create policy "Authenticated users can access area_reports" 
  on public.area_reports for all to authenticated using (true) with check (true);

create policy "Authenticated users can access area_events" 
  on public.area_events for all to authenticated using (true) with check (true);

create policy "Authenticated users can access formations" 
  on public.formations for all to authenticated using (true) with check (true);

-- 5. FUNCTIONS (RPC)
CREATE OR REPLACE FUNCTION increment_player_stats(
  p_id uuid, 
  p_minutes integer, 
  p_goals integer, 
  p_injured boolean
)
RETURNS void AS $$
BEGIN
  UPDATE public.players
  SET 
    minutes_played = minutes_played + p_minutes,
    matches_played = matches_played + 1,
    goals = goals + p_goals,
    is_injured = p_injured
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
