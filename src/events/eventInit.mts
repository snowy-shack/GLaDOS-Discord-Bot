import ready from "#src/events/ready.mts";

import * as guildMemberUpdate  from "#src/events/discordjs/guildMemberUpdate.mts";
import * as interactionCreate  from "#src/events/discordjs/interactionCreate.mts";
import * as messageCreate      from "#src/events/discordjs/messageCreate.mts";
import * as messageReactionAdd from "#src/events/discordjs/messageReactionAdd.mts";
import * as guildMemberAdd     from "#src/events/discordjs/guildMemberAdd.mts";
import cron from "node-cron";
import daily from "#src/events/daily.mts";
import githubIssueWatcher from "#src/modules/githubIssueWatcher.mts";
import {getClient} from "#src/core/client.mts";
import chalk from "chalk";
import {Client} from "discord.js";

export async function init(client: Client): Promise<void> {
    console.log(chalk.gray("Initializing events..."));

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

// Check InfinityButtons issue #10 every day at 12 noon Amsterdam Time
cron.schedule(
    "00 00 12 * * 0-6",
    () => { void githubIssueWatcher.checkInfinityButtonsIssue10(); },
    { timezone: "Europe/Amsterdam" }
);

export default { init, name: () => "eventInit" }