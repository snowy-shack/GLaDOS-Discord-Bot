const { exec } = require('child_process');

async function react(interaction) {
  await interaction.reply('> `🪢 Pulling`');
  console.log('Attempting to GIT pull');

  // exec('');
}

module.exports = { react };