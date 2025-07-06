require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.prefix = '!';

// কমান্ড ফোল্ডার থেকে লোড
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  if (command.aliases) {
    command.aliases.forEach(alias => client.commands.set(alias, command));
  }
}

// বট অনলাইন লগ
client.once(Events.ClientReady, () => {
  console.log(`🟢 Bot is online as ${client.user.tag}`);
});

// স্লাশ কমান্ড হ্যান্ডলার
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.executeSlash(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '⚠️ কমান্ড চালাতে সমস্যা হয়েছে!', ephemeral: true });
  }
});

// প্রিফিক্স কমান্ড হ্যান্ডলার
client.on(Events.MessageCreate, async message => {
  if (!message.content.startsWith(client.prefix) || message.author.bot) return;
  const args = message.content.slice(client.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command || !command.executePrefix) return;
  try {
    await command.executePrefix(message, args);
  } catch (error) {
    console.error(error);
    message.reply('⚠️ Prefix কমান্ড চালাতে সমস্যা হয়েছে!');
  }
});

client.login(process.env.BOT_TOKEN.trim());
