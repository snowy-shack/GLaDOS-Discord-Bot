const boosterHandler  = require("../functions/boosterHandler");
const birthdayHandler = require("../functions/birthdayHandler");
const logs            = require("../logs");

async function run() {
    try {
        boosterHandler.incrementAndDM();
        birthdayHandler.checkBirthdays();
    } catch (error) {
        logs.logError(error);
    }
}
module.exports = { run };