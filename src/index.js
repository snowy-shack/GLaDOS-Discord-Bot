const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  Permissions,
  Embed,
  TextInputStyle,
  Partials
} = require("discord.js");
const fs = require("fs");
const cron = require("node-cron");
import("node-fetch");

const database = require("./database");
const logs = require("./logs");
const minecraft = require("./commands/minecraft");
const boosterForm = require("./functions/boosterFormHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel
  ]
});
client.login(process.env.TOKEN);
const onReady = require("./events/ready");
client.once(onReady.name, (...args) => onReady.execute(...args));

let phGuild;
(async () => {
  phGuildId = (process.env.GUILDID).toString();
  phGuild = await client.guilds.fetch(phGuildId); // Get Phanty's Home server
  logChannel = await phGuild.channels.fetch(process.env.LOG_CHANNEL_ID.toString());

  // remove
  // console.log(await database.getBoosted());

  boosted = await database.getBoosted();
  for(let i = 0; i < boosted.length; i++) {
    console.log(boosted[i])

    targetBooster = await phGuild.members.fetch(boosted[i]);
    boosterForm.sendFormMessage(targetBooster, -1, '');
  }
})();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ensure the bot doesn't reply to itself (or automated bot messages)

  var isDm = !message.guild; 
  console.log("isDm: ", isDm);

  if (isDm) {
    message.channel.messages.fetch({ limit: 10 }).then(async scanMessages => {
      previousField = -1;
      scanMessages.reverse().forEach(scannedMessage => {
        try {
          footerText = (typeof scannedMessage.embeds[0] != 'undefined') ? scannedMessage.embeds[0].footer.text : '';
          if (scannedMessage.author.id == client.application.id) {

            const fieldIndex = parseInt(footerText.split(' ')[1].split('/')[0]) || 3;
            previousField = Math.min(fieldIndex, 3);
            try {
              const match = /UUID: (.+?)\`/.exec(scannedMessage.embeds[1].description);
              uuidGot = match ? match[1] : null;
            } catch (error) {};
            
          } else {fieldValue = scannedMessage.content}
        } catch (error) { console.log(error) };
      })
      console.log('previousField: ', previousField, 'fieldValue: ', fieldValue)
      if (previousField == 2 && fieldValue == 'confirm') {

        // update database here

        logs.logMessage(`💎 Added booster skin to uuid '${uuidGot}'.`);

        previousField == -2; //Throw error message
      }

      formMessageEmbeds = await boosterForm.respond(previousField, fieldValue.toLowerCase());
      if (typeof formMessageEmbeds != 'undefined') {
        // boosterForm.sendFormMessage(message.author, previousField, fieldValue.toLowerCase());
        message.author.send({ embeds: formMessageEmbeds });
      }
    })
  }

  if (message.content == 'sf') {
    // message.author.send({ embeds: [await boosterForm.respond(-1, '') ] });
    boosterForm.sendFormMessage(message.author, -1, '');
    
    logs.logMessage(`❓ Asking \`<@${message.author.id}>\` about their Minecraft UUID.`);
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("gl.dmUser")) {
    targetUser = await phGuild.members.fetch("382524802491219969");
    targetUser.send("test");
  }
});

client.on("messageCreate", async (message) => {
  if (message.content == "gl.ping") {
    message.reply("pong!");
  }
});

// Increment the boosting value of all boosters everyday at 12 PM CEST
cron.schedule(
  "00 00 12 * * 0-6",
  () => {
    (async () => {
      const phGuildId = "704266427577663548";
      const phGuild = await client.guilds.fetch(phGuildId); // Get Phanty's Home server

      const trackBoosters = require("./functions/trackBoosters");
      boosters = await trackBoosters.getBoosters(client, phGuild);

      boosters.forEach((boosterId) => {
        database.incBoostingDay(boosterId);
      });

      // get boosted
    })();
  },
  {
    timezone: "Europe/Amsterdam",
  }
);

const start = new SlashCommandBuilder()
	.setName('ban')
	.setDescription('Select a member and ban them.')
	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
	.setDMPermission(false);