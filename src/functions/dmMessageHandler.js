const skinForm       = require("./skinFormHandler");
const boosterHandler = require("./boosterHandler");
const logs           = require("../logs");
const database       = require("../database");

async function handleDM(message) {
    boosterHandler.replyToDM(message);
} 

module.exports = { handleDM }