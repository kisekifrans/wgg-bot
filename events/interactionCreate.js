const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  AttachmentBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { getCategoryById, getCategoryDiscordId } = require('../config/ticketCategories');
const { buildTicketPermissionOverwrites } = require('../utils/permissions');
const {
  isTicketChannel,
  findUserOpenTicketInCategory,
  generateTranscript,
} = require('../utils/ticket');
const { getPanelById, getCustomCommandByName, nextTicketChannelName } = require('../utils/store');
const { buildEmbedFromConfig } = require('../utils/embed');
const { buildTicketWelcomeMessage } = require('../utils/welcome');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      const customCommand = getCustomCommandByName(interaction.commandName);
      if (customCommand) {
        await handleCustomCommand(interaction, customCommand);
        return;
      }

      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error in /${interaction.commandName}:`, error);
        const payload = { content: '❌ Something went wrong.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith('panel_ticket:')) {
        const panelId = interaction.customId.split(':')[1];
        await handlePanelTicket(interaction, panelId);
        return;
      }

      if (interaction.customId === 'close_ticket') {
        await handleCloseTicket(interaction);
      }
    }
  },
};

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../types/store').CustomCommand} customCommand
 */
async function handleCustomCommand(interaction, customCommand) {
  if (customCommand.staffOnly) {
    const isStaff =
      interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages) ||
      interaction.memberPermissions.has(PermissionFlagsBits.Administrator);

    if (!isStaff) {
      return interaction.reply({
        content: '❌ This command is for staff only.',
        ephemeral: true,
      });
    }
  }

  const embed = buildEmbedFromConfig(customCommand.embed);

  await interaction.reply({ embeds: [embed] });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {string} panelId
 */
async function handlePanelTicket(interaction, panelId) {
  const { guild, user } = interaction;
  const staffRoleId = process.env.STAFF_ROLE_ID;
  const panel = getPanelById(panelId);

  if (!panel) {
    return interaction.reply({ content: '❌ This panel is no longer available.', ephemeral: true });
  }

  const category = getCategoryById(panel.categoryKey);
  if (!category) {
    return interaction.reply({ content: '❌ Invalid panel category.', ephemeral: true });
  }

  const discordCategoryId = getCategoryDiscordId(category);
  if (!discordCategoryId || !staffRoleId) {
    return interaction.reply({ content: '❌ Bot configuration incomplete.', ephemeral: true });
  }

  const existingTicket = findUserOpenTicketInCategory(guild, user.id, discordCategoryId);
  if (existingTicket) {
    return interaction.reply({
      content: `❌ You already have an open **${panel.name}** ticket: ${existingTicket}`,
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const channelName = await nextTicketChannelName();

  const ticketChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: discordCategoryId,
    topic: `[${category.label}] ${panel.name} | ${user.tag} (${user.id})`,
    permissionOverwrites: buildTicketPermissionOverwrites(
      guild,
      user.id,
      staffRoleId,
      interaction.client.user.id,
    ),
  });

  const welcomeMessage = buildTicketWelcomeMessage(
    user,
    staffRoleId,
    panel,
    channelName,
    category.label,
  );

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒'),
  );

  await ticketChannel.send({
    ...welcomeMessage,
    components: [closeRow],
  });

  await interaction.editReply({
    content: `✅ Ticket created: ${ticketChannel}`,
  });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleCloseTicket(interaction) {
  const channel = interaction.channel;

  if (!isTicketChannel(channel.name)) {
    return interaction.reply({
      content: '❌ This button only works inside ticket channels.',
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: '🔒 Closing ticket. Generating transcript...',
  });

  try {
    const transcript = await generateTranscript(channel);
    const buffer = Buffer.from(transcript, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, {
      name: `transcript-${channel.name}.txt`,
    });

    await channel.send({
      content: `📄 **Ticket Transcript**\nClosed by ${interaction.user}`,
      files: [attachment],
    });
  } catch (error) {
    console.error('Transcript error:', error);
    await channel.send('⚠️ Failed to generate transcript. Channel will still be deleted.');
  }

  setTimeout(async () => {
    try {
      await channel.delete(`Ticket closed by ${interaction.user.tag}`);
    } catch (error) {
      console.error('Failed to delete ticket channel:', error);
    }
  }, 5000);
}
