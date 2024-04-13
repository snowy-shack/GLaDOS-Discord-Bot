const { REST, Routes } = require("discord.js");
const { clientId, token } = require("./config.json");
const commandsList = require("./commands.json");

const commands = [];

function addCommand(command) {
  commands.push(command.commandDefinition.toJSON());
}

for(let i = 0; 1 < commandsList.length; i++) {
  addCommand(require(`./commands/${commandsList[i]}.js`));
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch(error) {
    console.log(error);
  }
})();