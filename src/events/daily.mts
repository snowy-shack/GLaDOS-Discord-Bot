import boosterHandler from "#src/functions/boosterHandler.mts";
import birthdayHandler from "#src/functions/birthdayHandler.mts";
import * as logs from "#src/modules/logs.mts";

async function run() {
    try {
        void boosterHandler.incrementAndDM();
        void birthdayHandler.checkBirthdays();
    } catch (error: any) {
        await logs.logError("running daily events", error);
    }
}

export default { run };