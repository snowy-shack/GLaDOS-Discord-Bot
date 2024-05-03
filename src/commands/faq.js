const faqsJSON = require("../faqs.json");

async function react(interaction) {
  const faqId = interaction.options.getString('question');
  
  object = faqsJSON.find(object => object.id == faqId)
  if (object) {
    await interaction.reply('# ' + object.question.replace('___', ' *\\_\\_\\_\\_*') + '\n> ' + object.answer)
  } else {
    await interaction.reply('> ❌ `Unknown faq ID!`')
  };
}

module.exports = { react };