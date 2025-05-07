import { Events } from "discord.js";
import cron from "node-cron";

import "#src/envloader.mts";
import * as logs from "#src/modules/logs.mts";
import commandHandler from "#src/bridges/commandHandler.mts";
import buttonHandler from "#src/bridges/buttonHandler.mts";
import modalHandler from "#src/bridges/modalHandler.mts";

import * as messageHandler from "#src/bridges/messageHandler.mts";
import * as reactionHandler from "#src/functions/emojiReactionHandler.mts";
import registerSlashCommands from "#src/registerSlashCommands.mts";

import ready from "#src/events/ready.mts";
import daily from "#src/events/daily.mts";
import {spamKick} from "#src/actions/spamKick.mts";
import {addLikesToMedia, roles, serverEmojis} from "#src/consts/phantys_home.mts";
import {flags, getFlag, setFlag} from "#src/agents/flagAgent.mts";

const { getClient } = await import("#src/modules/client.mts");

void registerSlashCommands.register();

async function main() {
    let client = await getClient();

    client.once(Events.ClientReady, () => ready.execute(client));

    // Interaction handling
    client.on(Events.InteractionCreate, async interaction => {
        try {
            if (interaction.isCommand())     await commandHandler.reply(interaction);
            if (interaction.isButton())      await buttonHandler.reply(interaction);
            if (interaction.isModalSubmit()) await modalHandler.reply(interaction);
        } catch (error: any) {
            await logs.logError("handling interaction", error);
        }
    });

    // Message handling
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        let wasGhost = await getFlag(message.author.id, flags.Ghost);
        if (wasGhost) void setFlag(message.author.id, flags.Ghost, "false");

        try {
            if (message.guild) {
                await messageHandler.handleMessage(message);
            } else {
                await messageHandler.handleDM(message);
            }
        } catch (error: any) {
            await logs.logError(`handling ${message.guild ? "guild" : "DM"} message`, error);
        }
    });

    // Emoji reaction handling
    client.on(Events.MessageReactionAdd, async (reaction, author) => {
        const message = await reaction.message.channel.messages.fetch(reaction.message.id); // Fetch message in channel by ID

        // If user adds Delete to their message, remove likes
        if (addLikesToMedia(reaction.message.channelId)
            && reaction.emoji.id === serverEmojis.Delete
            && author.id === message.author.id) {

            await reactionHandler.removeReactions(reaction);
        }
    });

    client.on(Events.GuildMemberUpdate, async (oldMember, member) => {
        if (member.roles.cache.has(roles.SpamBot)) {
            await spamKick(member, "User selected Spam Bot role");
        }
    });

    client.on(Events.GuildMemberAdd, async (member) => {
        // Make sure the user isn't considered a ghost
        let wasGhost = await getFlag(member.id, flags.Ghost);
        if (wasGhost) await setFlag(member.id, flags.Ghost, "false");
    });
}

await main();

// Increment the boosting value of all boosters every day at 10 AM CET
cron.schedule(
    "00 00 10 * * 0-6",
    () => { void daily.run(); },
    { timezone: "Europe/Amsterdam" }
);

process.on('uncaughtException', (error) => { // Error logging
    console.error('Uncaught Exception:', error);
});