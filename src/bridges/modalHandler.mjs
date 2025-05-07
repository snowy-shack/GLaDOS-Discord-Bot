import * as logs from "#src/modules/logs.mjs";

async function reply(interaction) {
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