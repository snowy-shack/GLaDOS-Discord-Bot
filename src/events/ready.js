const { 
    Events, 
    ActivityType 
} = require('discord.js');
const logs = require('../logs');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        await client.user.setPresence ({
            status: 'idle',
            activities: [{
                type: ActivityType.Custom,
                name: 'activity',
                state: 'Overseeing Phanty\'s Home'
            }]
        })
        console.log(`Ready! As ${client.user.tag}`);
        logs.logMessage(`🌃 Online and connected as GLaDOS v${await getVersion()}!`);
    }
};