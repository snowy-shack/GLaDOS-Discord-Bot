const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionsBitField, Permissions } = require("discord.js");
const fs = require("fs");
const cron = require('node-cron');

const database = require("./database.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
client.login(process.env.TOKEN);

const onReady = require('./events/ready');
client.once(onReady.name, (...args) => onReady.execute(...args));


client.on('messageCreate', async message => {
  if (message.author.id == '382524802491219969' && message.content == 't') {

    console.log(boosters.toString());
    message.reply(boosters.toString());
  }
});

// Increment the boosting value of all boosters everyday at 12 PM CEST
cron.schedule('00 00 12 * * 0-6', () => {
  (async () => { 
    const phGuildId = '704266427577663548';
    const phGuild = await client.guilds.fetch(phGuildId); // Get Phanty's Home server
    
    const trackBoosters = require('./functions/trackBoosters');
    boosters = await trackBoosters.getBoosters(client, phGuild);
    
    boosters.forEach(boosterId => {
      database.incBoostingDay(boosterId);
    })

    const logChannel = await phGuild.channels.fetch('1223785821157462086');
    logChannel.send(`> \`✅ Updated database for ${boosters.length} boosters.\``);
  })();
  }, {
  timezone: "Europe/Amsterdam"
}); // TEST