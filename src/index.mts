import "#src/envloader.mts";
import logs from "#src/modules/logs.mts";

import registerSlashCommands from "#src/registerSlashCommands.mts";
import eventInit from "#src/events/eventInit.mjs";

function main() {
    void registerSlashCommands.register();
    void eventInit.init();
}

main();

process.on('uncaughtException', (error) => { // Error logging
    void logs.logError("running (uncaught)", error);
    console.error(error);
});