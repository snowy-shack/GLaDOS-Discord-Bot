import * as skinForm from "#src/modules/skinFormHandler.mts";
import * as logs from "#src/core/logs.mts";
import {getMember, getRoleUsers} from "#src/core/discord.mts";
import {flags, getUserData, setFlag} from "#src/modules/localStorage.mts";
import {delayInSeconds} from "#src/core/util.mts";
import {gun_skins} from "#src/consts/gun_skins.mts";
import {roles} from "#src/core/phantys_home.mts";
import chalk from "chalk";

export async function incrementAndDM() {
    try {
        // let phGuild = await getGuild();
        let boosters = await getRoleUsers(roles.Booster);
        if (!boosters) {
            await logs.logError("incrementAndDM", new Error("Boosters could not be fetched"));
            return;
        }

        // Incrementing boosters
        let successes = 0;
        console.log(chalk.yellowBright("Updating boosting days for", boosters));

        for (const boosterId of boosters) {
            let boosterData = await getUserData(boosterId);

            let boostingDays = boosterData[flags.Booster.BoostingDays] ?? 0;
            await setFlag(boosterId, flags.Booster.BoostingDays, boostingDays + 1);

            if (boostingDays + 1 >= 90 && !boosterData[flags.Booster.Messaged]) {
                void finishedBoosting(boosterId);
            }

            successes++;
        }

        await logs.logMessage(`✅ Incremented boosting days for ${successes} members.`);

    } catch (error: any) {
        await logs.logError("incrementing boosters", error);
    }
}

async function finishedBoosting(user_id: string) {
    await delayInSeconds(5);

    const targetUser = await getMember(user_id);
    if (!targetUser) return;

    await logs.logMessage(`😁${targetUser} has boosted for 90 days!`);

    await skinForm.sendFormMessage(targetUser.user, 0, undefined, gun_skins.Booster.id);
    await setFlag(targetUser.id, flags.Booster.Messaged);
}

export default { incrementAndDM };
