const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionsBitField, Permissions } = require("discord.js");
const fs = require("fs");

const database = require("./database.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
client.login(process.env.TOKEN);

// const ready = require('./events/ready');
// client.on('ready', ready.execute()); // ???

// Functions
const trackBoosters = require('./functions/trackBoosters');


client.on('messageCreate', async message => {
  if (message.author.id == '382524802491219969' && message.content == 't') {
    boosters = await trackBoosters.getBoosters(client);

    console.log(boosters.toString());
    message.reply(boosters.toString());
  }
});

// put this where you want
database.incBoostingDay(382524802491219969);