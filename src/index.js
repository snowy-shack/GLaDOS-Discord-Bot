import { Events } from "discord.js";
import cron from "node-cron";

import "#src/envloader";
import * as logs from "#src/modules/logs";
import commandHandler from "#src/bridges/commandHandler";
import buttonHandler from "#src/bridges/buttonHandler";
import modalHandler from "#src/bridges/modalHandler";

import * as messageHandler from "#src/bridges/messageHandler";
import * as reactionHandler from "#src/functions/reactionHandler";
import registerSlashCommands from "#src/registerSlashCommands";

import ready from "#src/events/ready";
import daily from "#src/events/daily";

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

    // TODO this below is a mess
    // Emoji reaction handling
    client.on(Events.MessageReactionAdd, async (messageReaction, author) => {
        const message = await messageReaction.message.channel.messages.fetch(messageReaction.message.id); // Fetch message in channel by ID
        const authorID = message.author.id;

        let inArtChannel = ['981527027142262824', '1235600701602791455'].includes(messageReaction.message.channelId);
        let bySameUser = author.id === authorID;
        let isDeleteReaction = ['1265683388069707776', '1264171028125323327'].includes(messageReaction.emoji.id);

        if (inArtChannel && isDeleteReaction) {
            await reactionHandler.removeReactions(messageReaction, bySameUser);
        }
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