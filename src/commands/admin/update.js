const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logs = require('../../logs');
const { exec } = require('child_process');
const { getVersion } = require('../../functions/versionManager');

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
      logs.logMessage("❌ Update might not have been successful");
      return;
    }
    if (stderr) {
      logs.logError(stderr);
      console.error(`stderr: ${stderr}`);
      logs.logMessage("❌ Update might not have been successful");
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  setTimeout(async () => {
    if (stdout.includes("Fast-forward")) {
      logs.logMessage(`✅ Successfully updated to **GLaDOS v${await getVersion()}**!`);

    } else if (stdout.includes("Already up to date")) {
      logs.logMessage(`✅ Already up-to-date: **GLaDOS v${await getVersion()}**`);

    } else {
      logs.logMessage("❌ Update might not have been successful");
      return;
    }
  }, 1000);

  // Reboot after 5 seconds
  setTimeout(async () => {
    await logs.logMessage("🔁 Rebooting");
    process.exit();
  }, 5000);
}

module.exports = { react, init };