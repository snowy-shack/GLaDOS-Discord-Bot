import * as logs from "#src/core/logs.mts";
import {ButtonInteraction} from "discord.js";

async function reply(interaction: ButtonInteraction): Promise<void> {
    const { customId } = interaction;

    const [modulePath, buttonID] = customId.split('#');

    const modulePathResolved = `#src/${modulePath.replace(/\./g, '/')}.mts`;
    // Dynamic import
    const module = await import(modulePathResolved) as { buttonPressed?: (id: string, interaction: ButtonInteraction) => unknown };

    if (typeof module.buttonPressed === "function") {
        await module.buttonPressed(buttonID, interaction);
    } else {
        await logs.logError("handling button", Error(`${modulePath} button has no submit functionality`));
    }
}

export default { reply };