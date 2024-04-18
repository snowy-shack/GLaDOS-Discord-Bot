async function logMessage(message) {
  logChannel.send(`> \`` + message + `\``
  ); //✅ Updated database for ${boosters.length} boosters.
}

async function directReply(message, response) {
  message.reply(`> \`` + response.replace(/\n/g, " ") + `\``);
}
module.exports = { 
  logMessage, 
  directReply 
};