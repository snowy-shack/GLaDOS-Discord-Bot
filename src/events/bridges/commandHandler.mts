import fs from "fs";
import path from "path";

import {fileURLToPath} from "url";
import * as logs from "#src/core/logs.mts";
import {CommandInteraction} from "discord.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getCommandList() {
    const normalCommandsList = fs
        .readdirSync(path.join(__dirname, "../../commands"))
        .filter(file => file.endsWith(".mts"));
    const adminCommandsList = fs
        .readdirSync(path.join(__dirname, "../../commands/admin"))
        .filter(file => file.endsWith(".mts"));

    return [...normalCommandsList, ...adminCommandsList.map(file => `admin/${file}`)].map(file => file.replace(/\.mts$/, ''));
}

export async function reply(interaction: CommandInteraction) {
    let commandList = getCommandList();

    // Find the command associated
    for (const command of commandList) {
        const { commandName } = interaction;

        let commandModule = command.split('/').pop();
        if (commandModule && commandName === commandModule.split('.')[0]) {
            const commandModule = await import(`#src/commands/${command}`);

            if (typeof commandModule.react === "function") {
                commandModule.react(interaction);
            } else {
                await logs.logError("handling command", Error(`${command} command has no react functionality`));
            }
        }
    }
}

export default { reply };