const {
  GatewayIntentBits,
  Partials,
  Client
} = require("discord.js");

function createClient() {
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

  client.login(process.env.TOKEN);
  
  return client;
}

module.exports = createClient();