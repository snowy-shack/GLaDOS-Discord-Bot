async function getGuild() {
    const client = await require("./client");

    const phGuildId = (process.env.GUILDID).toString();
    const guild = await client.guilds.fetch(phGuildId); // Get Phanty's Home server
    return guild;
}

async function getUser(id) {
    const guild = await await getGuild();
    return await guild.members.fetch(id);
}

async function getChannel(id) {
    const guild = await await getGuild();
    return await guild.channels.fetch(id);
}

module.exports = { getGuild, getUser, getChannel };