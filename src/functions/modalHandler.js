async function reply(interaction) {
    const { customId } = interaction;

    const [modulePath, formID] = customId.split('#');

    const module = require(`../${modulePath.replace(/\./g, '/')}`);
    module.modalSubmitted(formID, interaction);
}

module.exports = { reply };