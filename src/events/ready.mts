import {Events} from "discord.js";
import chalk from "chalk";
import * as logs from "#src/core/logs.mts";
import { getVersion } from "#src/core/version.mts";
import spamDetector from "#src/modules/spamDetector.mts";
import {getClient} from "#src/core/client.mts";

export async function run() {
    console.log(chalk.gray("Running ready tasks..."));
    // Don't block "Ready" on scam list fetch — refresh in background
    void spamDetector.refreshScamURLs();

    console.log(chalk.greenBright(`Ready! As ${getClient().user?.tag}`));
    await logs.logMessage(`🌃 Online and connected as GLaDOS v${await getVersion()}!`);
    console.log(chalk.gray("Finished running tasks."));
}

export default {
    name: Events.ClientReady,
    once: true,
    run
};