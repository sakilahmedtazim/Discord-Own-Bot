require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const cmdPath = path.join(__dirname, 'commands');
for (const f of fs.readdirSync(cmdPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(cmdPath, f));
  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Slash কমান্ড আপলোড হচ্ছে…');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // Global commands
      { body: commands }
    );
    console.log('✅ Slash কমান্ড আপলোড সম্পন্ন');
  } catch (err) { console.error(err); }
})();
