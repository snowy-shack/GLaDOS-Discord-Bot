const fs = require('fs');
const path = require('path');

async function reply(interaction) {
  const normalCommandsList = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
  const adminCommandsList = fs.readdirSync(path.join(__dirname, '../commands/admin')).filter(file => file.endsWith('.js'));

  const commandsList = [...normalCommandsList, ...adminCommandsList.map(file => `admin/${file}`)].map(file => file.replace(/\.js$/, ''));

  commandsList.forEach((command) => {
    const { commandName } = interaction;
    if (commandName == command.split('/').pop()) {
      const module = require(`../commands/${command}`);
      module.react(interaction);
    }
  });
}

module.exports = { reply };