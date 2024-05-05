const logs = require("../../logs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const emojis = require("../../emojis.js");

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function init() {
  return new SlashCommandBuilder().setName('refresh_rules')
  .setDescription('Refreshes the rules channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  const rulesJSON = require("../../rules.json");
  const client = await require("../../client");
  await interaction.reply(logs.formatMessage('🔄️ Updating rules'));
  logs.logMessage('🔄️ Updating rules');

  const channel = client.channels.cache.get(process.env.RULES_CHANNEL_ID);

  channel.messages.fetch({ limit: 100 }).then(async messageScan => {
    messageScan.forEach(async scannedMessage => {
      if (scannedMessage.author.id == client.application.id) { // If the message was sent by the bot
        scannedMessage.delete();
      }
    });
  });
  
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear().toString().substr(-2);
  
  const formattedDate = `${day}.${month}.${year}`;

  setTimeout(() => {
    channel.send(logs.formatMessage(`Last rules update: ${formattedDate}`))
    for (rule of rulesJSON) {
      channel.send(`# ${emojis.home} ` + rule.title + '\n> ' + rule.description + '\n** **');
    }
  }, 5000);
}

module.exports = { react, init };