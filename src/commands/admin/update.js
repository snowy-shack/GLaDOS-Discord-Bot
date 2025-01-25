const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logs = require('../../logs');
const { exec } = require('child_process');

function init() {
  return new SlashCommandBuilder().setName('update')
    .setDescription('Updates GLaDOS')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply(logs.formatMessage("⏬ Downloading latest changes"));
  await logs.logMessage("⏬ Attempting to download latest changes");

  console.log('⏬ Pulling from git');

  exec('script/git-pull.sh', (error, stdout, stderr) => {
    if (error) {
      logs.logError(error);
      console.error(`exec error: ${error}`);
      return;
    }
    if (stderr) {
      logs.logError(stderr);
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  process.exit();
}

module.exports = { react, init };