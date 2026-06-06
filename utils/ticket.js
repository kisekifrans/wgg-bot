const { PermissionFlagsBits } = require('discord.js');

const TICKET_CHANNEL_PATTERN = /^wgg-ticket-\d{4}$/i;

/**
 * @param {string} channelName
 * @returns {boolean}
 */
function isTicketChannel(channelName) {
  return TICKET_CHANNEL_PATTERN.test(channelName);
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} userId
 * @param {string} categoryDiscordId
 */
function findUserOpenTicketInCategory(guild, userId, categoryDiscordId) {
  return guild.channels.cache.find(
    (channel) =>
      channel.parentId === categoryDiscordId &&
      isTicketChannel(channel.name) &&
      channel.permissionOverwrites.cache.get(userId)?.allow.has(PermissionFlagsBits.ViewChannel),
  );
}

/**
 * @param {import('discord.js').TextChannel} channel
 * @returns {Promise<string>}
 */
async function generateTranscript(channel) {
  const allMessages = [];
  let lastMessageId;

  while (true) {
    const options = { limit: 100 };
    if (lastMessageId) {
      options.before = lastMessageId;
    }

    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) {
      break;
    }

    allMessages.push(...batch.values());
    lastMessageId = batch.last().id;

    if (batch.size < 100) {
      break;
    }
  }

  allMessages.reverse();

  let transcript = `Ticket Transcript: #${channel.name}\n`;
  transcript += `Guild: ${channel.guild.name}\n`;
  transcript += `Exported: ${new Date().toLocaleString('en-US')}\n`;
  transcript += `${'='.repeat(50)}\n\n`;

  for (const message of allMessages) {
    const timestamp = message.createdAt.toLocaleString('en-US');
    const content = message.content || '[no text]';

    transcript += `[${timestamp}] ${message.author.tag}: ${content}\n`;

    for (const embed of message.embeds) {
      const title = embed.title || 'No title';
      const description = embed.description || 'No description';
      transcript += `  [Embed] ${title} — ${description}\n`;
      if (embed.image?.url) {
        transcript += `  [Embed Image] ${embed.image.url}\n`;
      }
      if (embed.thumbnail?.url) {
        transcript += `  [Embed Thumbnail] ${embed.thumbnail.url}\n`;
      }
    }

    for (const attachment of message.attachments.values()) {
      transcript += `  [Attachment] ${attachment.name}: ${attachment.url}\n`;
    }

    transcript += '\n';
  }

  return transcript;
}

module.exports = {
  isTicketChannel,
  findUserOpenTicketInCategory,
  generateTranscript,
};
