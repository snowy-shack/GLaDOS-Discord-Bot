const { Events } = require('discord.js');
const { ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const status = await client.user.setPresence ({
            status: 'idle',
            activities: [{
                type: ActivityType.Custom,
                name: 'activity',
                state: 'Overlooking Phanty\'s Home'
            }]
        })
        console.log(`Ready! As ${client.user.tag}`)
        
        const phGuild = await client.guilds.fetch('704266427577663548');

        const logChannel = await phGuild.channels.fetch('1223785821157462086');
        logChannel.send(`> \`🤖 Online!\``);
    }
};