async function reply(interaction) {
    const { customId } = interaction;

    const [modulePath, formID] = customId.split('#');

    console.log(`../${modulePath.replace(/\./g, '/')}`)
    const module = require(`../${modulePath.replace(/\./g, '/')}`);
    module.modalSubmitted(formID, interaction);
}

module.exports = { reply };