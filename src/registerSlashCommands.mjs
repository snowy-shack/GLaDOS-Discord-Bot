import { REST, Routes } from "discord.js";
import { getCommandList } from "#src/bridges/commandHandler.mjs";
import { getClient } from "#src/modules/client.mts";
import {guildID} from "#src/consts/phantys_home.mjs";

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
const rest = new REST().setToken(process.env.TOKEN);

export async function register() {
    try {
        const client = await getClient();
        console.log(`Started refreshing ${commands.length} slash commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(client.application.id, guildID),
            { body: commands }
        );

        rest.put(Routes.applicationCommands(client.application.id), { body: [] }); // Clear global commands

        console.log(`Succesfully refreshed ${data.length} slash commands.`);
    } catch(error) {
        console.error(error);
    }
}

export default { register };