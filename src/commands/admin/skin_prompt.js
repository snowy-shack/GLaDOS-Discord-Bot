const skinForm = require('../../functions/skinFormHandler');
const logs = require('../../logs');

async function react(interaction) {
  const skin_type = interaction.options.getString('skin_type');
  const target_user = interaction.options.getUser('user');
  skinForm.sendFormMessage(target_user, -1, skin_type);
  
  logs.logMessage(`❓ Asking \`${target_user}\` about their Minecraft UUID to add the ${skin_type} skin.`);
  // exec('git pull origin master');
}

module.exports = { react };