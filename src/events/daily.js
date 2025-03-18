import boosterHandler from "#src/functions/boosterHandler";
import birthdayHandler from "#src/functions/birthdayHandler";
import * as logs from "#src/modules/logs";

async function run() {
    try {
        boosterHandler.incrementAndDM();
        await birthdayHandler.checkBirthdays();
    } catch (error) {
        await logs.logError("Error running daily events", error);
    }
}

export default { run };