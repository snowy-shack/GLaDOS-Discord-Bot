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
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
    ]
  });

  await client.login(process.env.TOKEN);
  
  return client;
}

const client = createClient();

module.exports = client;