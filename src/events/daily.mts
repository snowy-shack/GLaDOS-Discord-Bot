import * as logs from "#src/core/logs.mts";
import boosterTracker from "#src/modules/boosterTracker.mts";
import birthdayCongratulator from "#src/modules/birthdayCongratulator.mts";
import spamDetector from "#src/modules/spamDetector.mts";

async function run() {
    try {
        void boosterTracker.incrementAndDM();
        void birthdayCongratulator.checkBirthdays();
        void spamDetector.refreshScamURLs();
    } catch (error: any) {
        await logs.logError("running daily events", error);
    }
}

export default { run };