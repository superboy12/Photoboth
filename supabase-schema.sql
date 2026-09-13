-- ============================================
-- Photobox Multiplayer — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ROOMS TABLE ────────────────────────────────────────────────────────────
create table if not exists public.rooms (
  code text primary key,
  host_id text not null,
  selected_frame text default null,
  selected_background jsonb default null,
  current_take integer default 0,
  session_status text default 'waiting',
  countdown_start_at timestamptz default null,
  max_participants integer default 8,
  expires_at timestamptz default (now() + interval '2 hours'),
  created_at timestamptz default now()
);

-- ─── PARTICIPANTS TABLE ──────────────────────────────────────────────────────
create table if not exists public.participants (
  id text primary key,
  room_code text not null references public.rooms(code) on delete cascade,
  name text not null,
  is_host boolean default false,
  is_ready boolean default false,
  joined_at timestamptz default now()
);

-- ─── ROOM EVENTS TABLE ──────────────────────────────────────────────────────
create table if not exists public.room_events (
  id uuid primary key default uuid_generate_v4(),
  room_code text not null,
  event_type text not null,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

-- ─── INDEXES ────────────────────────────────────────────────────────────────
create index if not exists idx_participants_room_code on public.participants(room_code);
create index if not exists idx_room_events_room_code on public.room_events(room_code);
create index if not exists idx_rooms_expires_at on public.rooms(expires_at);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.room_events enable row level security;

-- Allow all operations for authenticated and anon users (public photobooth)
create policy "Allow all on rooms" on public.rooms
  for all using (true) with check (true);

create policy "Allow all on participants" on public.participants
  for all using (true) with check (true);

create policy "Allow all on room_events" on public.room_events
  for all using (true) with check (true);

-- ─── REALTIME ────────────────────────────────────────────────────────────────
-- Enable realtime for the tables
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.participants;

-- ─── AUTO CLEANUP ────────────────────────────────────────────────────────────
-- Function to clean up expired rooms
create or replace function cleanup_expired_rooms()
returns void as $$
begin
  delete from public.rooms where expires_at < now();
end;
$$ language plpgsql;

-- ─── VERIFICATION ────────────────────────────────────────────────────────────
-- After running, verify with:
-- select * from public.rooms;
-- select * from public.participants;
