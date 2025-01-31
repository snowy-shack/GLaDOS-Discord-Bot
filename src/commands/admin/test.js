const client = require("../../client");
const birthdayHandler = require("../../functions/birthdayHandler");

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function init() {
  return new SlashCommandBuilder().setName('test')
  .setDescription('TEST COMMAND')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply({content: 'Test ran'});
  birthdayHandler.checkBirthdays();
}

module.exports = { react, init };