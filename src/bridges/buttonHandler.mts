import * as logs from "#src/modules/logs.mts";
import {ButtonInteraction} from "discord.js";

async function reply(interaction: ButtonInteraction): Promise<void> {
    const { customId } = interaction;

    const [modulePath, buttonID] = customId.split('#');

    let path = `#src/${modulePath.replace(/\./g, '/')}.mjs`;
    // Dynamic import
    const module: {buttonPressed: Function} = await import(path);

    if (typeof module.buttonPressed === "function") {
        await module.buttonPressed(buttonID, interaction);
    } else {
        await logs.logError("handling button", Error(`${modulePath} button has no submit functionality`));
    }
}

export default { reply };