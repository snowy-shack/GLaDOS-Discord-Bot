const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const commandsList = require("./commands.json");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const commands = [
  new SlashCommandBuilder().setName('faq').setDescription('Sends FAQ replies')
    .addStringOption( option =>
      option.setName('id')
        .setDescription('ID of FAQ message')
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  // try {
    const client = await require("./client");

    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(client.application.id),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  // } catch(error) {
  //   console.log(error);
  // }
})();