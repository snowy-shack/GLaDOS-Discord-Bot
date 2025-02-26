import { REST, Routes } from "discord.js";
import { getCommandList } from "#src/bridges/commandHandler";
import { getClient } from "#src/modules/client";
import * as logs from "#src/modules/logs";

// Define the commands
let commandList = getCommandList();

const commands = await Promise.all(
    commandList.map(async commandName => {
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
            Routes.applicationGuildCommands(client.application.id, process.env.GUILDID),
            { body: commands }
        );

        rest.put(Routes.applicationCommands(client.application.id), { body: [] }); // Clear global commands

        console.log(`Succesfully refreshed ${data.length} slash commands.`);

        logs.logMessage(`👁️‍🗨️ Reloaded ${commands.length} slash commands.`);
    } catch(error) {
        console.error(error);
    }
}

export default { register };