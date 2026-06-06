const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { isAdmin } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Kirim pesan embed kustom ke channel ini')
    .addStringOption((option) =>
      option
        .setName('title')
        .setDescription('Judul embed')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('Isi/deskripsi embed')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        content: '❌ Command ini hanya dapat digunakan oleh Admin.',
        ephemeral: true,
      });
    }

    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);

    const customEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: `Dikirim oleh ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({
      content: '✅ Embed berhasil dikirim.',
      ephemeral: true,
    });

    await interaction.channel.send({
      embeds: [customEmbed],
    });
  },
};
