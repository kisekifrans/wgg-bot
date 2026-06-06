const { Events } = require('discord.js');
const { registerGuildCommands, setClient } = require('../utils/registerCommands');
const { onStoreChange, watchStoreFile, reloadStore } = require('../utils/store');
const { setHealthStatus } = require('../utils/health');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    setClient(client);
    setHealthStatus(true, 'online');
    console.log(`✅ Bot online as ${client.user.tag}`);

    watchStoreFile();
    onStoreChange(async () => {
      reloadStore();
      try {
        const { reloadCommands } = require('../utils/registerCommands');
        await reloadCommands();
      } catch (error) {
        console.error('Failed to reload commands after store change:', error);
      }
    });

    try {
      await registerGuildCommands(client);
    } catch (error) {
      console.error('❌ Failed to register slash commands:', error);
    }
  },
};
