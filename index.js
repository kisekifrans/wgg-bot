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
  setHealthStatus(true, 'booting');

  await initStore();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
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

  await client.login(process.env.DISCORD_TOKEN);
  setHealthStatus(true, 'online');
}
