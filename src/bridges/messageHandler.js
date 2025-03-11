import { PermissionFlagsBits } from "discord.js";
import * as DMFormHandler from "#src/functions/DMFormHandler";
import * as reactionHandler from "#src/functions/reactionHandler";
import {factorial} from "#src/conversations/conversations";

let reactionChannels = [ // [channelID, reactLikeToImages, reactLike, reactVotes]
    ['1235600733093761156', false, true,  false], // Dev announcements
    ['1253797518555353239', false, true,  true ], // Dev updates
    ['1235600701602791455', true,  false, false], // Dev art

    ['878221699844309033',  false, true,  false], // #News
    ['876132326101360670',  false, true,  false], // #Announcements
    ['981527027142262824',  true,  false, false], // #Art
    ['1005103628882804776', false, true,  true ]  // #Updates
]

/* private */ function isAdmin(message) {
    return message.member.permissionsIn(message.channel).has(PermissionFlagsBits.Administrator);
}

export async function handleMessage(message) {
    if (!message.channel.isSendable()) return;

    for (const i in reactionChannels) {
        let reactionChannel = reactionChannels[i];

        if (reactionChannel[0] !== message.channelId) continue;
        await reactionHandler.react(message, reactionChannel);
    }

    factorial(message)

    //TODO haiku
}

export async function handleDM(message) {
    await DMFormHandler.replyToDM(message);
}