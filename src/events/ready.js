import { Events } from "discord.js";

import * as logs from "#src/modules/logs";
import { getVersion } from "#src/modules/version";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! As ${client.user.tag}`);
        await logs.logMessage(`🌃 Online and connected as GLaDOS v${await getVersion()}!`);
    }
};