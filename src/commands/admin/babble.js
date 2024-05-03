const client = require("../../client");

async function react(interaction) {
  await interaction.reply({content: 'Speaking...', ephemeral: true});  // otherwise it will say "application did not respond"
  await interaction.deleteReply();
  (await client).channels.cache.get(interaction.channelId).send(interaction.options.getString('message'));
}

module.exports = { react };