const { randomUUID } = require('crypto');
const { getSupabase } = require('./supabaseClient');

function getGuildId() {
  return process.env.GUILD_ID;
}

/**
 * @returns {Promise<{ ticketCounter: number, panels: object[], customCommands: object[] }>}
 */
async function fetchStoreFromSupabase() {
  const supabase = getSupabase();
  const guildId = getGuildId();

  const [{ data: config }, { data: panels }, { data: commands }] = await Promise.all([
    supabase.from('guild_config').select('ticket_counter').eq('guild_id', guildId).maybeSingle(),
    supabase.from('panels').select('*').eq('guild_id', guildId).order('sort_order'),
    supabase.from('custom_commands').select('*').eq('guild_id', guildId).order('name'),
  ]);

  return {
    ticketCounter: config?.ticket_counter ?? 0,
    panels: (panels ?? []).map(mapPanelFromDb),
    customCommands: (commands ?? []).map(mapCommandFromDb),
  };
}

function mapPanelFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    categoryKey: row.category_key,
    enabled: row.enabled,
    embed: row.embed,
    button: row.button,
    welcomeEmbed: row.welcome_embed,
    pingStaff: row.ping_staff,
  };
}

function mapCommandFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    staffOnly: row.staff_only,
    embed: row.embed,
  };
}

function mapPanelToDb(panel, guildId) {
  return {
    id: panel.id,
    guild_id: guildId,
    name: panel.name,
    category_key: panel.categoryKey,
    enabled: panel.enabled !== false,
    embed: panel.embed,
    button: panel.button,
    welcome_embed: panel.welcomeEmbed,
    ping_staff: panel.pingStaff !== false,
    sort_order: panel.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };
}

function mapCommandToDb(command, guildId) {
  return {
    id: command.id,
    guild_id: guildId,
    name: command.name,
    description: command.description || '',
    staff_only: command.staffOnly !== false,
    embed: command.embed,
    updated_at: new Date().toISOString(),
  };
}

/**
 * @returns {Promise<string>}
 */
async function incrementTicketCounterSupabase() {
  const supabase = getSupabase();
  const guildId = getGuildId();

  const { data, error } = await supabase.rpc('increment_ticket_counter', {
    guild_id_param: guildId,
  });

  if (error) {
    throw error;
  }

  return `wgg-ticket-${String(data).padStart(4, '0')}`;
}

/**
 * @param {{ ticketCounter: number, panels: object[], customCommands: object[] }} store
 */
async function saveStoreToSupabase(store) {
  const supabase = getSupabase();
  const guildId = getGuildId();

  await supabase.from('guild_config').upsert({
    guild_id: guildId,
    ticket_counter: store.ticketCounter,
    updated_at: new Date().toISOString(),
  });

  if (store.panels.length) {
    await supabase.from('panels').upsert(store.panels.map((p) => mapPanelToDb(p, guildId)));
  }

  if (store.customCommands.length) {
    await supabase.from('custom_commands').upsert(
      store.customCommands.map((c) => mapCommandToDb(c, guildId)),
    );
  }
}

/**
 * Seed Supabase from local JSON store (one-time migration helper)
 */
async function seedFromJsonStore(jsonStore) {
  const supabase = getSupabase();
  const guildId = getGuildId();

  await supabase.from('guild_config').upsert({
    guild_id: guildId,
    ticket_counter: jsonStore.ticketCounter ?? 0,
  });

  if (jsonStore.panels?.length) {
    await supabase.from('panels').upsert(
      jsonStore.panels.map((panel, index) =>
        mapPanelToDb({ ...panel, sortOrder: index }, guildId),
      ),
    );
  }

  if (jsonStore.customCommands?.length) {
    await supabase.from('custom_commands').upsert(
      jsonStore.customCommands.map((command) => mapCommandToDb(command, guildId)),
    );
  }
}

module.exports = {
  fetchStoreFromSupabase,
  incrementTicketCounterSupabase,
  saveStoreToSupabase,
  seedFromJsonStore,
  mapPanelFromDb,
  mapCommandFromDb,
  mapPanelToDb,
  mapCommandToDb,
};
