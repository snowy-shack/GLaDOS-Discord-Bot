import * as logs from "#src/modules/logs.mts";
import boosterHandler from "#src/functions/boosterHandler.mts";
import birthdayHandler from "#src/functions/birthdayHandler.mts";
import detectSpam from "#src/functions/detectSpam.mjs";

async function run() {
    try {
        void boosterHandler.incrementAndDM();
        void birthdayHandler.checkBirthdays();
        void detectSpam.refreshScamURLs();
    } catch (error: any) {
        await logs.logError("running daily events", error);
    }
}

export default { run };