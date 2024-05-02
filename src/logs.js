async function getLogChannel() {
  const phGuild = await require("./guild");
  return await phGuild.channels.fetch(process.env.LOG_CHANNEL_ID.toString());
}

async function logMessage(message) {
  const logChannel = await getLogChannel();
  logChannel.send('> **\`' + message + '\`**');
}

async function directReply(message, response) {
  message.reply(`> **\`` + response.replace(/\n/g, " ") + `\`**`);
}

async function logError(error) {
  const logChannel = await getLogChannel();
  logChannel.send(`> **\`❌ An error occured: ${error}\`**`);
}

module.exports = { 
  logMessage, 
  directReply,
  logError
};