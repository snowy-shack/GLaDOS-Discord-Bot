const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const logs = require("./logs");
const commandList = require("./functions/interactionHandler").getCommandList();

// commandList.forEach((command) => {
//   const module = require(`./commands/${command}`);
// });

// Define the commands
const commands = (commandList.map(commandName => require(`./commands/${commandName}`).init())).map(command => command.toJSON());

// Register the commands
const rest = new REST().setToken(process.env.TOKEN);
async function register() {
  try {
    const client = await require("./client");
    const servers = await client.guilds.cache.map(guild => guild.id);

    console.log(`Started refreshing ${commands.length} slash commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(client.application.id, process.env.GUILDID),
      { body: commands }
    );
    rest.put(Routes.applicationCommands(client.application.id), { body: [] }); // Clear global commands

    console.log(`Succesfully refreshed ${data.length} slash commands.`);

    logs.logMessage(`👁️‍🗨️ Reloaded ${commands.length} slash commands.`);
  } catch(error) {
    console.log(error);
  }
}

module.exports = { register };