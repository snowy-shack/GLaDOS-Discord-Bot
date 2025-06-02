import { Message, PermissionFlagsBits} from "discord.js";
import * as DMFormHandler from "#src/functions/DMFormHandler.mts";
import * as emojiReactionHandler from "#src/functions/emojiReactionHandler.mts";
import * as countingHandler from "#src/functions/countingHandler.mts";
import { replyFunctions } from "#src/functions/autoResponses.mts";
import {addLikes, addLikesToMedia, addVotes, channels} from "#src/modules/phantys_home.mts";
import detectSpam from "#src/functions/detectSpam.mjs";

/* private */ function isAdmin(message: Message) {
    const member = message.member;
    if (!member || message.channel.isDMBased()) return false;

    return member.permissionsIn(message.channel).has(PermissionFlagsBits.Administrator);
}

export async function handleMessage(message: Message) {
    if (!message.channel.isSendable()) return;

    await detectSpam.checkMessage(message);

    // If automatic emoji reaction should be added
    if (Object.values(channels).includes(message.channelId)
           && (addLikesToMedia(message.channelId))
            || addLikes(message.channelId)
            || addVotes(message.channelId)) {
        await emojiReactionHandler.react(message);
    }

    // Try all replies until one succeeds
    for (const replyFunction of replyFunctions) {
        if (replyFunction(message)) break;
    }

    if (message.channelId === channels.Counting) {
        countingHandler.onCountingMessage(message);
    }
}

export async function handleDM(message: Message) {
    await DMFormHandler.replyToDM(message);
}