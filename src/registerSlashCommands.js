const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const faqsJSON = require("./faqs.json");
const options = faqsJSON.map(object => ({name: object.question, value: object.id})); // Get a list of FAQ questions for the FAQ command

const logs = require("./logs");

// Define the commands
const commands = [
  new SlashCommandBuilder().setName('faq')
    .setDescription('Sends FAQ Replies')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The FAQ Message')
        .setRequired(true)
        .addChoices(...options)
    )
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('Will reply to a specific message (by ID)')
    )
    .addUserOption(option => 
      option.setName('reply_user')
        .setDescription('Will reply to the last message sent by a user')
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
  
  new SlashCommandBuilder().setName('skin_prompt')
    .setDescription('DM user a skin form')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user')
        .setRequired(true)
        .setDescription('User to DM the Portal Gun skin form')
    )
    .addStringOption(option => 
      option.setName('skin_type')
        .setDescription('The Portal Gun skin to give')
        .setRequired(true)
        .addChoices(
          {name: 'Booster Skin', value: 'booster'}
        )
    )
    
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