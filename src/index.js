const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const cron = require("node-cron");

const logs = require("./logs");
const messageHandler = require("./functions/messageHandler");
const dmMessageHandler = require("./functions/dmMessageHandler");
const interactionHandler = require("./functions/interactionHandler");
const reactionHandler = require("./functions/reactionHandler");
const daily = require("./events/daily");

const onReady = require("./events/ready");
const registerSlashCommands = require("./registerSlashCommands");

const emojis = require("./emojis.js");

registerSlashCommands.register();

(async () => {
  const client = await require("./client");
  client.once(onReady.name, (...args) => onReady.execute(...args));

  client.on("messageCreate", async (message) => { // DM messages
    try {
      if (message.author.bot || message.guild) return; // Ensure the bot doesn't reply to bots, or server messages
      dmMessageHandler.handleDM(message);
    } catch (error) {
      logs.logError(error);
    }
  });

  reactionChannels = [
    '1235600733093761156', // Dev announcements
    '1235600701602791455', // Dev art

    '878221699844309033', // #News
    '876132326101360670', // #Announcements
    '981527027142262824' // #Art
  ]

  client.on("messageCreate", async (message) => { // Reactions
    if (!message.author.bot && message.guild && reactionChannels.includes(message.channelId)) reactionHandler.react(message);
  });

  // const { EmbedBuilder } = require("discord.js");

  // const testEmbed = new EmbedBuilder().setColor("edaf37")
	// .setAuthor({ name: "PortalMod donation notification", iconURL: 'https://portalmod.net/images/logo/mark.png' })
  // .setDescription(
  //   `**Thank you so much for your donation, \${username}!** We've linked your Portal Gun skins to your Minecraft account.
    
  //   You have also been given the **${emojis.supporter}Supporter** role in **Phanty's Home**, which grants you access to <#1005103628882804776>, where you can check out exclusive updates on PortalMod!`
  // )
  // .setFooter({text: `Automated message`})
  // .setTimestamp();

  client.on('interactionCreate', async interaction => { // Slash commands
    try {
      if (!interaction.isCommand()) return;
      interactionHandler.reply(interaction);
      // interaction.reply({ embeds: [testEmbed] });
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