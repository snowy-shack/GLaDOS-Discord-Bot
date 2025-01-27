const fs = require('fs');
const path = require('path');

function getCommandList() {
  const normalCommandsList = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
  const adminCommandsList = fs.readdirSync(path.join(__dirname, '../commands/admin')).filter(file => file.endsWith('.js'));

  return [...normalCommandsList, ...adminCommandsList.map(file => `admin/${file}`)].map(file => file.replace(/\.js$/, ''));
}

async function reply(interaction) {
  commandList = getCommandList();
  commandList.forEach((command) => {
    const { commandName } = interaction;

    if (commandName == command.split('/').pop()) {
      const module = require(`../commands/${command}`);
      module.react(interaction);
    }
  });
}

module.exports = { reply, getCommandList };