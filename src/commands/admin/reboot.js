const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function init() {
  return new SlashCommandBuilder().setName('reboot')
    .setDescription('Reboots GLaDOS')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply('> `💀 Shutting down`');
  console.log('Shutting down after command request');
  process.exit();
}

module.exports = { react, init };