const { 
    Events, 
    ActivityType 
} = require('discord.js');
const logs = require('../logs');

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
        console.log(`Ready! As ${client.user.tag}`);
        logs.logMessage('💫 Online!');
    }
};