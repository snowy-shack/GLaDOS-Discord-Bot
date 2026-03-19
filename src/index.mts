console.log("index.mts running");
import "#src/envloader.mts";
import logs from "#src/core/logs.mts";

import client from "#src/core/client.mts";
import discord from "#src/core/discord.mts";
import registerSlashCommands from "#src/registerSlashCommands.mts";
import eventInit from "#src/events/eventInit.mts";
import localStorage from "#src/modules/localStorage.mts";

const t0 = { start: 0 };
function ms() { return Date.now() - t0.start; }

async function init() {
    t0.start = Date.now();

    await localStorage.init();
    console.log(`  [bench] localStorage.init: ${ms()}ms`);

    await client.init();
    console.log(`  [bench] client.init: ${ms()}ms`);

    await discord.init();
    console.log(`  [bench] discord.init: ${ms()}ms`);

    await registerSlashCommands.register();
    console.log(`  [bench] registerSlashCommands: ${ms()}ms`);

    await eventInit.init();
    console.log(`  [bench] eventInit: ${ms()}ms`);
    console.log(`  [bench] TOTAL STARTUP (to Ready): ${ms()}ms`);
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