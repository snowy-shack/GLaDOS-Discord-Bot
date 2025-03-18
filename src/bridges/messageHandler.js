import { PermissionFlagsBits } from "discord.js";
import * as DMFormHandler from "#src/functions/DMFormHandler";
import * as emojiReactionHandler from "#src/functions/emojiReactionHandler";
import * as countingHandler from "#src/functions/countingHandler";
import { replyFunctions } from "#src/functions/autoReplies";
import {addLikes, addLikesToMedia, addVotes, channels} from "#src/consts/phantys_home";

/* private */ function isAdmin(message) {
    return message.member.permissionsIn(message.channel).has(PermissionFlagsBits.Administrator);
}

export async function handleMessage(message) {
    if (!message.channel.isSendable()) return;

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

    if (message.channelId === process.env.COUNTING_CHANNEL_ID) {
        countingHandler.onCountingMessage(message);
    }
}

export async function handleDM(message) {
    await DMFormHandler.replyToDM(message);
}