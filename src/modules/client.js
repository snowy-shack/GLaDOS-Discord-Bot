import { GatewayIntentBits, Partials, Client } from "discord.js";

export async function getClient() {
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

export default await getClient();