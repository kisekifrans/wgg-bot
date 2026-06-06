require('dotenv').config();

// Start health server FIRST — Fly.io needs port 8080 up immediately
const { startHealthServer, setHealthStatus } = require('./utils/health');
startHealthServer();

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
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

  await verifyDiscordApi(token);

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

  watchStoreFile();
  startStorePolling();

  if (!isSupabaseEnabled() && process.env.START_LEGACY_DASHBOARD !== 'false') {
    const { startDashboard } = require('./server/index');
    startDashboard();
  } else if (isSupabaseEnabled()) {
    console.log('🌐 Using Supabase + Vercel dashboard (legacy dashboard disabled)');
  }

  setHealthStatus(false, 'connecting to Discord');
  console.log('🔌 Connecting to Discord...');
  const loginTimeoutMs = 90000;
  try {
    await Promise.race([
      client.login(token),
      new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                `Discord login timed out after ${loginTimeoutMs / 1000}s — check token, scale to 1 Fly machine, stop local bot`,
              ),
            ),
          loginTimeoutMs,
        );
      }),
    ]);
  } catch (loginError) {
    client.destroy();
    throw loginError;
  }
  console.log('✅ Bot is fully online');
}

async function verifyDiscordApi(token) {
  setHealthStatus(false, 'checking Discord API');
  const res = await fetch('https://discord.com/api/v10/gateway/bot', {
    headers: { Authorization: `Bot ${token}` },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord API rejected token (${res.status}): ${body.slice(0, 120)}`);
  }

  const data = await res.json();
  console.log(`🌐 Discord API OK — ${data.shards} shard(s), session start limit ${data.session_start_limit.remaining}/${data.session_start_limit.max}`);
}
