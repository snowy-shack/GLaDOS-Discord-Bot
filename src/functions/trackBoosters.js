async function getBoosters(client) {

const phGuildID = '704266427577663548';
const phGuild = client.guilds.cache.get(phGuildID); // Get Phanty's Home server

await phGuild.members.fetch(); // Fetch and cache server members

const boosterRoleID = '852838462469308428';
const boosterRole = phGuild.roles.cache.get(boosterRoleID); // Get Booster role
const boosters = boosterRole.members.map(m=>m.user.id); // Get IDs of all Boosters

return boosters;
}

module.exports = {
  getBoosters
};