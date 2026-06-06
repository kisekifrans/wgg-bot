const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { isAdmin, getMissingBotPermissions } = require('../utils/permissions');
const { getStore } = require('../utils/store');
const { buildPanelMessage } = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Deploy ticket panels to this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('send')
        .setDescription('Send a ticket panel embed with button')
        .addStringOption((option) =>
          option
            .setName('panel')
            .setDescription('Which panel to deploy')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('send-all')
        .setDescription('Send all enabled panels to this channel'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription('List all available panels'),
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const panels = getStore().panels.filter((panel) => panel.enabled !== false);

    const choices = panels
      .filter((panel) => panel.name.toLowerCase().includes(focused) || panel.id.includes(focused))
      .slice(0, 25)
      .map((panel) => ({ name: panel.name, value: panel.id }));

    await interaction.respond(choices);
  },

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        content: '❌ This command is for Administrators only.',
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      const panels = getStore().panels;
      const list = panels
        .map((panel) => `• **${panel.name}** (\`${panel.id}\`) → ${panel.categoryKey}`)
        .join('\n');

      return interaction.reply({
        content: panels.length
          ? `**Available Panels**\n${list}\n\nUse \`/panel send panel:<id>\` to deploy.`
          : 'No panels configured. Create one in the dashboard.',
        ephemeral: true,
      });
    }

    const botMember = interaction.guild.members.me;
    const access = getMissingBotPermissions(interaction.channel, botMember);

    if (!access.ok) {
      return interaction.reply({
        content: [
          '❌ Bot lacks permission to send messages in this channel.',
          `Missing: **${access.missing.join(', ')}**`,
        ].join('\n'),
        ephemeral: true,
      });
    }

    if (subcommand === 'send-all') {
      const panels = getStore().panels.filter((panel) => panel.enabled !== false);

      if (!panels.length) {
        return interaction.reply({ content: 'No enabled panels found.', ephemeral: true });
      }

      await interaction.reply({
        content: `✅ Deploying **${panels.length}** panel(s)...`,
        ephemeral: true,
      });

      for (const panel of panels) {
        const message = buildPanelMessage(panel);
        await interaction.channel.send(message);
      }

      return;
    }

    const panelId = interaction.options.getString('panel', true);
    const panel = getStore().panels.find((entry) => entry.id === panelId);

    if (!panel || panel.enabled === false) {
      return interaction.reply({ content: '❌ Panel not found.', ephemeral: true });
    }

    await interaction.reply({
      content: `✅ Panel **${panel.name}** deployed.`,
      ephemeral: true,
    });

    await interaction.channel.send(buildPanelMessage(panel));
  },
};
