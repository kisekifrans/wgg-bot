-- WGG Ticket Bot — Supabase schema
-- Run in Supabase SQL Editor

create table if not exists guild_config (
  guild_id text primary key,
  ticket_counter integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists panels (
  id text primary key,
  guild_id text not null,
  name text not null,
  category_key text not null,
  enabled boolean not null default true,
  embed jsonb not null default '{}',
  button jsonb not null default '{}',
  welcome_embed jsonb not null default '{}',
  ping_staff boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists custom_commands (
  id text primary key,
  guild_id text not null,
  name text not null,
  description text not null default '',
  staff_only boolean not null default true,
  embed jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guild_id, name)
);

create index if not exists idx_panels_guild on panels (guild_id);
create index if not exists idx_commands_guild on custom_commands (guild_id);

-- Atomic ticket counter increment (used by bot)
create or replace function increment_ticket_counter(guild_id_param text)
returns integer
language plpgsql
as $$
declare
  new_val integer;
begin
  insert into guild_config (guild_id, ticket_counter)
  values (guild_id_param, 0)
  on conflict (guild_id) do nothing;

  update guild_config
  set ticket_counter = ticket_counter + 1,
      updated_at = now()
  where guild_id = guild_id_param
  returning ticket_counter into new_val;

  return new_val;
end;
$$;

-- Row Level Security
alter table guild_config enable row level security;
alter table panels enable row level security;
alter table custom_commands enable row level security;

-- Authenticated users can read (dashboard); writes via logged-in API routes
create policy "Authenticated read guild_config"
  on guild_config for select
  to authenticated
  using (true);

create policy "Authenticated write guild_config"
  on guild_config for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated read panels"
  on panels for select
  to authenticated
  using (true);

create policy "Authenticated write panels"
  on panels for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated read custom_commands"
  on custom_commands for select
  to authenticated
  using (true);

create policy "Authenticated write custom_commands"
  on custom_commands for all
  to authenticated
  using (true)
  with check (true);

-- Service role bypasses RLS automatically
