require('dotenv').config();

// Start health server FIRST — Fly.io needs port 8080 up immediately
const { startHealthServer, setHealthStatus } = require('./utils/health');
startHealthServer();

const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getRequiredEnvKeys } = require('./config/ticketCategories');
const { initStore, watchStoreFile, startStorePolling } = require('./utils/store');
const { isSupabaseEnabled } = require('./utils/supabaseClient');

const requiredEnv = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GUILD_ID',
  'STAFF_ROLE_ID',
  ...getRequiredEnvKeys(),
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnv.join(', ')}`);
  setHealthStatus(false, `Missing env: ${missingEnv.join(', ')}`);
} else {
  main().catch((error) => {
    console.error('Fatal startup error:', error);
    setHealthStatus(false, error.message, error.message);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error) {
  const msg = error?.message || String(error);
  return msg.includes('429') || /rate limit/i.test(msg);
}

function loadCommands(client) {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.execute) {
      continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`📦 Loaded command: /${command.data.name}`);
  }
}

function loadEvents(client) {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(`📡 Loaded event: ${event.name}`);
  }
}

function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
    ws: {
      handshakeTimeout: 60000,
      helloTimeout: 60000,
      readyTimeout: 180000,
    },
  });

  client.on('shardReconnecting', (id) => {
    console.log(`🔄 Shard ${id} reconnecting`);
    setHealthStatus(false, `Discord shard ${id} reconnecting`);
  });

  client.on('shardDisconnect', (event, id) => {
    console.log(`⚠️ Shard ${id} disconnected (code ${event.code})`);
  });

  loadCommands(client);
  loadEvents(client);

  return client;
}

async function destroyClient(client) {
  try {
    client.removeAllListeners();
    await client.destroy();
  } catch (error) {
    console.error('Client destroy error:', error.message);
  }
}

async function loginDiscord(client, token, timeoutMs = 180000) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (fn, value) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      fn(value);
    };

    const timer = setTimeout(() => {
      finish(reject, new Error(`Discord gateway timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    client.once(Events.ClientReady, () => finish(resolve));
    client.once('shardError', (error) => finish(reject, error));

    client.login(token).catch((error) => finish(reject, error));
  });
}

async function connectWithRetry(token) {
  let attempt = 0;

  while (true) {
    attempt += 1;
    const client = createDiscordClient();

    setHealthStatus(
      false,
      attempt === 1 ? 'connecting to Discord' : `connecting to Discord (attempt ${attempt})`,
    );
    console.log(`🔌 Connecting to Discord (attempt ${attempt}, token length ${token.length})...`);

    try {
      await loginDiscord(client, token);
      console.log('✅ Bot is fully online');
      return client;
    } catch (error) {
      const errMsg = error?.message || String(error);
      console.error(`❌ Discord login failed (attempt ${attempt}):`, errMsg);

      await destroyClient(client);
      // Let Discord release the session before reconnecting (same token = one session)
      await sleep(15000);

      const waitMs = isRateLimitError(error)
        ? Math.min(attempt * 120000, 600000)
        : Math.min(attempt * 60000, 300000);

      setHealthStatus(
        false,
        isRateLimitError(error)
          ? `Discord rate limited — retry in ${Math.round(waitMs / 1000)}s`
          : `Discord: ${errMsg.slice(0, 80)} — retry in ${Math.round(waitMs / 1000)}s`,
        errMsg,
      );

      await sleep(waitMs);
    }
  }
}

async function main() {
  setHealthStatus(false, 'booting');
  console.log('🚀 Booting WGG Ticket bot...');

  if (process.env.FLY_MACHINE_ID) {
    console.log(`🛫 Fly machine: ${process.env.FLY_MACHINE_ID}`);
  }

  try {
    setHealthStatus(false, 'loading store');
    console.log('📦 Loading store...');
    await initStore();
  } catch (error) {
    console.error('❌ Failed to load store from Supabase:', error);
    setHealthStatus(false, `Store error: ${error.message}`, error.message);
    return;
  }

  const token = (process.env.DISCORD_TOKEN || '').trim();
  if (!token) {
    setHealthStatus(false, 'DISCORD_TOKEN is missing or empty');
    return;
  }

  watchStoreFile();
  startStorePolling();

  if (!isSupabaseEnabled() && process.env.START_LEGACY_DASHBOARD !== 'false') {
    const { startDashboard } = require('./server/index');
    startDashboard();
  } else if (isSupabaseEnabled()) {
    console.log('🌐 Using Supabase + Vercel dashboard (legacy dashboard disabled)');
  }

  await connectWithRetry(token);
}
