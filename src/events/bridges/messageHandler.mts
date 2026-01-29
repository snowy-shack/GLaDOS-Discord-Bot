import { Message, PermissionFlagsBits} from "discord.js";
import * as DMFormHandler from "#src/modules/DMFormHandler.mts";
import * as autoEmojiReactions from "#src/modules/autoEmojiReactions.mts";
import { replyFunctions } from "#src/modules/autoResponses.mts";
import {addLikes, addLikesToMedia, addVotes, channels} from "#src/core/phantys_home.mts";
import spamDetector from "#src/modules/spamDetector.mts";

/* private */ function isAdmin(message: Message) {
    const member = message.member;
    if (!member || message.channel.isDMBased()) return false;

    return member.permissionsIn(message.channel).has(PermissionFlagsBits.Administrator);
}

export async function handleMessage(message: Message) {
    if (!message.channel.isSendable()) return;

    void spamDetector.checkMessage(message); // Check if this message contains a suspicious link

    // If automatic emoji reaction should be added
    if (Object.values(channels).includes(message.channelId)
           && (addLikesToMedia(message.channelId))
            || addLikes(message.channelId)
            || addVotes(message.channelId)) {
        await autoEmojiReactions.react(message);``
    }

    // Try all replies until one succeeds
    for (const replyFunction of replyFunctions) {
        if (await replyFunction(message)) break;
    }
}

export async function handleDM(message: Message) {
    await DMFormHandler.replyToDM(message);
}