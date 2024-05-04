const { exec } = require('child_process');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function init() {
  return new SlashCommandBuilder().setName('git_pull')
  .setDescription('Pulls the latest version of GLaDOS')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply('> `🪢 Pulling`');
  console.log('Attempting to GIT pull');

  // exec('git pull origin master');
}

module.exports = { react, init };