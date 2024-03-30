const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionsBitField, Permissions } = require("discord.js");
const fs = require("fs");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

//

//

client.login(process.env.TOKEN);

client.on('messageCreate', (message) => {
  if (message.author.id == '382524802491219969' && message.content == 't') {

    message.reply('w');
    message.guild.members.fetch()


    phGuild = client.guilds.cache.get('704266427577663548'); // Get Phanty's Home server

    // phGuild.members.fetch();
    const boosterRoleID = '852838462469308428'
    
    console.log(phGuild.roles.cache.get(boosterRoleID).members.map(m=>m.user.tag));

  }
});