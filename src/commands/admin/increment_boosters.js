const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const boosterHandler = require("../../functions/boosterHandler");
const logs  = require("../../logs");

function init() {
  return new SlashCommandBuilder().setName('increment_boosters')
    .setDescription('Increments boosting days of all boosters in the DB')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply(logs.formatMessage('➕ Incrementing boosters'));
  console.log('Manually incrementing boosters');
  boosterHandler.incrementAndDM();
}

module.exports = { react, init };