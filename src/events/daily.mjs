import boosterHandler from "#src/functions/boosterHandler.mjs";
import birthdayHandler from "#src/functions/birthdayHandler.mjs";
import * as logs from "#src/modules/logs.mjs";

async function run() {
    try {
        boosterHandler.incrementAndDM();
        await birthdayHandler.checkBirthdays();
    } catch (error) {
        await logs.logError("Error running daily events", error);
    }
}

export default { run };