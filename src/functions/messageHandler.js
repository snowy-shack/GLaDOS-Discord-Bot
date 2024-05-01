const skinForm = require("./skinFormHandler");
const client = require("../client");
const logs = require("../logs");

const { PermissionFlagsBits } = require("discord.js");

function isAdmin(message) {
  return message.member.permissionsIn(message.channel).has(PermissionFlagsBits.adm);
}

async function handleMessage(prefix, message) {
  const phGuild = await require("../guild");

  if (message.content.startsWith(prefix + 'formDM ') && isAdmin(message)) {
    // message.author.send({ embeds: [await skinForm.respond(-1, '') ] });
    try {
      targetUser = await phGuild.members.fetch(message.content.split(' ')[1]);
      skinForm.sendFormMessage(targetUser, -1, '');
      
      logs.logMessage(`❓ Asking \`<@${message.author.id}>\` about their Minecraft UUID.`);
    } catch (error) {
      logs.directReply(message, `❌ An error occured: ${error}`)
    }
  }
}

module.exports = { handleMessage }