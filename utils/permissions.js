const { PermissionFlagsBits } = require('discord.js');

/**
 * @param {import('discord.js').GuildMember} member
 * @returns {boolean}
 */
function isAdmin(member) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

const BOT_CHANNEL_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.ManageChannels,
];

const MEMBER_CHANNEL_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.EmbedLinks,
];

const STAFF_CHANNEL_PERMISSIONS = [
  ...MEMBER_CHANNEL_PERMISSIONS,
  PermissionFlagsBits.ManageMessages,
];

/**
 * @param {import('discord.js').GuildChannel} channel
 * @param {import('discord.js').GuildMember} botMember
 * @returns {{ ok: boolean, missing: string[] }}
 */
function getMissingBotPermissions(channel, botMember) {
  const required = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ];

  const permissions = channel.permissionsFor(botMember);
  const missing = required.filter((flag) => !permissions?.has(flag));

  return {
    ok: missing.length === 0,
    missing: missing.map((flag) => permissionLabel(flag)),
  };
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} userId
 * @param {string} staffRoleId
 * @param {string} botUserId
 */
function buildTicketPermissionOverwrites(guild, userId, staffRoleId, botUserId) {
  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: userId,
      allow: MEMBER_CHANNEL_PERMISSIONS,
    },
    {
      id: staffRoleId,
      allow: STAFF_CHANNEL_PERMISSIONS,
    },
    {
      id: botUserId,
      allow: BOT_CHANNEL_PERMISSIONS,
    },
  ];
}

/**
 * @param {bigint} flag
 * @returns {string}
 */
function permissionLabel(flag) {
  switch (flag) {
    case PermissionFlagsBits.ViewChannel:
      return 'View Channel';
    case PermissionFlagsBits.SendMessages:
      return 'Send Messages';
    case PermissionFlagsBits.EmbedLinks:
      return 'Embed Links';
    default:
      return 'Unknown';
  }
}

module.exports = {
  isAdmin,
  getMissingBotPermissions,
  buildTicketPermissionOverwrites,
};
