const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
          .setName('kick')
          .setDescription('একজন সদস্যকে kick করুন')
          .addUserOption(o => o.setName('target')
                               .setDescription('কাকে kick করবেন')
                               .setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async executeSlash(interaction) {
    const member = interaction.options.getMember('target');
    if (!member) return interaction.reply({ content: 'সদস্য পাওয়া যায়নি', ephemeral: true });
    try {
      await member.kick();
      interaction.reply(`👢 ${member.user.tag} কে kick করা হয়েছে`);
    } catch { interaction.reply({ content: '❌ Kick ব্যর্থ', ephemeral: true }); }
  },
  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers))
      return message.reply('❌ আপনার অনুমতি নেই!');
    const member = message.mentions.members.first();
    if (!member) return message.reply('কাকে kick করব তা মেনশন করুন');
    try {
      await member.kick();
      message.channel.send(`👢 ${member.user.tag} কে kick করা হয়েছে`);
    } catch { message.channel.send('❌ Kick ব্যর্থ'); }
  }
};
