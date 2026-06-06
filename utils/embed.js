const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const BUTTON_STYLES = {
  Primary: ButtonStyle.Primary,
  Secondary: ButtonStyle.Secondary,
  Success: ButtonStyle.Success,
  Danger: ButtonStyle.Danger,
};

/**
 * @param {string} hex
 * @returns {number}
 */
function hexToColor(hex) {
  if (!hex) {
    return 0x5865f2;
  }
  const cleaned = hex.replace('#', '');
  return Number.parseInt(cleaned, 16);
}

/**
 * @param {string | undefined} url
 * @returns {boolean}
 */
function isValidHttpUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {EmbedBuilder} embed
 * @param {{ image?: string, thumbnail?: string }} config
 * @returns {EmbedBuilder}
 */
function applyEmbedMedia(embed, config) {
  if (isValidHttpUrl(config?.image)) {
    embed.setImage(config.image.trim());
  }

  if (isValidHttpUrl(config?.thumbnail)) {
    embed.setThumbnail(config.thumbnail.trim());
  }

  return embed;
}

/**
 * @param {import('../types/store').EmbedConfig} config
 * @returns {EmbedBuilder}
 */
function buildEmbedFromConfig(config) {
  const embed = new EmbedBuilder().setColor(hexToColor(config.color));

  if (config.title) {
    embed.setTitle(config.title);
  }

  if (config.description) {
    embed.setDescription(config.description);
  }

  if (config.footer) {
    embed.setFooter({ text: config.footer });
  }

  applyEmbedMedia(embed, config);
  embed.setTimestamp();
  return embed;
}

/**
 * @param {import('../types/store').Panel} panel
 * @returns {{ embeds: EmbedBuilder[], components: ActionRowBuilder[] }}
 */
function buildPanelMessage(panel) {
  const embed = buildEmbedFromConfig(panel.embed);
  const style = BUTTON_STYLES[panel.button.style] ?? ButtonStyle.Secondary;

  const button = new ButtonBuilder()
    .setCustomId(`panel_ticket:${panel.id}`)
    .setLabel(panel.button.label || 'Create ticket')
    .setStyle(style);

  if (panel.button.emoji) {
    const custom = String(panel.button.emoji).match(/^<a?:(\w+):(\d+)>$/);
    button.setEmoji(
      custom
        ? { name: custom[1], id: custom[2], animated: panel.button.emoji.startsWith('<a:') }
        : panel.button.emoji,
    );
  }

  const row = new ActionRowBuilder().addComponents(button);

  return {
    embeds: [embed],
    components: [row],
  };
}

module.exports = {
  hexToColor,
  isValidHttpUrl,
  applyEmbedMedia,
  buildEmbedFromConfig,
  buildPanelMessage,
};
