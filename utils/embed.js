const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const {
  parseCustomEmojiTag,
  normalizeKnownEmojiShortcodes,
  splitEdgeCustomEmojis,
  customEmojiToMessageContent,
} = require('./discordEmoji');

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
 * @param {import('../types/store').EmbedConfig} config
 * @returns {EmbedBuilder}
 */
function buildEmbedFromConfig(config) {
  const embed = new EmbedBuilder().setColor(hexToColor(config.color));

  if (config.title) {
    embed.setTitle(config.title);
  }

  if (config.description) {
    embed.setDescription(normalizeKnownEmojiShortcodes(config.description));
  }

  if (config.footer) {
    embed.setFooter({ text: config.footer });
  }

  embed.setTimestamp();
  return embed;
}

/**
 * Panel embeds: leading custom emoji goes in message content (Discord embed text often shows :name: only).
 * @param {import('../types/store').Panel} panel
 * @returns {{ content?: string, embeds: EmbedBuilder[], components: ActionRowBuilder[] }}
 */
function buildPanelMessage(panel) {
  const { leading, body } = splitEdgeCustomEmojis(panel.embed?.description || '');
  const embed = buildEmbedFromConfig({ ...panel.embed, description: body });
  const style = BUTTON_STYLES[panel.button.style] ?? ButtonStyle.Secondary;

  const button = new ButtonBuilder()
    .setCustomId(`panel_ticket:${panel.id}`)
    .setLabel(panel.button.label || 'Create ticket')
    .setStyle(style);

  if (panel.button.emoji) {
    const custom = parseCustomEmojiTag(panel.button.emoji);
    button.setEmoji(custom ? { name: custom.name, id: custom.id, animated: custom.animated } : panel.button.emoji);
  }

  const row = new ActionRowBuilder().addComponents(button);

  return {
    content: customEmojiToMessageContent(leading),
    embeds: [embed],
    components: [row],
  };
}

module.exports = {
  hexToColor,
  buildEmbedFromConfig,
  buildPanelMessage,
};
