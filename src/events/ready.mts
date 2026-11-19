import {Events} from "discord.js";
import chalk from "chalk";
import * as logs from "#src/core/logs.mts";
import {getVersion} from "#src/core/version.mts";
import spamDetector from "#src/modules/spamDetector.mts";
import {getClient} from "#src/core/client.mts";
import {storageReady} from "#src/modules/localStorage.mts";
import wordleReminder from "#src/modules/wordleReminder.mts";

export async function run() {
    console.log(chalk.gray("Running ready tasks..."));
    // Don't block "Ready" on scam list fetch — refresh in background
    void spamDetector.refreshScamURLs();
    // The pending reminder list is memory-only, so rebuild it (and fix up roles) after every restart instead of waiting for midnight
    void storageReady.then(() => wordleReminder.addReminderRoleToSubscribers(true));

    console.log(chalk.greenBright(`Ready! As ${getClient().user?.tag}`));
    await logs.logWarning(`🌃 Online and connected as GLaDOS v${await getVersion()}!`);
    console.log(chalk.gray("Finished running tasks."));
}

export default {
    name: Events.ClientReady,
    once: true,
    run
};