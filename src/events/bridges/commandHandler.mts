import fs from "fs";
import path from "path";

import {fileURLToPath} from "url";
import * as logs from "#src/core/logs.mts";
import {CommandInteraction} from "discord.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let commandListCache: string[] | null = null;

export function getCommandList(): string[] {
    if (commandListCache) return commandListCache;
    const normalCommandsList = fs
        .readdirSync(path.join(__dirname, "../../commands"))
        .filter(file => file.endsWith(".mts"));
    const adminCommandsList = fs
        .readdirSync(path.join(__dirname, "../../commands/admin"))
        .filter(file => file.endsWith(".mts"));

    commandListCache = [...normalCommandsList, ...adminCommandsList.map(file => `admin/${file}`)].map(file => file.replace(/\.mts$/, ''));
    return commandListCache;
}

export async function reply(interaction: CommandInteraction) {
    const commandList = getCommandList();

    const { commandName } = interaction;
    for (const command of commandList) {
        const fileName = command.split('/').pop();
        if (fileName && commandName === fileName.split('.')[0]) {
            const commandModule = await import(`#src/commands/${command}`);

            if (typeof commandModule.react === "function") {
                await commandModule.react(interaction);
            } else {
                await logs.logError("handling command", Error(`${command} command has no react functionality`));
            }
        }
    }
}

export default { reply };