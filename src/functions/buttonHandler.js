async function reply(interaction) {
  const { customId } = interaction;

  const [modulePath, buttonID] = customId.split('#');

  const module = require(`../${modulePath.replace(/\./g, '/')}`);
  module.buttonPressed(buttonID, interaction);
}

module.exports = { reply };