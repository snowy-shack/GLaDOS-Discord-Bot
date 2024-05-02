const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const cron = require("node-cron");

const logs = require("./logs");
const messageHandler = require("./functions/messageHandler");
const dmMessageHandler = require("./functions/dmMessageHandler");
const interactionHandler = require("./functions/interactionHandler");
const daily = require("./events/daily");

const onReady = require("./events/ready");
const registerSlashCommands = require("./registerSlashCommands");
const prefix = 'ph!';

registerSlashCommands.register();

(async () => {
  const client = await require("./client");
  client.once(onReady.name, (...args) => onReady.execute(...args));

  client.on("messageCreate", async (message) => { // DM messages
    try {
      if (message.author.bot || message.guild) return; // Ensure the bot doesn't reply to bots, or server messages
      messageHandler.handleMessage(prefix, message);
    } catch (error) {
      logs.logError(error);
    }
  });
  
  client.on('interactionCreate', async interaction => { // Slash commands
    try {
      if (!interaction.isCommand()) return;
      interactionHandler.reply(interaction);
    } catch (error) {
      logs.logError(error);
    }
  });

})();

// daily.run(client);

// Increment the boosting value of all boosters everyday at 12 PM CEST
cron.schedule(
  "00 00 12 * * 0-6",
  () => {
    daily.run(client);
  },
  {
    timezone: "Europe/Amsterdam",
  }
);

// const start = new SlashCommandBuilder()
// 	.setName('ban')
// 	.setDescription('Select a member and ban them.')
// 	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
// 	.setDMPermission(false);

// const search = await guild.members.search({ query: 'username' });