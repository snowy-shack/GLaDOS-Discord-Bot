import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import * as logs from "#src/modules/logs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getCommandList() {
    const normalCommandsList = fs
        .readdirSync(path.join(__dirname, "../commands"))
        .filter(file => file.endsWith(".js"));
    const adminCommandsList = fs
        .readdirSync(path.join(__dirname, "../commands/admin"))
        .filter(file => file.endsWith(".js"));

    return [...normalCommandsList, ...adminCommandsList.map(file => `admin/${file}`)].map(file => file.replace(/\.js$/, ''));
}

export async function reply(interaction) {
    let commandList = getCommandList();

    // Find the command associated
    for (const command of commandList) {
        const { commandName } = interaction;

        if (commandName === command.split('/').pop()) {
            const commandModule = await import(`#src/commands/${command}`);

            if (typeof commandModule.react === "function") {
                commandModule.react(interaction);
            } else {
                await logs.logError("handling command", Error(`${command} command has no react functionality`));
            }
        }
    }
}

export default { reply, getCommandList };