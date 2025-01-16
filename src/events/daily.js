const database = require("../database");
const skinForm = require("../functions/skinFormHandler");
const trackBoosters = require("../functions/trackBoosters");
const logs = require("../logs");

async function run() {
  try {
    const client = await require("../client");

    phGuildId = (process.env.GUILDID).toString();
    phGuild = await client.guilds.fetch(phGuildId);

    boosters = await trackBoosters.getBoosters(client, phGuild);

    // Incrementing
    let successes = 0;
    console.log('Updating boosting days for', boosters);

    for (const boosterId of boosters) {
      const result = await database.incBoostingDay(boosterId);
      if (result) successes++;
    }

    logs.logMessage(`✅ Incremented boosting days for ${successes} members.`);

    // Form DM'ing
    boosted = await database.getBoosted(90); // Get list of IDs that have boosted 3 months
    
    for(let i = 0; i < boosted.length; i++) {    
      targetBooster = await phGuild.members.fetch(boosted[i]);
      console.log(targetBooster.user.username, "has boosted for 90 days, DMing them!");

      skinForm.sendFormMessage(targetBooster, -1, '');
    }
  } catch (error) {
    logs.logError(error);
  }
}
module.exports = { run };