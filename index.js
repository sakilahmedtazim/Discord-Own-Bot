require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,      // prefix কমান্ডের জন্য
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// prefix ও কমান্ড কোলেকশন
client.prefix = '!';
client.commands = new Collection();

// ── সমস্ত কমান্ড ফাইল লোড ──
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
}

// ── বট অন ──
client.once('ready', () => console.log(`✅ Logged in as ${client.user.tag}`));

// ── Slash কমান্ড এক্সিকিউশন ──
client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand()) return;
  const cmd = client.commands.get(i.commandName);
  if (!cmd) return;
  try { await cmd.executeSlash(i, client); }
  catch (err) {
    console.error(err);
    i.reply({ content: '⚠️ কমান্ডে ত্রুটি!', ephemeral: true });
  }
});

// ── Prefix কমান্ড এক্সিকিউশন ──
client.on('messageCreate', async msg => {
  if (msg.author.bot || !msg.guild) return;
  if (!msg.content.startsWith(client.prefix)) return;

  const args = msg.content.slice(client.prefix.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();
  const cmd = client.commands.get(name);
  if (!cmd || !cmd.executePrefix) return;

  try { await cmd.executePrefix(msg, args, client); }
  catch (err) {
    console.error(err);
    msg.reply('⚠️ কমান্ডে ত্রুটি!');
  }
});

client.login(process.env.BOT_TOKEN);
