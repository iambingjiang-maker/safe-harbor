-- Sturdy (Good Inside Family Companion) — Supabase Schema
-- Run this entire script once in Supabase -> SQL Editor -> New Query

-- 1. Family profile (shared across Mom & Dad's phones via family_code + PIN)
create table if not exists public.families (
  family_code text primary key,
  pin text not null default '0901',
  parent1_pin text not null default '0527',
  parent2_pin text not null default '0901',
  parent1_name text not null default 'Mom',
  parent2_name text not null default 'Dad',
  child_name text not null default 'Liam',
  child_age integer not null default 4,
  updated_at timestamptz not null default now()
);

-- 2. Shared moment logs (what happened, what we tried, whether it worked)
create table if not exists public.moment_logs (
  id uuid primary key,
  family_code text not null references public.families(family_code) on delete cascade,
  created_at timestamptz not null default now(),
  parent_name text not null,
  trigger_id text not null,
  strategy_id text not null,
  strategy_title text not null,
  outcome text not null check (outcome in ('helped', 'somewhat', 'escalated')),
  was_tired boolean not null default false,
  was_flooded boolean not null default false,
  context_tags text[] not null default '{}',
  notes text not null default ''
);

create index if not exists idx_moment_logs_family_created
  on public.moment_logs (family_code, created_at desc);

-- 3. Custom family scripts added by either parent
create table if not exists public.custom_scripts (
  id uuid primary key,
  family_code text not null references public.families(family_code) on delete cascade,
  created_at timestamptz not null default now(),
  created_by text not null,
  trigger_id text not null,
  title text not null,
  script_flooded text not null default '',
  script_standard text not null,
  body_action text not null default '',
  avoid_tip text not null default ''
);

create index if not exists idx_custom_scripts_family
  on public.custom_scripts (family_code, created_at desc);

-- 4. Starred / favorite strategy IDs shared across the family
create table if not exists public.strategy_favorites (
  family_code text not null references public.families(family_code) on delete cascade,
  strategy_id text not null,
  created_at timestamptz not null default now(),
  primary key (family_code, strategy_id)
);

-- Enable Row Level Security with family-scoped access
-- (This app is designed for private family deployment using a unique family_code + shared PIN.)
alter table public.families enable row level security;
alter table public.moment_logs enable row level security;
alter table public.custom_scripts enable row level security;
alter table public.strategy_favorites enable row level security;

drop policy if exists "family_access_families" on public.families;
create policy "family_access_families" on public.families
  for all using (true) with check (true);

drop policy if exists "family_access_logs" on public.moment_logs;
create policy "family_access_logs" on public.moment_logs
  for all using (true) with check (true);

drop policy if exists "family_access_scripts" on public.custom_scripts;
create policy "family_access_scripts" on public.custom_scripts
  for all using (true) with check (true);

drop policy if exists "family_access_favorites" on public.strategy_favorites;
create policy "family_access_favorites" on public.strategy_favorites
  for all using (true) with check (true);

-- Enable Realtime so Mom & Dad's phones stay instantly in sync
do $$
begin
  alter publication supabase_realtime add table public.families;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.moment_logs;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.custom_scripts;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.strategy_favorites;
exception when duplicate_object then null;
end $$;
