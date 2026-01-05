import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction
} from "discord.js";
import { exec } from "child_process";
import path from "path";
import { getVersion } from "#src/modules/version.mts";
import * as logs from "#src/modules/logs.mts";

import { fileURLToPath } from 'url';
import chalk from "chalk";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function init() {
    return new SlashCommandBuilder().setName('update')
            .setDescription('Updates GLaDOS')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.reply(logs.formatMessage("⏬ Updating to the latest version"));
    await logs.logMessage("⏬ Downloading latest changes");

    console.log(chalk.blueBright('⏬ Pulling from git'));

    exec(`bash ${path.join(__dirname, '../../../scripts/git-pull.sh')}`, (error, stdout, stderr) => {

        if (error) {
            logs.logError("executing a script", error);
            logs.logWarning("⚠️ Update wasn't successful");
            return;
        }

        setTimeout(async () => {
            if (stdout.includes("Fast-forward")) {
                await logs.logMessage(`✅ Successfully updated to GLaDOS v${await getVersion()}!`);

                // Reboot after 2 seconds
                setTimeout(async () => {
                    await logs.logMessage("🔁 Rebooting");
                    process.exit();
                }, 5000);
            } else if (stdout.includes("Already up to date")) {
                await logs.logMessage(`✅ Already up-to-date: GLaDOS v${await getVersion()}`);
            } else {
                await logs.logMessage("⚠️ Update wasn't successful");
            }
        }, 500);
    });
}