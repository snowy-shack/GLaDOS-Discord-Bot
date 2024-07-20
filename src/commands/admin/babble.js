const client = require("../../client");

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const emojis = require("../../emojis");

function init() {
  return new SlashCommandBuilder().setName('babble')
  .setDescription('Be a good Genetic Lifeform')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName('message')
      .setDescription('The Message')
      .setRequired(true)
  );
}

async function react(interaction) {
  await interaction.reply({content: 'Speaking...', ephemeral: true});  // otherwise it will say "application did not respond"
  await interaction.deleteReply();
  (await client).channels.cache.get(interaction.channelId).send(interaction.options.getString('message'));
}

module.exports = { react, init };