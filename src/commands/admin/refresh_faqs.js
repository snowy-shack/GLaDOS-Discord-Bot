const faqsJSON = require("../../faqs.json");
const logs = require("../../logs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function react(interaction) {
  const client = await require("../../client");
  await interaction.reply(logs.formatMessage('🔄️ Updating FAQ'));
  logs.logMessage('🔄️ Updating FAQ');

  const channel = client.channels.cache.get(process.env.FAQ_CHANNEL_ID);

    channel.messages.fetch({ limit: 100 }).then(async messageScan => {
      messageScan.forEach(async scannedMessage => {
        if (scannedMessage.author.id == client.application.id) { // If the message was sent by the bot
          scannedMessage.delete();
        }
      });
    });
    
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear().toString().substr(-2);
    
    const formattedDate = `${day}.${month}.${year}`;

    setTimeout(() => {
      channel.send(logs.formatMessage(`Last FAQ update: ${formattedDate}`))
      for (faq of faqsJSON) {
        channel.send('# <:portalmod:1235976680481488957> ' + faq.question.replace('___', ' *\\_\\_\\_\\_*') + '\n> ' + faq.answer + '\n** **');
      }
    }, 5000);
}

module.exports = { react };