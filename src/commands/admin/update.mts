import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction
} from "discord.js";
import { exec } from "child_process";
import path from "path";
import { getVersion } from "#src/core/version.mts";
import * as logs from "#src/core/logs.mts";

import { fileURLToPath } from 'url';
import chalk from "chalk";
import {reboot} from "#src/commands/admin/reboot.mts";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const name = 'update';

export function init() {
    return new SlashCommandBuilder().setName('update')
            .setDescription('Updates GLaDOS')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.reply(logs.formatMessage("⏬ Updating to the latest version"));
    await logs.logMessage("⏬ Downloading latest changes");

    console.log(chalk.blueBright('⏬ Pulling from git'));

    exec(`bash ${path.join(__dirname, '../../../scripts/git-pull.sh')}`, async (error, stdout, _) => {
        const output = stdout.trim(); // Remove trailing newlines/spaces

        if (error) {
            await logs.logError("executing a script", error);
            await logs.logWarning(`⚠️ Update failed. Output:\n\`\`\`\n${output || "No output"}\n\`\`\``);
            return;
        }

        setTimeout(async () => {
            const version = await getVersion();

            if (output.includes("Fast-forward")) {
                await logs.logMessage(`✅ Successfully updated to GLaDOS v${version}!\n**Output:**\n\`\`\`\n${output}\n\`\`\``);

                // Reboot after 3 seconds
                setTimeout(async () => {
                    await reboot();
                }, 3000);
            } else if (output.includes("Already up to date")) {
                await logs.logMessage(`✅ Already up-to-date: GLaDOS v${version}`);
            } else {
                // Log the actual output even if we don't recognize the git status
                await logs.logWarning(`⚠️ Update status unclear. Output:\n\`\`\`\n${output}\n\`\`\``);
            }
        }, 500);
    });
}