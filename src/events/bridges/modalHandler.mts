import * as logs from "#src/core/logs.mts";
import {ModalSubmitInteraction} from "discord.js";

async function reply(interaction: ModalSubmitInteraction) {
    const { customId } = interaction;

    const [modulePath, formID] = customId.split('#');

    let path = `#src/${modulePath.replace(/\./g, '/')}.mjs`;
    // Dynamic import
    const module = await import(path);

    if (typeof module.modalSubmitted === "function") {
        await module.modalSubmitted(formID, interaction);
    } else {
        await logs.logError("handling modal", Error(`${modulePath} modal has no submit functionality`));
    }
}

export default { reply };