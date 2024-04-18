const phGuild = require("./guild");

async function logMessage(message) {
  logChannel = await phGuild.channels.fetch(process.env.LOG_CHANNEL_ID.toString());
  logChannel.send(`> \`` + message + `\``
  ); 
}

async function directReply(message, response) {
  message.reply(`> \`` + response.replace(/\n/g, " ") + `\``);
}
module.exports = { 
  logMessage, 
  directReply 
};