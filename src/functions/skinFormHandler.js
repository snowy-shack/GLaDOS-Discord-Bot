const { EmbedBuilder } = require("discord.js");
const minecraft = require("../commands/minecraft");

const emojis = {
  booster: process.env.EMOJI_BOOSTER,
  donator: process.env.EMOJI_SUPPORTER
}

const messages = {
  booster: `It seems like you've**${emojis.booster}boosted** Phanty's Home for **3 months**! Thank you so much!`,
  translator: `It seems like you've**${emojis.booster}boosted** Phanty's Home for **3 months**! Thank you so much!`
}

async function respond(previousField, fieldValue, type) {
  const formTitle = { name: "PortalMod Portal Gun skin form", iconURL: 'https://portalmod.net/images/logo/mark.png' };
  const form_1 = new EmbedBuilder().setColor("b068a8")
	.setAuthor(formTitle)
  .setDescription(
    `Hi!
    
    ${messages[type]}
    
    In order to apply your Portal Gun skin to your Minecraft account, we need your Minecraft username. **Please send your username in plain text below**.`
  )
  .setFooter({text: `field 1/2 • skin.${type}`})
  .setTimestamp();

  if (previousField == -1) {
    return form_1; // Send first form message if there hasn't been prior form messages.

  } else if (previousField == 1) {

    uuid = (await minecraft.getUuid(fieldValue))[0];
    username = (await minecraft.getUuid(fieldValue))[1];

    // console.log(uuid);
    if (!(/^\w+$/.test(fieldValue)) || !(2 < fieldValue.length < 17)) {
      const form_1_error_1 = new EmbedBuilder().setColor("db4b4b")
        .setAuthor(formTitle)
        .setDescription("I didn't quite catch that. Please enter your Minecraft: Java Edition username in plain text.")
        .setFooter({text: `field 1/2 • skin.${type} • syntax error`})
        .setTimestamp();
      return [form_1_error_1];

    } else if (typeof uuid !== "undefined") {
      const link = await minecraft.getSkin(uuid);
      // console.log(link);
      const form_2 = new EmbedBuilder().setColor("b068a8")
        .setAuthor(formTitle)
        .setDescription(
          `Great! Please confirm that the Minecraft account below is your account by sending '**confirm**'. Otherwise send '**change**' to change it.`
        )
        .setFooter({text: `field 2/2 • skin.${type}`})
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
        .setAuthor(formTitle)
        .setDescription(`I **couldn't find a player** with the name **${fieldValue}**. Please make sure you've spelled it correctly and it's a Minecraft: Java Edition account.`)
        .setFooter({text: `field 1/2 • skin.${type} • not found`})
        .setTimestamp();
      return [form_1_error_2];
    }
  } else if (previousField == 2) {
    if (fieldValue == "confirm") {
      const form_3 = new EmbedBuilder().setColor("b068a8")
        .setAuthor(formTitle)
        // .setThumbnail(link)
        .setDescription(
          `Perfect! A Booster portal gun skin has been linked to this Minecraft account. Thank you for your support!!`
        )
        .setFooter({text: "form complete"})
        .setTimestamp();
      return [form_3];
      
    } else if (fieldValue == "change") {
      const form_2_reset = new EmbedBuilder().setColor("b068a8")
        .setAuthor(formTitle)
        .setDescription("Alright, what is the username of the account you would like to change it to?")
        .setFooter({text: `field 1/2 • skin.${type} • reset`})
        .setTimestamp();
      return [form_2_reset];

    } else {
      const form_2_error_1 = new EmbedBuilder().setColor("db4b4b")
        .setAuthor(formTitle)
        .setDescription(`I don't understand that answer. Please reply with either '**confirm**' or '**change**' to confirm or change your submitted username.`)
        .setFooter({text: `field 2/2 • skin.${type} • syntax error`})
        .setTimestamp();
      return [form_2_error_1];
    }
  }
}

async function sendFormMessage(targetUser, previousField, fieldValue) {
  targetUser.send({ embeds: [await this.respond(previousField, fieldValue, 'booster') ] });
}
module.exports = { respond, sendFormMessage };