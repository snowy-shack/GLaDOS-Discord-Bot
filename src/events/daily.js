const database = require("../database");
const skinForm = require("../functions/skinFormHandler");
const trackBoosters = require("../functions/trackBoosters");

async function run(client) {
  phGuildId = (process.env.GUILDID).toString();
  phGuild = await client.guilds.fetch(phGuildId);

  boosters = await trackBoosters.getBoosters(client, phGuild);

  boosters.forEach((boosterId) => {
    database.incBoostingDay(boosterId);
  });

  logs.logMessage(`✅ Updated database for ${boosters.length} boosters.`);

  boosted = await database.getBoosted();
  for(let i = 0; i < boosted.length; i++) {
    console.log(boosted[i])

    targetBooster = await phGuild.members.fetch(boosted[i]);
    skinForm.sendFormMessage(targetBooster, -1, '');
  }
}
module.exports = { run };