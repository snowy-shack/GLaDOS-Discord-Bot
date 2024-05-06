const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const daily = require("./events/daily");

function init() {
  return new SlashCommandBuilder().setName('increment_boosters')
    .setDescription('Increments boosting days of all boosters in the DB')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply('> `➕ Incrementing boosters`');
  console.log('Manually incrementing boosters');
  daily.run();
}

module.exports = { react, init };