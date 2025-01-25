const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { exec } = require('child_process');
const path = require('path');

const logs = require('../../logs');
const { getVersion } = require('../../functions/versionManager');

function init() {
  return new SlashCommandBuilder().setName('update')
    .setDescription('Updates GLaDOS')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

async function react(interaction) {
  await interaction.reply(logs.formatMessage("⏬ Downloading latest changes"));
  await logs.logMessage("⏬ Downloading latest changes");

  console.log('⏬ Pulling from git');

  exec(`bash ${path.join(__dirname, '../../../scripts/git-pull.sh')}`, (error, stdout, stderr) => {

    if (error) {
      logs.logError(error);
      console.error(`exec error: ${error}`);
      logs.logMessage("❌ Update might not have been successful");
      return;
    } else if (stderr) {
      logs.logError(stderr);
      console.error(`stderr: ${stderr}`);
      logs.logMessage("❌ Update might not have been successful");
      return;
    } else {
      setTimeout(async () => {
        if (stdout.includes("Fast-forward")) {
          logs.logMessage(`✅ Successfully updated to **GLaDOS v${await getVersion()}**!`);
          
          // Reboot after 2 seconds
          setTimeout(async () => {
            await logs.logMessage("🔁 Rebooting");
            process.exit();
          }, 2000);
        } else if (stdout.includes("Already up to date")) {
          logs.logMessage(`✅ Already up-to-date: **GLaDOS v${await getVersion()}**`);

        } else {
          logs.logMessage("⚠️ Update wasn't successful");
        }
      }, 500);
    }    
  });
}

module.exports = { react, init };