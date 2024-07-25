const database = require("../database");
const skinForm = require("../functions/skinFormHandler");
const trackBoosters = require("../functions/trackBoosters");
const logs = require("../logs");

async function run() {
  const client = await require("../client");

  phGuildId = (process.env.GUILDID).toString();
  phGuild = await client.guilds.fetch(phGuildId);

  boosters = await trackBoosters.getBoosters(client, phGuild);

  console.log('updating boosting days for', boosters)
  boosters.forEach((boosterId) => {
    database.incBoostingDay(boosterId);
  });

  logs.logMessage(`✅ Updated database for ${boosters.length} boosters.`);

  boosted = await database.getBoosted(90); // Get list of IDs that have boosted 3 months
  
  for(let i = 0; i < boosted.length; i++) {    
    targetBooster = await phGuild.members.fetch(boosted[i]);
    console.log(targetBooster.user.username, "has boosted for 90 days, DMing them!");

    skinForm.sendFormMessage(targetBooster, -1, '');
  }
}
module.exports = { run };