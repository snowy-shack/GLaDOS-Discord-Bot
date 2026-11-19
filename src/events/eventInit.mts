import ready from "#src/events/ready.mts";

import * as guildMemberUpdate  from "#src/events/discordjs/guildMemberUpdate.mts";
import * as interactionCreate  from "#src/events/discordjs/interactionCreate.mts";
import * as messageCreate      from "#src/events/discordjs/messageCreate.mts";
import * as messageReactionAdd from "#src/events/discordjs/messageReactionAdd.mts";
import * as guildMemberAdd     from "#src/events/discordjs/guildMemberAdd.mts";
import cron from "node-cron";
import daily from "#src/events/daily.mts";
import githubIssueWatcher from "#src/modules/githubIssueWatcher.mts";
import wordleReminder from "#src/modules/wordleReminder.mts";
import {getClient} from "#src/core/client.mts";
import chalk from "chalk";
import {Client} from "discord.js";
import {isStorageReady, storageReady} from "#src/modules/localStorage.mts";

type Listener = (...args: any[]) => unknown;

/**
 * Hands event modules a client whose listeners wait for storage to finish loading.
 * Listeners are still registered immediately, so events that arrive during boot are
 * held and handled in order instead of being dropped. After boot it's just a flag check.
 */
function gateOnStorage(client: Client): Client {
    return new Proxy(client, {
        get(target, prop) {
            if (prop === "on" || prop === "once") {
                const register = target[prop].bind(target) as unknown as (event: string, listener: Listener) => Client;

                return (event: string, listener: Listener) => {
                    register(event, async (...args: any[]) => {
                        if (!isStorageReady()) await storageReady;
                        return listener(...args);
                    });
                    return target;
                };
            }

            const value = Reflect.get(target, prop, target);
            return typeof value === "function" ? value.bind(target) : value;
        }
    });
}

export async function init(client: Client): Promise<void> {
    console.log(chalk.gray("Initializing events..."));

    const gatedClient = gateOnStorage(client);

    guildMemberUpdate.init(gatedClient);
    interactionCreate.init(gatedClient);
    messageCreate.init(gatedClient);
    messageReactionAdd.init(gatedClient);
    guildMemberAdd.init(gatedClient);

    await ready.run();

    console.log(chalk.gray("Events initialized."));
}

// Do daily tasks every day at 10 AM Amsterdam Time
cron.schedule(
    "00 00 10 * * 0-6",
    () => { void storageReady.then(() => daily.run()); },
    { timezone: "Europe/Amsterdam" }
);

// Check InfinityButtons issue #10 every day at 12 noon Amsterdam Time
cron.schedule(
    "00 00 12 * * 0-6",
    () => { void storageReady.then(() => githubIssueWatcher.checkInfinityButtonsIssue10()); },
    { timezone: "Europe/Amsterdam" }
);

// Warn about at-risk wordle streaks every day at 10 PM Amsterdam Time
cron.schedule(
    "00 00 22 * * 0-6",
    () => { void storageReady.then(() => wordleReminder.sendStreakWarning()); },
    { timezone: "Europe/Amsterdam" }
);

// Hand out the wordle reminder role to subscribers every day at midnight Amsterdam Time
cron.schedule(
    "00 00 00 * * 0-6",
    () => { void storageReady.then(() => wordleReminder.addReminderRoleToSubscribers()); },
    { timezone: "Europe/Amsterdam" }
);

export default { init, name: () => "eventInit" }