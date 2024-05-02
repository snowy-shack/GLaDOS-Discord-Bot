const client = require("../../client");
const faqsJSON = require("../../faqs.json");

faqChannels = [
  '1235583512413732904'
]

async function react(interaction) {
  await interaction.reply(`Updating FAQ`);
  for (channel of faqChannels) {
    for (faq of faqsJSON) {
      client.channels.cache.get(channel).send('# ' + faq.question + '\n' + faq.answer)
    }
  }
}

module.exports = { react };