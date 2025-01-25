const { SlashCommandBuilder } = require('discord.js');

function init() {
  return new SlashCommandBuilder().setName('ping')
  .setDescription('Ping GLaDOS');
}

async function react(interaction) {
  await interaction.reply(logs.formatMessage(`🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms`));
}

module.exports = { react, init };