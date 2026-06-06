const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getStore } = require('./store');

/** @type {import('discord.js').Client | null} */
let clientRef = null;

/** @type {number} */
let lastRegisterAt = 0;

const REGISTER_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * @param {import('discord.js').Client} client
 */
async function registerGuildCommands(client, { force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastRegisterAt < REGISTER_COOLDOWN_MS) {
    return 0;
  }
  lastRegisterAt = now;

  const commands = [];
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }

  const store = getStore();
  for (const customCommand of store.customCommands) {
    commands.push(
      new SlashCommandBuilder()
        .setName(customCommand.name)
        .setDescription(customCommand.description || 'Custom command')
        .setDefaultMemberPermissions(
          customCommand.staffOnly ? PermissionFlagsBits.ManageMessages : null,
        )
        .toJSON(),
    );
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands },
  );

  console.log(`✅ Registered ${commands.length} slash command(s)`);
  return commands.length;
}

/** @type {import('discord.js').Client | null} */
let clientRef = null;

function setClient(client) {
  clientRef = client;
}

async function reloadCommands() {
  if (!clientRef?.isReady()) {
    return;
  }
  await registerGuildCommands(clientRef);
}

module.exports = {
  registerGuildCommands,
  setClient,
  reloadCommands,
};
