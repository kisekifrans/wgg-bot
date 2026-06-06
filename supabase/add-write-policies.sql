-- Run in Supabase → SQL Editor if dashboard can't save/load panels
-- (adds write policies for logged-in dashboard users)

drop policy if exists "Authenticated write guild_config" on guild_config;
drop policy if exists "Authenticated write panels" on panels;
drop policy if exists "Authenticated write custom_commands" on custom_commands;

create policy "Authenticated write guild_config"
  on guild_config for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated write panels"
  on panels for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated write custom_commands"
  on custom_commands for all
  to authenticated
  using (true)
  with check (true);
