/**
 * Konfigurasi kategori tiket — mirip multipanel TicketTool.xyz.
 * Setiap entry = satu tombol di panel + satu Discord category tujuan.
 *
 * @typedef {Object} TicketCategory
 * @property {string} id
 * @property {string} label
 * @property {string} emoji
 * @property {string} envKey
 * @property {number} color
 * @property {string} description
 * @property {string} welcomeMessage
 */

/** @type {TicketCategory[]} */
const ticketCategories = [
  {
    id: 'account',
    label: 'Account',
    emoji: '👤',
    envKey: 'CATEGORY_ACCOUNT_ID',
    color: 0x5865f2,
    description: 'Masalah login, reset password, atau data akun.',
    welcomeMessage:
      'Halo! Jelaskan kendala **akun** kamu di sini (username, email terdaftar, dan detail masalah). Tim kami akan segera membantu.',
  },
  {
    id: 'boosting',
    label: 'Boosting',
    emoji: '⚡',
    envKey: 'CATEGORY_BOOSTING_ID',
    color: 0xfee75c,
    description: 'Pertanyaan atau klaim terkait layanan boosting.',
    welcomeMessage:
      'Halo! Sertakan detail pesanan **boosting** kamu (paket, bukti pembayaran, dan progress saat ini). Tim kami akan segera membantu.',
  },
  {
    id: 'unban',
    label: 'Unban',
    emoji: '🔓',
    envKey: 'CATEGORY_UNBAN_ID',
    color: 0xed4245,
    description: 'Ajukan banding atau cek status unban.',
    welcomeMessage:
      'Halo! Jelaskan alasan **unban** yang kamu ajukan (username, tanggal ban, dan penjelasan lengkap). Tim kami akan segera meninjau.',
  },
  {
    id: 'relink',
    label: 'Relink',
    emoji: '🔗',
    envKey: 'CATEGORY_RELINK_ID',
    color: 0x57f287,
    description: 'Permintaan relink akun atau platform.',
    welcomeMessage:
      'Halo! Jelaskan permintaan **relink** kamu (akun lama, akun baru, dan bukti kepemilikan). Tim kami akan segera membantu.',
  },
  {
    id: 'predator',
    label: 'Predator',
    emoji: '🎯',
    envKey: 'CATEGORY_PREDATOR_ID',
    color: 0xeb459e,
    description: 'Laporan atau pertanyaan terkait predator.',
    welcomeMessage:
      'Halo! Jelaskan laporan atau pertanyaan terkait **predator** di sini selengkap mungkin. Tim kami akan segera membantu.',
  },
];

/**
 * @param {string} id
 * @returns {TicketCategory | undefined}
 */
function getCategoryById(id) {
  return ticketCategories.find((category) => category.id === id);
}

/**
 * @returns {TicketCategory[]}
 */
function getAllCategories() {
  return ticketCategories;
}

/**
 * @returns {string[]}
 */
function getRequiredEnvKeys() {
  return ticketCategories.map((category) => category.envKey);
}

/**
 * @param {string} channelName
 * @returns {TicketCategory | undefined}
 */
function getCategoryFromChannelName() {
  return undefined;
}

/**
 * @param {TicketCategory} category
 * @returns {string | undefined}
 */
function getCategoryDiscordId(category) {
  return process.env[category.envKey];
}

module.exports = {
  ticketCategories,
  getCategoryById,
  getAllCategories,
  getRequiredEnvKeys,
  getCategoryFromChannelName,
  getCategoryDiscordId,
};
