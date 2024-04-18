const client = require("./client");

async function getGuild() {
  phGuildId = (process.env.GUILDID).toString();
  phGuild = await client.guilds.fetch(phGuildId); // Get Phanty's Home server

  return phGuild; 
}

module.exports = { getGuild }