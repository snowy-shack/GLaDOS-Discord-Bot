const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const faqsJSON = require("./faqs.json");
const options = faqsJSON.map(object => ({name: object.question, value: object.id})); // Get a list of FAQ questions for the FAQ command

const logs = require("./logs");

// Define the commands
const commands = [
  new SlashCommandBuilder().setName('faq')
    .setDescription('Sends FAQ Replies')
    .addStringOption( option =>
      option.setName('question')
        .setDescription('The FAQ Message')
        .setRequired(true)
        .addChoices(...options)
    ),
  new SlashCommandBuilder().setName('ping')
    .setDescription('Ping GLaDOS'),
  
  // Administrator commands
  new SlashCommandBuilder().setName('reboot')
    .setDescription('Reboots GLaDOS')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  new SlashCommandBuilder().setName('refresh_faqs')
    .setDescription('Refreshes the FAQ Channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  new SlashCommandBuilder().setName('babble')
    .setDescription('Be a good Genetic Lifeform')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The Message')
        .setRequired(true)
    ),
    
].map(command => command.toJSON());

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