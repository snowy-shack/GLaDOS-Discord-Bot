import {Client, Events} from "discord.js";

import * as logs from "#src/modules/logs.mts";
import { getVersion } from "#src/modules/version.mts";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        console.log(`Ready! As ${client.user?.tag}`);
        await logs.logMessage(`🌃 Online and connected as GLaDOS v${await getVersion()}!`);
    }
};