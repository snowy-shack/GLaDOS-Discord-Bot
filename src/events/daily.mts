import * as logs from "#src/core/logs.mts";
import { toError } from "#src/core/try-catch.mts";
import boosterTracker from "#src/modules/boosterTracker.mts";
import birthdayCongratulator from "#src/modules/birthdayCongratulator.mts";
import spamDetector from "#src/modules/spamDetector.mts";
import portalGunSkinLoader from "#src/modules/portalGunSkinLoader.mts";

async function run() {
    try {
        void boosterTracker.incrementAndDM();
        void birthdayCongratulator.checkBirthdays();
        void spamDetector.refreshScamURLs();
        void portalGunSkinLoader.fetchSkins();
    } catch (error: unknown) {
        await logs.logError("running daily events", toError(error));
    }
}

export default { run };