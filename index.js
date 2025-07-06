require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs   = require('node:fs');
const path = require('node:path');

//----------------------------------------------------------
// 1️⃣  BOT_TOKEN স্যানিটাইজ + ভ্যালিডেশান
//----------------------------------------------------------
const rawToken = process.env.BOT_TOKEN ?? '';
const token   = rawToken.trim();                // পিছনে‑সামনে \n/স্পেস কাটে

if (!/^[\w-]{23,29}\.[\w-]{6}\.[\w-]{27}$/u.test(token)) {
  console.error('❌  BOT_TOKEN malformed — Developer Portal থেকে নতুন টোকেন কপি‑পেস্ট করুন (কোটেশন, newline, "Bot " ছাড়াই)।');
  process.exit(1);
}

//----------------------------------------------------------
// 2️⃣  Client তৈরি — Intents + Partials
//----------------------------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,  // prefix কমান্ডের জন্য
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

client.prefix   = '!';
client.commands = new Collection();

//----------------------------------------------------------
// 3️⃣  ./commands/ ফোল্ডার থেকে সব কমান্ড লোড
//----------------------------------------------------------
const commandsDir = path.join(__dirname, 'commands');
fs.readdirSync(commandsDir)
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const cmd = require(path.join(commandsDir, file));
    if (cmd.data?.name) client.commands.set(cmd.data.name, cmd);
    if (Array.isArray(cmd.aliases)) cmd.aliases.forEach(a => client.commands.set(a, cmd));
  });

//----------------------------------------------------------
// 4️⃣  Ready লগ
//----------------------------------------------------------
client.once('ready', () => {
  console.log(`🟢  Bot online as ${client.user.tag}`);
});

//----------------------------------------------------------
// 5️⃣  Slash কমান্ড হ্যান্ডলার
//----------------------------------------------------------
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd || typeof cmd.executeSlash !== 'function') return;
  try {
    await cmd.executeSlash(interaction, client);
  } catch (err) {
    console.error(err);
    const replyData = { content: '⚠️  কমান্ড চালাতে গিয়ে সমস্যা হল!', ephemeral: true };
    if (interaction.deferred || interaction.replied) interaction.followUp(replyData);
    else interaction.reply(replyData);
  }
});

//----------------------------------------------------------
// 6️⃣  Prefix ("!") কমান্ড হ্যান্ডলার
//----------------------------------------------------------
client.on('messageCreate', async msg => {
  if (msg.author.bot || !msg.guild) return;
  if (!msg.content.startsWith(client.prefix)) return;

  const args = msg.content.slice(client.prefix.length).trim().split(/ +/);
  const name = args.shift()?.toLowerCase();
  if (!name) return;

  const cmd = client.commands.get(name);
  if (!cmd || typeof cmd.executePrefix !== 'function') return;

  try {
    await cmd.executePrefix(msg, args, client);
  } catch (err) {
    console.error(err);
    msg.reply('⚠️  কমান্ড চালাতে গিয়ে সমস্যা হল!');
  }
});

//----------------------------------------------------------
// 7️⃣  Global error handlers
//----------------------------------------------------------
client.on('error', console.error);
client.on('shardError', console.error);
process.on('unhandledRejection', console.error);

//----------------------------------------------------------
// 8️⃣  Login & go!
//----------------------------------------------------------
client.login(token);
