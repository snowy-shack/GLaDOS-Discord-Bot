import * as skinForm from "#src/modules/skinFormHandler.mts";
import * as logs from "#src/core/logs.mts";
import {getMember, getRoleUsers} from "#src/core/discord.mts";
import {userFields, getUserData, setUserField} from "#src/modules/localStorage.mts";
import {delayInSeconds} from "#src/core/util.mts";
import { roles } from "#src/core/phantys_home.mts";
import { toError } from "#src/core/try-catch.mts";
import chalk from "chalk";
import {KNOWN_SKINS} from "#src/modules/portalGunSkinLoader.mts";

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
            let boosterData = getUserData(boosterId);

            let boostingDays = boosterData[userFields.Booster.BoostingDays] ?? 0;
            await setUserField(boosterId, userFields.Booster.BoostingDays, boostingDays + 1);

            if (boostingDays + 1 >= 90 && !boosterData[userFields.Booster.Messaged]) {
                void finishedBoosting(boosterId);
            }

            successes++;
        }

        await logs.logMessage(`✅ Incremented boosting days for ${successes} members.`);

    } catch (error: unknown) {
        await logs.logError("incrementing boosters", toError(error));
    }
}

async function finishedBoosting(user_id: string) {
    await delayInSeconds(5);

    const targetUser = await getMember(user_id);
    if (!targetUser) return;

    await logs.logMessage(`😁${targetUser} has boosted for 90 days!`);

    await skinForm.sendFormMessage(targetUser.user, 0, undefined, KNOWN_SKINS.Booster);
    await setUserField(targetUser.id, userFields.Booster.Messaged);
}

export default { incrementAndDM };
