import {Events} from "discord.js";
import * as logs from "#src/modules/logs.mts";
import { getVersion } from "#src/modules/version.mts";
import detectSpam from "#src/functions/detectSpam.mjs";
import {getClient} from "#src/modules/client.mjs";

export async function run() {
    console.log("Running ready tasks");
    await detectSpam.refreshScamURLs();

    console.log(`Ready! As ${getClient().user?.tag}`);
    await logs.logMessage(`🌃 Online and connected as GLaDOS v${await getVersion()}!`);
    console.log("Finished running tasks");
}

export default {
    name: Events.ClientReady,
    once: true,
    run
};