import {Client, Events} from "discord.js";
import ready from "#src/events/ready.mjs";

import * as guildMemberUpdate  from "#src/events/discordjs/guildMemberUpdate.mjs";
import * as interactionCreate  from "#src/events/discordjs/interactionCreate.mjs";
import * as messageCreate      from "#src/events/discordjs/messageCreate.mjs";
import * as messageReactionAdd from "#src/events/discordjs/messageReactionAdd.mjs";
import * as guildMemberAdd     from "#src/events/discordjs/guildMemberAdd.mjs";
import cron from "node-cron";
import daily from "#src/events/daily.mjs";
import {getClient} from "#src/modules/client.mjs";

export async function init(): Promise<void> {
    const client = await getClient();

    client.once(Events.ClientReady, () => ready.execute(client));

    guildMemberUpdate.init(client);
    interactionCreate.init(client);
    messageCreate.init(client);
    messageReactionAdd.init(client);
    guildMemberAdd.init(client);
}

// Do daily tasks every day at 10 AM Amsterdam Time
cron.schedule(
    "00 00 10 * * 0-6",
    () => { void daily.run(); },
    { timezone: "Europe/Amsterdam" }
);

export default { init }