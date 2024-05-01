const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const cron = require("node-cron");

const logs = require("./logs");
const messageHandler = require("./functions/messageHandler");
const dmMessageHandler = require("./functions/dmMessageHandler");
const faqHandler = require("./functions/faqHandler");
const daily = require("./events/daily");

const onReady = require("./events/ready");
const prefix = 'ph!';

(async () => {
  const client = await require("./client");
  client.once(onReady.name, (...args) => onReady.execute(...args));

  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return; // Ensure the bot doesn't reply to itself (or automated bot messages)
      var isDm = !message.guild; 
  
      if (message.content == "ph!ping") {
        message.reply("pong!");
        return;
      }
  
      if (isDm) {
        console.log('dm')
        dmMessageHandler.handleDM(message);
      } else {
        console.log('not dm')
        messageHandler.handleMessage(prefix, message);
      }
    } catch (error) {
      logs.logMessage(`❌ An error occured: ${error}`);
    }
  });
  
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    const { commandName } = interaction;
    const faqId = interaction.options.getString('id');

    if (commandName === 'faq') {
        await interaction.reply(await faqHandler.getFaqReply(faqId));
        // await logs.directReply(interaction, await faqHandler.getFaqReply(faqId))
    }
  });

})();

// daily.run(client);



// Increment the boosting value of all boosters everyday at 12 PM CEST
cron.schedule(
  "00 00 12 * * 0-6",
  () => {
    daily.run(client);
  },
  {
    timezone: "Europe/Amsterdam",
  }
);

// const start = new SlashCommandBuilder()
// 	.setName('ban')
// 	.setDescription('Select a member and ban them.')
// 	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
// 	.setDMPermission(false);

// const search = await guild.members.search({ query: 'username' });