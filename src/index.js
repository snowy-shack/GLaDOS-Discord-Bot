import { Events } from "discord.js";
import cron from "node-cron";

import "#src/envloader";
import * as logs from "#src/modules/logs";
import commandHandler from "#src/bridges/commandHandler";
import buttonHandler from "#src/bridges/buttonHandler";
import modalHandler from "#src/bridges/modalHandler";

import * as messageHandler from "#src/bridges/messageHandler";
import * as reactionHandler from "#src/functions/emojiReactionHandler";
import registerSlashCommands from "#src/registerSlashCommands";

import ready from "#src/events/ready";
import daily from "#src/events/daily";
import {spamKick} from "#src/actions/spamKick";
import {addLikesToMedia, roles, serverEmojis} from "#src/consts/phantys_home";
import {flags, getFlag, setFlag} from "#src/agents/flagAgent";

const { getClient } = await import("#src/modules/client");

registerSlashCommands.register();

async function main() {
    let client = await getClient();

    client.once(ready.name, (...args) => ready.execute(...args));

    // Interaction handling
    client.on(Events.InteractionCreate, async interaction => {
        try {
            if (interaction.isCommand())     await commandHandler.reply(interaction);
            if (interaction.isButton())      await buttonHandler.reply(interaction);
            if (interaction.isModalSubmit()) await modalHandler.reply(interaction);
        } catch (error) {
            await logs.logError("handling interaction", error);
        }
    });

    // Message handling
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        let wasGhost = await getFlag(message.author.id, flags.Ghost);
        if (wasGhost) setFlag(message.author.id, flags.Ghost, false);

        try {
            if (message.guild) {
                await messageHandler.handleMessage(message);
            } else {
                await messageHandler.handleDM(message);
            }
        } catch (error) {
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

    client.on(Events.GuildMemberUpdate, async (_, member) => {
        if (member.roles.cache.has(roles.SpamBot)) {
            await spamKick(member.id, "User selected Spam Bot role");
        }
    });

    client.on(Events.GuildMemberAdd, async (member) => {
        // Make sure the user isn't considered a ghost
        let wasGhost = await getFlag(member.id, flags.Ghost);
        if (wasGhost) setFlag(member.id, flags.Ghost, false);
    });
}

await main();

// Increment the boosting value of all boosters every day at 10 AM CET
cron.schedule(
    "00 00 10 * * 0-6",
    () => { daily.run(); },
    { timezone: "Europe/Amsterdam" }
);

process.on('uncaughtException', (error) => { // Error logging
    console.error('Uncaught Exception:', error);
});