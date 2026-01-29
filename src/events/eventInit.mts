import ready from "#src/events/ready.mts";

import * as guildMemberUpdate  from "#src/events/discordjs/guildMemberUpdate.mts";
import * as interactionCreate  from "#src/events/discordjs/interactionCreate.mts";
import * as messageCreate      from "#src/events/discordjs/messageCreate.mts";
import * as messageReactionAdd from "#src/events/discordjs/messageReactionAdd.mts";
import * as guildMemberAdd     from "#src/events/discordjs/guildMemberAdd.mts";
import cron from "node-cron";
import daily from "#src/events/daily.mts";
import {getClient} from "#src/core/client.mts";
import chalk from "chalk";

export async function init(): Promise<void> {
    console.log(chalk.gray("Initializing events..."));
    const client = getClient();

    guildMemberUpdate.init(client);
    interactionCreate.init(client);
    messageCreate.init(client);
    messageReactionAdd.init(client);
    guildMemberAdd.init(client);

    await ready.run();

    console.log(chalk.gray("Events initialized."));
}

// Do daily tasks every day at 10 AM Amsterdam Time
cron.schedule(
    "00 00 10 * * 0-6",
    () => { void daily.run(); },
    { timezone: "Europe/Amsterdam" }
);

export default { init }