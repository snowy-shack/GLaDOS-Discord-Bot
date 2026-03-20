import * as logs from "#src/core/logs.mts";
import {CommandInteraction} from "discord.js";
import {commandsList} from "#src/commandRegistry.mts";

export async function reply(interaction: CommandInteraction) {
    const { commandName } = interaction;

    // Find the command by name in your flattened list
    const command = commandsList.find(c => c.name === commandName);

    if (!command || !interaction.isChatInputCommand()) {
        await logs.logError(
            "handling command",
            new Error(`Command '${commandName}' was unable to respond`)
        );
        return;
    }

    if (typeof command.react === "function") {
        await command.react(interaction);
    } else {
        await logs.logError(
            "handling command",
            new Error(`Command '${commandName}' has no react functionality`)
        );
    }
}

export default { reply };