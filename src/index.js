const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PermissionFlagsBits } = require("discord.js");

const cron = require("node-cron");

const logs = require("./logs");
const boosterForm = require("./functions/boosterFormHandler");
const messageHandler = require("./functions/messageHandler");
const dmMessageHandler = require("./functions/dmMessageHandler");
const daily = require("./events/daily");

const client = require("./client");
const onReady = require("./events/ready");
client.once(onReady.name, (...args) => onReady.execute(...args));
const prefix = 'ph!';

const phGuild = require("./guild");

function isAdmin(message) {
  return message.member.permissionsIn(message.channel).has(PermissionFlagsBits.adm);
}
// daily.run(client);

client.on("messageCreate", async (message) => {
  // try {
    if (message.author.bot) return; // Ensure the bot doesn't reply to itself (or automated bot messages)
    var isDm = !message.guild; 

    if (message.content == "ph!ping") {
      message.reply("pong!");
      return;
    }

    if (isDm) {
      console.log('oka')
      dmMessageHandler.handleDM(message);
    } else {
      console.log('oki')
      messageHandler.handleMessage(prefix, message);
    }

    if (message.content.startsWith('ph!formDM ') && isAdmin(message)) {
      // message.author.send({ embeds: [await boosterForm.respond(-1, '') ] });
      try {
        targetUser = await phGuild.members.fetch(message.content.split(' ')[1]);
        boosterForm.sendFormMessage(targetUser, -1, '');
        
        logs.logMessage(`❓ Asking \`<@${message.author.id}>\` about their Minecraft UUID.`);
      } catch (error) {
        logs.directReply(message, `❌ An error occured: ${error}`)
      }
    }
  // } catch (error) {
  //   logs.logMessage(`❌ An error occured: ${error}`);
  // }
});

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