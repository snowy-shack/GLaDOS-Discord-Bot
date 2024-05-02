const {
  GatewayIntentBits,
  Partials,
  Client
} = require("discord.js");

async function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
    ],
    partials: [
      Partials.Channel
    ]
  });

  await client.login(process.env.TOKEN);
  
  return client;
}

module.exports = await createClient();