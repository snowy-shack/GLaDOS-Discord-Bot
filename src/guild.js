async function getGuild() {
    const client = await require("./client");

    const phGuildId = (process.env.GUILDID).toString();
    const phGuild = await client.guilds.fetch(phGuildId); // Get Phanty's Home server
    return phGuild;
}

module.exports = getGuild();