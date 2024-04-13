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
        logChannel.send(`> \`💫 Online!\``);
    }
};