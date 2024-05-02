async function react(interaction) {
  await interaction.reply('> `💀 Shutting down`');
  console.log('Shutting down after command request');
  process.exit();
}

module.exports = { react };