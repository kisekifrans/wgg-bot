const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { isSupabaseEnabled, validateServiceRoleKey } = require('./supabaseClient');
const {
  fetchStoreFromSupabase,
  incrementTicketCounterSupabase,
} = require('./supabaseStore');

const STORE_PATH = path.join(__dirname, '../data/store.json');

/** @type {object | null} */
let cache = null;

/** @type {(() => void) | null} */
let onChangeCallback = null;

/** @type {NodeJS.Timeout | null} */
let pollTimer = null;

function loadStoreFromJson() {
  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveStoreToJson(data) {
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function getStore() {
  if (!cache) {
    if (isSupabaseEnabled()) {
      throw new Error('Store not initialized. Call initStore() first.');
    }
    cache = loadStoreFromJson();
  }
  return cache;
}

function saveStore(data) {
  cache = data;
  if (!isSupabaseEnabled()) {
    saveStoreToJson(data);
  }
  if (onChangeCallback) {
    onChangeCallback();
  }
}

async function initStore() {
  if (isSupabaseEnabled()) {
    validateServiceRoleKey();
    const timeoutMs = 20000;
    cache = await Promise.race([
      fetchStoreFromSupabase(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Supabase store load timed out after ${timeoutMs / 1000}s`)), timeoutMs);
      }),
    ]);
    console.log('📦 Store loaded from Supabase');
  } else {
    cache = loadStoreFromJson();
    console.log('📦 Store loaded from data/store.json');
  }
  return cache;
}

async function reloadStore() {
  if (isSupabaseEnabled()) {
    cache = await fetchStoreFromSupabase();
    if (onChangeCallback) {
      onChangeCallback();
    }
    return cache;
  }

  cache = null;
  return getStore();
}

function onStoreChange(callback) {
  onChangeCallback = callback;
}

function watchStoreFile() {
  if (isSupabaseEnabled()) {
    return;
  }

  fs.watch(STORE_PATH, { persistent: false }, () => {
    try {
      cache = loadStoreFromJson();
      if (onChangeCallback) {
        onChangeCallback();
      }
      console.log('🔄 Store reloaded from disk');
    } catch (error) {
      console.error('Failed to reload store:', error);
    }
  });
}

function startStorePolling(intervalMs = 15000) {
  if (!isSupabaseEnabled()) {
    return;
  }

  pollTimer = setInterval(async () => {
    try {
      const previous = JSON.stringify(cache);
      cache = await fetchStoreFromSupabase();
      if (JSON.stringify(cache) !== previous && onChangeCallback) {
        onChangeCallback();
      }
    } catch (error) {
      console.error('Store poll failed:', error);
    }
  }, intervalMs);
}

/**
 * @returns {Promise<string>}
 */
async function nextTicketChannelName() {
  if (isSupabaseEnabled()) {
    const name = await incrementTicketCounterSupabase();
    if (cache) {
      cache.ticketCounter += 1;
    }
    return name;
  }

  const store = getStore();
  store.ticketCounter += 1;
  saveStore(store);
  return `wgg-ticket-${String(store.ticketCounter).padStart(4, '0')}`;
}

function getPanelById(id) {
  return getStore().panels.find((panel) => panel.id === id && panel.enabled !== false);
}

function getCustomCommandByName(name) {
  return getStore().customCommands.find((command) => command.name === name);
}

function createPanel(panel) {
  const store = getStore();
  const entry = {
    id: panel.id || `panel_${randomUUID().slice(0, 8)}`,
    name: panel.name || 'New Panel',
    categoryKey: panel.categoryKey || 'account',
    enabled: panel.enabled !== false,
    embed: panel.embed || { title: '', description: '', color: '#5865F2', footer: 'WGG Ticket System' },
    button: panel.button || { label: 'Create ticket', emoji: '📩', style: 'Secondary' },
    welcomeEmbed: panel.welcomeEmbed || { title: 'Support Ticket', description: 'How can we help?', color: '#5865F2' },
    pingStaff: panel.pingStaff !== false,
  };
  store.panels.push(entry);
  saveStore(store);
  return entry;
}

function updatePanel(id, updates) {
  const store = getStore();
  const index = store.panels.findIndex((panel) => panel.id === id);
  if (index === -1) {
    return null;
  }
  store.panels[index] = { ...store.panels[index], ...updates };
  saveStore(store);
  return store.panels[index];
}

function deletePanel(id) {
  const store = getStore();
  const index = store.panels.findIndex((panel) => panel.id === id);
  if (index === -1) {
    return false;
  }
  store.panels.splice(index, 1);
  saveStore(store);
  return true;
}

function createCustomCommand(command) {
  const store = getStore();
  const entry = {
    id: command.id || `cmd_${randomUUID().slice(0, 8)}`,
    name: command.name || 'newcommand',
    description: command.description || 'Custom command',
    staffOnly: command.staffOnly !== false,
    embed: command.embed || { title: '', description: '', color: '#5865F2', footer: 'WGG Support' },
  };
  store.customCommands.push(entry);
  saveStore(store);
  return entry;
}

function updateCustomCommand(id, updates) {
  const store = getStore();
  const index = store.customCommands.findIndex((command) => command.id === id);
  if (index === -1) {
    return null;
  }

  if (updates.name) {
    updates.name = updates.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  }

  store.customCommands[index] = { ...store.customCommands[index], ...updates };
  saveStore(store);
  return store.customCommands[index];
}

function deleteCustomCommand(id) {
  const store = getStore();
  const index = store.customCommands.findIndex((command) => command.id === id);
  if (index === -1) {
    return false;
  }
  store.customCommands.splice(index, 1);
  saveStore(store);
  return true;
}

module.exports = {
  STORE_PATH,
  getStore,
  loadStore: loadStoreFromJson,
  saveStore,
  initStore,
  reloadStore,
  onStoreChange,
  watchStoreFile,
  startStorePolling,
  nextTicketChannelName,
  getPanelById,
  getCustomCommandByName,
  createPanel,
  updatePanel,
  deletePanel,
  createCustomCommand,
  updateCustomCommand,
  deleteCustomCommand,
};
