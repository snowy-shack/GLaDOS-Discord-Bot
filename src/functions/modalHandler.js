async function reply(interaction) {
    const { customId } = interaction;

    const [modulePath, formID] = customId.split('#');

    // Dynamic import
    const module = await import(`../${modulePath.replace(/\./g, '/')}`);
    await module.modalSubmitted(formID, interaction);
}

export default { reply };