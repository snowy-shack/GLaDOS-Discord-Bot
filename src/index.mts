import "#src/envloader.mts";
import logs from "#src/modules/logs.mts";

import registerSlashCommands from "#src/registerSlashCommands.mts";
import eventInit from "#src/events/eventInit.mjs";

void registerSlashCommands.register();
void eventInit.init();

process.on('uncaughtException', (error) => { // Error logging
    void logs.logError("Uncaught exception", error);
    console.error(error);
});