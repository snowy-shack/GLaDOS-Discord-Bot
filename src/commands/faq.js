const emojis = require("../emojis.js");

async function react(interaction) {
  const faqsJSON = require("../faqs.json"); // Inside the function to not require a bot restart upon FAQ changes
  const faqId = interaction.options.getString('question');
  
  object = faqsJSON.find(object => object.id == faqId)
  if (object) {
    await interaction.reply(`# ${emojis.portalmod} ` + object.question.replace('___', ' *\\_\\_\\_\\_*') + '\n> ' + object.answer)
  } else {
    await interaction.reply('> ❌ `Unknown faq ID!`')
  };
}

module.exports = { react };