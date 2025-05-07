import { REST, Routes } from "discord.js";
import { getCommandList } from "#src/bridges/commandHandler.mts";
import { getClient } from "#src/modules/client.mts";
import {guildID} from "#src/consts/phantys_home.mts";

// Define the commands
let commandList = getCommandList();

const commands = await Promise.all(
    commandList.map(async commandName => { // <id>.mjs
        const { init } = await import(`#src/commands/${commandName}`);
        let initialization = init();

        return initialization.toJSON();
    })
);

// Register the commands
// @ts-ignore - the token shall NOT be undefined
const rest = new REST().setToken(process.env.TOKEN);

export async function register() {
    try {
        const client = await getClient();
        console.log(`Started refreshing ${commands.length} slash commands.`);

        const data = await rest.put( // @ts-ignore
            Routes.applicationGuildCommands(client.application.id, guildID),
            { body: commands }
        );

        // @ts-ignore
        rest.put(Routes.applicationCommands(client.application.id), { body: [] }); // Clear global commands

        // @ts-ignore
        console.log(`Successfully refreshed ${data.length} slash commands.`);
    } catch(error) {
        console.error(error);
    }
}

export default { register };