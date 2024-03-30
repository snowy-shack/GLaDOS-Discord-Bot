const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionsBitField, Permissions } = require("discord.js");
const fs = require("fs");

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


// import pg from "pg";
const pg = require('pg');

const pgClient = new pg.Client({
    host:     "db.alydpmfevxaablumncyj.supabase.co",
    port:     process.env.DBPORT,
    database: process.env.DBNAME,
    user:     process.env.DBNAME,
    password: process.env.DBPASS
});

pgClient.connect();

const boosterID = 382524802491219969;

(async () => {
  await pgClient.query(`
      INSERT INTO boosters (discord_id, days_boosted)
      VALUES (
          ($1, 0)
      )
      ON CONFLICT DO NOTHING;
  
      UPDATE boosters
      SET days_boosted = days_boosted + 1
      WHERE boosters.discord_id = $1;
  `,
  boosterID);
})();