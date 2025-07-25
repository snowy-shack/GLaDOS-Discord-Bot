import {GatewayIntentBits, Partials, Client, ActivityType} from "discord.js";
import chalk from "chalk";

let client: Client;

async function init() {
    console.log(chalk.gray("Initializing client..."));
    client = new Client({
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
    console.log(chalk.gray("Client initialized and logged in."));
}

export function getClient(): Client {
    return client;
}

export default { init }