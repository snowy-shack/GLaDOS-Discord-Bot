const database = require("../database");
const skinForm = require("../functions/skinFormHandler");
const logs     = require("../logs");
const guild    = require("../guild");

async function getBoosters(phGuild) {
    await phGuild.members.fetch(); // Fetch and cache server members
  
    const boosterRoleID = process.env.BOOSTER_ROLE_ID;
    const boosterRole = await phGuild?.roles?.fetch(boosterRoleID); // Get Booster role
    const boosters = await boosterRole?.members.map(m=>m.user.id); // Get IDs of all Boosters
  
    return boosters;
}

async function incrementAndDM() {
    try {
        const client = await require("../client");

        phGuildId = process.env.GUILDID.toString();
        phGuild = await client.guilds.fetch(phGuildId);

        boosters = await getBoosters(phGuild);

        // Incrementing boosters
        let successes = 0;
        console.log("Updating boosting days for", boosters);

        for (const boosterId of boosters) {
            const result = await database.incBoostingDay(boosterId);
            if (result) successes++;
        }

    logs.logMessage(`✅ Incremented boosting days for ${successes} members.`);

        // Form DM'ing
        boosted = await database.getBoosted(90); // Get list of IDs that have boosted 3 months

        for (let i = 0; i < boosted.length; i++) {
            targetBooster = await phGuild.members.fetch(boosted[i]);
            console.log(
                targetBooster.user.username,
                "has boosted for 90 days, DMing them!");

            skinForm.sendFormMessage(targetBooster, -1, "");
        }

    } catch (error) {
        logs.logError(error);
    }
}

async function replyToDM(message) {
    const client = await require("../client");

    // Booster skin form handling
    message.channel.messages.fetch({ limit: 10 }).then(async scanMessages => {
    previousField = -1;

    // Goes from top to bottom to get the latest values
    scanMessages.reverse().forEach(scannedMessage => {
        try {
            footerText = (typeof scannedMessage.embeds[0] != 'undefined') ? scannedMessage.embeds[0].footer.text : '';
            if (scannedMessage.author.id == client.application.id) {

                const fieldIndex = parseInt(footerText.split(' ')[1].split('/')[0]) || 3;
                previousField = Math.min(fieldIndex, 3);
                try {
                    const match = /UUID: (.+?)\`/.exec(scannedMessage.embeds[1].description);
                    uuidGot = match ? match[1] : null;
                } catch (error) {};
            } else {fieldValue = scannedMessage.content}
        } catch (error) { console.error(error) };
        })
        
        if (previousField == 2 && fieldValue == 'confirm') {

            // update database here
            await database.addGunSkin(uuidGot, "booster");
            logs.logMessage(`💎 Added booster skin to uuid '${uuidGot}' \`<@${message.author.id}>\`.`);

            previousField == -2; //Throw error message
        }

        formMessageEmbeds = await skinForm.respond(previousField, fieldValue.toLowerCase(), 'booster');
        if (typeof formMessageEmbeds != 'undefined') message.author.send({ embeds: formMessageEmbeds });
    })
}

module.exports = { incrementAndDM, replyToDM, getBoosters };
