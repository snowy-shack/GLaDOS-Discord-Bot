import {GatewayIntentBits, Partials, Client, ActivityType} from "discord.js";

export async function getClient(): Promise<Client> {
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
        ],
        presence : {
            status: "idle",
            activities: [{
                type: ActivityType.Watching,
                name: "Phanty's Home",
                state: "Looking over Phanty's Home"
            }]
        }
    });

    await client.login(process.env.TOKEN);

    return client;
}

export default await getClient();