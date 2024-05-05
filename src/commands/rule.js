const emojis = require("../emojis");
const logs = require("../logs");

const { SlashCommandBuilder } = require('discord.js');

const rulesJSON = require("../rules.json");
const options = rulesJSON.map(object => ({name: object.title, value: object.id})); // Get a list of rules for the rule command

function init() {
  return new SlashCommandBuilder().setName('rule')
  .setDescription('Sends rule replies')
  .addStringOption(option =>
    option.setName('rule')
      .setDescription('The rule')
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
  );
}

async function react(interaction) {
  const ruleId = interaction.options.getString('rule');
  const targetMessage = interaction.options.getString('message_id');
  const targetUser = interaction.options.getUser('reply_user');

  rule = rulesJSON.find(object => object.id == ruleId)

  ruleBlock = `# ${emojis.home} ` + rule.title + '\n> ' + rule.description;

  if (targetUser && targetMessage) {
    interaction.reply({content: logs.formatMessage('❌ Please provide either a user or a message ID'), ephemeral: true});
    return;
  }
  
  if (targetUser) {
    replied = false;
    interaction.channel.messages.fetch({ limit: 50 }).then(async messageScan => {
      messageScan.forEach(async scannedMessage => {
        if (scannedMessage.author == targetUser) {
          if (replied == false) {
            scannedMessage.reply(ruleBlock);
            replied = true;
            interaction.reply({content: logs.formatMessage('✅ Succesfully replied to user\'s latest message!'), ephemeral: true});
          }
        }
      });
    });
    if (replied == false) {
      interaction.reply({content: logs.formatMessage('❌ Couldn\'t find recent message by user!'), ephemeral: true});
      return;
    }
    return;
  }

  if (targetMessage) {
    try {
      const message = await interaction.channel.messages.fetch(targetMessage);
      if (message) {
        message.reply(ruleBlock);
        interaction.reply({content: logs.formatMessage('✅ Succesfully replied to their message!'), ephemeral: true});
        return;
      } else {
        throw new Error('Message could not be found');
      }
    } catch (error) {
      interaction.reply({content: logs.formatMessage('❌ Unknown message ID!'), ephemeral: true});
      return;
    }
  };

  if (rule) {
    await interaction.reply(ruleBlock)
  } else {
    await interaction.reply(logs.formatMessage('❌ Unknown faq ID!'));
  };
}

module.exports = { react, init };