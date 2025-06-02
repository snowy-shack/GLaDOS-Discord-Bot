import "#src/envloader.mts";
import logs from "#src/modules/logs.mts";

import client from "#src/modules/client.mts";
import discord from "#src/modules/discord.mts";
import registerSlashCommands from "#src/registerSlashCommands.mts";
import eventInit from "#src/events/eventInit.mjs";

async function init() {
    await client.init();
    await discord.init();
    await registerSlashCommands.register();
    await eventInit.init();
}

process.on('uncaughtException', (error) => { // Error logging
    try {
        void logs.logError("running (uncaught)", error);
    } catch (caught) {
        console.error("Uncaught exception could not be logged in Discord channel:", caught)
    }
});

console.log("Hello cruel world");
await init();