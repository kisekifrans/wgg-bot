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
    setHealthStatus(false, error.message);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error) {
  const msg = error?.message || String(error);
  return msg.includes('429') || /rate limit/i.test(msg);
}

function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

  client.on('shardReconnecting', (id) => {
    console.log(`🔄 Shard ${id} reconnecting`);
    setHealthStatus(false, `Discord shard ${id} reconnecting`);
  });

  client.on('shardDisconnect', (event, id) => {
    console.log(`⚠️ Shard ${id} disconnected (code ${event.code})`);
  });

  client.on('shardError', (error) => {
    console.error('Discord shard error:', error);
    setHealthStatus(false, `Discord: ${error.message}`);
  });

  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });

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

  return client;
}

async function loginDiscord(client, token, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Discord login timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    client.once(Events.ClientReady, () => {
      clearTimeout(timer);
      resolve();
    });

    client.login(token).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function connectWithRetry(token) {
  let attempt = 0;

  while (true) {
    attempt += 1;
    const client = createDiscordClient();

    setHealthStatus(false, attempt === 1 ? 'connecting to Discord' : `connecting to Discord (attempt ${attempt})`);
    console.log(`🔌 Connecting to Discord (attempt ${attempt})...`);

    try {
      await loginDiscord(client, token);
      console.log('✅ Bot is fully online');
      return client;
    } catch (error) {
      console.error(`❌ Discord login failed (attempt ${attempt}):`, error.message);
      client.destroy();

      const waitMs = isRateLimitError(error)
        ? Math.min(attempt * 120000, 600000)
        : Math.min(attempt * 30000, 180000);

      setHealthStatus(
        false,
        isRateLimitError(error)
          ? `Discord rate limited — auto-retry in ${Math.round(waitMs / 1000)}s (do not redeploy)`
          : `Discord login failed — retry in ${Math.round(waitMs / 1000)}s`,
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
    setHealthStatus(false, `Store error: ${error.message}`);
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
