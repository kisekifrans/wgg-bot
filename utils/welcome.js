const { EmbedBuilder } = require('discord.js');
const { hexToColor, applyEmbedMedia } = require('./embed');

/**
 * @param {string} text
 * @param {import('discord.js').User} user
 * @param {string} staffRoleId
 * @param {string | undefined} ownerDiscordId
 * @returns {string}
 */
function applyWelcomePlaceholders(text, user, staffRoleId, ownerDiscordId) {
  if (!text) {
    return '';
  }

  const ownerMention = ownerDiscordId ? `<@${ownerDiscordId}>` : '@Owner';

  return text
    .replace(/\{user\}/g, `${user}`)
    .replace(/\{username\}/g, user.username)
    .replace(/\{staff\}/g, `<@&${staffRoleId}>`)
    .replace(/\{owner\}/g, ownerMention);
}

/**
 * @param {import('discord.js').User} user
 * @param {string} staffRoleId
 * @param {object} panel
 * @param {string} channelName
 * @param {string} categoryLabel
 * @param {string | undefined} ownerDiscordId
 * @returns {{ content: string, embeds: EmbedBuilder[], allowedMentions: object }}
 */
function buildTicketWelcomeMessage(user, staffRoleId, panel, channelName, categoryLabel, ownerDiscordId) {
  const pingStaff = panel.pingStaff !== false;
  const welcomeConfig = panel.welcomeEmbed || {};

  const description = applyWelcomePlaceholders(
    welcomeConfig.description,
    user,
    staffRoleId,
    ownerDiscordId,
  );

  const embed = new EmbedBuilder()
    .setColor(hexToColor(welcomeConfig.color))
    .setDescription(description)
    .addFields(
      { name: 'Ticket ID', value: channelName.toUpperCase(), inline: true },
      { name: 'Category', value: categoryLabel, inline: true },
      { name: 'Status', value: '🟢 Open', inline: true },
    )
    .setTimestamp();

  if (welcomeConfig.title) {
    embed.setTitle(
      applyWelcomePlaceholders(welcomeConfig.title, user, staffRoleId, ownerDiscordId),
    );
  }

  if (welcomeConfig.footer) {
    embed.setFooter({ text: welcomeConfig.footer });
  }

  applyEmbedMedia(embed, welcomeConfig);

  const mentionUsers = [user.id];
  const mentions = [user.toString()];

  if (pingStaff) {
    mentions.push(`<@&${staffRoleId}>`);
  }

  if (ownerDiscordId) {
    mentions.push(`<@${ownerDiscordId}>`);
    mentionUsers.push(ownerDiscordId);
  }

  return {
    content: mentions.join(' '),
    embeds: [embed],
    allowedMentions: {
      users: mentionUsers,
      roles: pingStaff ? [staffRoleId] : [],
    },
  };
}

module.exports = {
  applyWelcomePlaceholders,
  buildTicketWelcomeMessage,
};
