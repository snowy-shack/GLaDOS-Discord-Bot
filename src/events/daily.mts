import * as logs from "#src/modules/logs.mts";
import {incrementAndDM} from "#src/functions/boosterHandler.mts";
import {checkBirthdays} from "#src/functions/birthdayHandler.mts";
import {refreshScamURLs} from "#src/functions/detectSpam.mjs";

async function run() {
    try {
        void incrementAndDM();
        void checkBirthdays();
        void refreshScamURLs();
    } catch (error: any) {
        await logs.logError("running daily events", error);
    }
}

export default { run };