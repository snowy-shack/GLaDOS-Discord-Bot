const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const commandsList = require("./commands.json");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const faqsJSON = require("./faqs.json");

const options = faqsJSON.map(object => ({name: object.question, value: object.id}));

const commands = [
  new SlashCommandBuilder().setName('faq').setDescription('Sends FAQ replies')
    .addStringOption( option =>
      option.setName('question')
        .setDescription('The FAQ message')
        .setRequired(true)
        .addChoices(...options)
    ),
  new SlashCommandBuilder().setName('reboot').setDescription('Reboots GLaDOS')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('ping').setDescription('Ping GLaDOS')
].map(command => command.toJSON());

const rest = new REST().setToken(process.env.TOKEN);

async function register() {
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
}

module.exports = { register };