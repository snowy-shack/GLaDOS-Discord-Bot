console.log("index.mts running");
import "#src/envloader.mts";
import logs from "#src/core/logs.mts";

import client from "#src/core/client.mts";
import discord from "#src/core/discord.mts";
import registerSlashCommands from "#src/registerSlashCommands.mts";
import eventInit from "#src/events/eventInit.mts";
import localStorage from "#src/modules/localStorage.mts";

async function init() {
    await localStorage.init();
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

console.log("Finished imports, starting automatic tasks");
await init();