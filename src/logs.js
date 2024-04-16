async function logMessage(message) {
  logChannel.send(`> \`` + message + `\``
  ); //✅ Updated database for ${boosters.length} boosters.
}
module.exports = { logMessage };