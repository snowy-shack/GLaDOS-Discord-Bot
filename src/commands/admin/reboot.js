const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logs = require('../../logs');

function init() {
  return new SlashCommandBuilder().setName('reboot')
    .setDescription('Reboots GLaDOS')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply('> `💀 Shutting down`');
  await logs.logMessage('> `💀 Attempting to restart`')
  console.log('Shutting down after command request');
  process.exit();
}

module.exports = { react, init };