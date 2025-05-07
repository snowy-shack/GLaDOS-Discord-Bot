import * as skinForm from "#src/functions/skinFormHandler.mjs";
import * as logs from "#src/modules/logs.mjs";
import {getMember, getRoleUsers} from "#src/modules/discord.mjs";
import {flags, getUserData, setFlag} from "#src/agents/flagAgent.mjs";
import {delayInSeconds} from "#src/modules/util.mjs";
import {gun_skins} from "#src/consts/gun_skins.mts";
import {roles} from "#src/consts/phantys_home.mjs";

export async function incrementAndDM() {
    try {
        // let phGuild = await getGuild();
        let boosters = await getRoleUsers(roles.Booster);

        // Incrementing boosters
        let successes = 0;
        console.log("Updating boosting days for", boosters);

        for (const boosterId of boosters) {
            let boosterData = await getUserData(boosterId);

            let boostingDays = boosterData[flags.Booster.BoostingDays] ?? 0;
            await setFlag(boosterId, flags.Booster.BoostingDays, boostingDays + 1);

            if (boostingDays + 1 >= 90 && !boosterData[flags.Booster.Messaged]) {
                finishedBoosting(boosterId);
            }

            successes++;
        }

        await logs.logMessage(`✅ Incremented boosting days for ${successes} members.`);

        // // Form DM'ing
        // const boosted = await database.getBoosted(90); // Get list of IDs that have boosted 3 months
        //
        // for (let i = 0; i < boosted.length; i++) {
        //     const targetBooster = await phGuild.members.fetch(boosted[i]);
        //     console.log(
        //         targetBooster.user.username,
        //         "has boosted for 90 days, DMing them!"
        //     );
        //
        //     await skinForm.sendFormMessage(targetBooster, 0);
        // }

    } catch (error) {
        await logs.logError("incrementing boosters", error);
    }
}

async function finishedBoosting(user_id) {
    await delayInSeconds(5);

    const targetUser = await getMember(user_id);

    await logs.logMessage(`😁${targetUser} has boosted for 90 days!`);

    await skinForm.sendFormMessage(targetUser, 0, undefined, gun_skins.Booster.id);
    await setFlag(targetUser.id, flags.Booster.Messaged);
}

export default { incrementAndDM };
