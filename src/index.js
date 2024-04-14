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

const database = require("./database.js");
const minecraft = require("./commands/minecraft");

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
})();

// EMOJIS:
const emSupporter = process.env.EMOJI_SUPPORTER
const emBooster   = process.env.EMOJI_BOOSTER

async function formHandler(previousField, fieldValue) {
  const formTitle = "PortalMod Booster skin form";
  const form_1 = new EmbedBuilder().setColor("b068a8")
  // .setAuthor({ name: username, iconURL: link, url: `https://namemc.com/${username}` })
  .setTitle(formTitle)
  .setDescription(
    `Hi!
    
    It seems like you've**${emBooster}boosted** Phanty's Home for **3 months**! Thank you so much!
    
    In order to apply your Portal Gun skin to your Minecraft account, we need your Minecraft username. **Please send your username in plain text below**.`
  )
  .setFooter({text: "field 1/2"})
  .setTimestamp();

  if (previousField == -1) {
    return form_1; // Send first form message if there hasn't been prior form messages.

  } else if (previousField == 1) {

    uuid = (await minecraft.getUuid(fieldValue))[0];
    username = (await minecraft.getUuid(fieldValue))[1];

    // console.log(uuid);
    if (!(/^\w+$/.test(fieldValue)) || !(2 < fieldValue.length < 17)) {
      const form_1_error_1 = new EmbedBuilder().setColor("db4b4b")
        .setTitle(formTitle)
        .setDescription("I didn't quite catch that. Please enter your Minecraft: Java Edition username in plain text.")
        .setFooter({text: "field 1/2 - syntax error"})
        .setTimestamp();
      return [form_1_error_1];

    } else if (typeof uuid !== "undefined") {
      const link = await minecraft.getSkin(uuid);
      // console.log(link);
      const form_2 = new EmbedBuilder().setColor("b068a8")
        .setTitle(formTitle)
        .setDescription(
          `Great! Please confirm that the Minecraft account below is your account by sending '**confirm**'. Otherwise send '**change**' to change it.`
        )
        .setFooter({text: "field 2/2"})
        .setTimestamp();
      const form_profile = new EmbedBuilder().setColor("d9b69e")
        .setThumbnail(link)
        .setDescription(
          `# ${username}
          (\`UUID: ${uuid}\`)`
        );

      return [form_2, form_profile];
    } else {
      const form_1_error_2 = new EmbedBuilder().setColor("db4b4b")
        .setTitle(formTitle)
        .setDescription(`I **couldn't find a player** with the name **${fieldValue}**. Please make sure you've spelled it correctly and it's a Minecraft: Java Edition account.`)
        .setFooter({text: "field 1/2 - not found"})
        .setTimestamp();
      return [form_1_error_2];
    }
  } else if (previousField == 2) {
    if (fieldValue == "confirm") {
      const form_3 = new EmbedBuilder().setColor("b068a8")
        .setTitle(formTitle)
        // .setThumbnail(link)
        .setDescription(
          `Perfect! A Booster portal gun skin has been linked to this Minecraft account. Thank you for your support!!`
        )
        .setFooter({text: "form complete"})
        .setTimestamp();
      return [form_3];
      
    } else if (fieldValue == "change") {
      const form_2_reset = new EmbedBuilder().setColor("b068a8")
        .setTitle(formTitle)
        .setDescription("Alright, what is the username of the account you would like to change it to?")
        .setFooter({text: "field 1/2 - reset"})
        .setTimestamp();
      return [form_2_reset];

    } else {
      const form_2_error_1 = new EmbedBuilder().setColor("db4b4b")
        .setTitle(formTitle)
        .setDescription(`I don't understand that answer. Please reply with either '**confirm**' or '**change**' to confirm or change your submitted username.`)
        .setFooter({text: "field 2/2 - syntax error"})
        .setTimestamp();
      return [form_2_error_1];
    }
  }
}

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

        logChannel.send(
          `> \`💎 Added booster skin to uuid '${uuidGot}'.\``
        );

        previousField == -2; //Throw error message
      }

      formMessageEmbeds = await formHandler(previousField, fieldValue.toLowerCase());
      if (typeof formMessageEmbeds != 'undefined') {
        message.author.send({ embeds: formMessageEmbeds });
      }
    })
  }

  if (message.content == 'sf') {
    message.author.send({ embeds: [await formHandler(-1, '') ] });
    
    logChannel.send(
      `> \`❓ Asking \`<@${message.author.id}>\` about their Minecraft UUID.\``
    );
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

      const logChannel = await phGuild.channels.fetch("1223785821157462086");
      logChannel.send(
        `> \`✅ Updated database for ${boosters.length} boosters.\``
      );
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