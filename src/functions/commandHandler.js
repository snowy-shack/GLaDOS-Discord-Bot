import fs from "fs";
import path from "path";

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getCommandList() {
    const normalCommandsList = fs
        .readdirSync(path.join(__dirname, '../commands'))
        .filter(file => file.endsWith('.js'));
    const adminCommandsList = fs
        .readdirSync(path.join(__dirname, '../commands/admin'))
        .filter(file => file.endsWith('.js'));

    return [...normalCommandsList, ...adminCommandsList.map(file => `admin/${file}`)].map(file => file.replace(/\.js$/, ''));
}

export async function reply(interaction) {
    let commandList = getCommandList();

    // Find the command associated
    for (const command of commandList) {
        const { commandName } = interaction;

        if (commandName === command.split('/').pop()) {
            const { react } = await import(`../commands/${command}.js`);
            react(interaction);
        }
    }
}

export default { reply, getCommandList };