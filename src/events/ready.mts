import {Events} from "discord.js";
import chalk from "chalk";
import * as logs from "#src/modules/logs.mts";
import { getVersion } from "#src/modules/version.mts";
import detectSpam from "#src/functions/detectSpam.mjs";
import {getClient} from "#src/modules/client.mjs";

export async function run() {
    console.log(chalk.gray("Running ready tasks..."));
    await detectSpam.refreshScamURLs();

    console.log(chalk.greenBright(`Ready! As ${getClient().user?.tag}`));
    await logs.logMessage(`🌃 Online and connected as GLaDOS v${await getVersion()}!`);
    console.log(chalk.gray("Finished running tasks."));
}

export default {
    name: Events.ClientReady,
    once: true,
    run
};