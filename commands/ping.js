const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
          .setName('ping')
          .setDescription('বট latency পরীক্ষা করুন'),
  async executeSlash(interaction) {
    const sent = await interaction.reply({ content: '🏓 পিং...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    interaction.editReply(`🏓 Pong! Latency **${latency} ms**`);
  },
  async executePrefix(message) {
    const sent = await message.channel.send('🏓 পিং...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`🏓 Pong! Latency **${latency} ms**`);
  }
};
