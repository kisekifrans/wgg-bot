/**
 * Generates supabase/seed-panels.sql from data/store.json
 * Run: node scripts/generate-seed-sql.js
 * Then paste/run seed-panels.sql in Supabase → SQL Editor (once)
 */
const fs = require('fs');
const path = require('path');
const { loadStore } = require('../utils/store');

const guildId = process.env.GUILD_ID || '939038877342113832';
const store = loadStore();

function sqlJson(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

const panelRows = store.panels.map((panel, index) => {
  return `  ('${panel.id}', '${guildId}', '${panel.name.replace(/'/g, "''")}', '${panel.categoryKey}', ${panel.enabled !== false}, ${sqlJson(panel.embed)}, ${sqlJson(panel.button)}, ${sqlJson(panel.welcomeEmbed)}, ${panel.pingStaff !== false}, ${index})`;
});

const commandRows = store.customCommands.map((cmd) => {
  return `  ('${cmd.id}', '${guildId}', '${cmd.name}', '${(cmd.description || '').replace(/'/g, "''")}', ${cmd.staffOnly !== false}, ${sqlJson(cmd.embed)})`;
});

const sql = `-- WGG Ticket — seed default panels & commands
-- Run once in Supabase → SQL Editor
-- Guild: ${guildId}

insert into guild_config (guild_id, ticket_counter)
values ('${guildId}', ${store.ticketCounter ?? 0})
on conflict (guild_id) do update set ticket_counter = excluded.ticket_counter;

insert into panels (
  id, guild_id, name, category_key, enabled, embed, button, welcome_embed, ping_staff, sort_order
) values
${panelRows.join(',\n')}
on conflict (id) do update set
  name = excluded.name,
  category_key = excluded.category_key,
  enabled = excluded.enabled,
  embed = excluded.embed,
  button = excluded.button,
  welcome_embed = excluded.welcome_embed,
  ping_staff = excluded.ping_staff,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into custom_commands (
  id, guild_id, name, description, staff_only, embed
) values
${commandRows.join(',\n')}
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  staff_only = excluded.staff_only,
  embed = excluded.embed,
  updated_at = now();
`;

const out = path.join(__dirname, '..', 'supabase', 'seed-panels.sql');
fs.writeFileSync(out, sql);
console.log(`✅ Wrote ${out} (${store.panels.length} panels, ${store.customCommands.length} commands)`);
