async function getBoosters(client, phGuild) {
  await phGuild.members.fetch(); // Fetch and cache server members

  const boosterRoleID = '852838462469308428';
  const boosterRole = await phGuild.roles.fetch(boosterRoleID); // Get Booster role
  const boosters = await boosterRole.members.map(m=>m.user.id); // Get IDs of all Boosters

  return boosters;
}

module.exports = {
  getBoosters
};