const database = require("../database");
const boosterForm = require("../functions/boosterFormHandler");
const trackBoosters = require("../functions/trackBoosters");

async function run(client) {
  phGuildId = (process.env.GUILDID).toString();
  phGuild = await client.guilds.fetch(phGuildId);

  boosters = await trackBoosters.getBoosters(client, phGuild);

  boosters.forEach((boosterId) => {
    database.incBoostingDay(boosterId);
  });

  boosted = await database.getBoosted();
  for(let i = 0; i < boosted.length; i++) {
    console.log(boosted[i])

    targetBooster = await phGuild.members.fetch(boosted[i]);
    boosterForm.sendFormMessage(targetBooster, -1, '');
  }
}
module.exports = { run };