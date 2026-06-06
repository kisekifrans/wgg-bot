const { EmbedBuilder } = require('discord.js');
const { hexToColor } = require('./embed');

/**
 * @param {string} text
 * @param {import('discord.js').User} user
 * @param {string} staffRoleId
 * @returns {string}
 */
function applyWelcomePlaceholders(text, user, staffRoleId) {
  if (!text) {
    return '';
  }

  return text
    .replace(/\{user\}/g, `${user}`)
    .replace(/\{username\}/g, user.username)
    .replace(/\{staff\}/g, `<@&${staffRoleId}>`);
}

/**
 * @param {import('discord.js').User} user
 * @param {string} staffRoleId
 * @param {object} panel
 * @param {string} channelName
 * @param {string} categoryLabel
 * @returns {{ content: string, embeds: EmbedBuilder[], allowedMentions: object }}
 */
function buildTicketWelcomeMessage(user, staffRoleId, panel, channelName, categoryLabel) {
  const pingStaff = panel.pingStaff !== false;
  const welcomeConfig = panel.welcomeEmbed || {};

  const description = applyWelcomePlaceholders(welcomeConfig.description, user, staffRoleId);

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
    embed.setTitle(applyWelcomePlaceholders(welcomeConfig.title, user, staffRoleId));
  }

  if (welcomeConfig.footer) {
    embed.setFooter({ text: welcomeConfig.footer });
  }

  const mentions = [user.toString()];
  if (pingStaff) {
    mentions.push(`<@&${staffRoleId}>`);
  }

  return {
    content: mentions.join(' '),
    embeds: [embed],
    allowedMentions: {
      users: [user.id],
      roles: pingStaff ? [staffRoleId] : [],
    },
  };
}

module.exports = {
  applyWelcomePlaceholders,
  buildTicketWelcomeMessage,
};
