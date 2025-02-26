import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { exec } from "child_process";
import path from "path";
import { getVersion } from "#src/modules/version";
import * as logs from "#src/modules/logs";

export function init() {
    return new SlashCommandBuilder().setName('update')
            .setDescription('Updates GLaDOS')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction) {
    await interaction.reply(logs.formatMessage("⏬ Updating to the latest version"));
    await logs.logMessage("⏬ Downloading latest changes");

    console.log('⏬ Pulling from git');

    exec(`bash ${path.join(__dirname, '../../../scripts/git-pull.sh')}`, (error, stdout, stderr) => {

        if (error) {
            logs.logError("executing a script", error);
            logs.logMessage("⚠️ Update wasn't successful");
        } else {
            setTimeout(async () => {
                if (stdout.includes("Fast-forward")) {
                    logs.logMessage(`✅ Successfully updated to GLaDOS v${await getVersion()}!`);

                    // Reboot after 2 seconds
                    setTimeout(async () => {
                        await logs.logMessage("🔁 Rebooting");
                        process.exit();
                    }, 2000);
                } else if (stdout.includes("Already up to date")) {
                    logs.logMessage(`✅ Already up-to-date: GLaDOS v${await getVersion()}`);

                } else {
                    logs.logMessage("⚠️ Update wasn't successful");
                }
            }, 500);
        }
    });
}