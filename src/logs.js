async function logMessage(message) {
  const phGuild = await require("./guild");
  logChannel = await phGuild.channels.fetch(process.env.LOG_CHANNEL_ID.toString());
  logChannel.send(`> \`` + message + `\``
  );
}

async function directReply(message, response) {
  message.reply(`> **\`` + response.replace(/\n/g, " ") + `\`**`);
}

module.exports = { 
  logMessage, 
  directReply 
};