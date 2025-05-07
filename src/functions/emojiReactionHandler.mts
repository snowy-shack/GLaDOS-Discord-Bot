import {addLikes, addLikesToMedia, addVotes, emojiId, emojis} from "#src/consts/phantys_home.mts";
import artLinks from "#src/consts/links/art_links.json" with { type: "json" };
import * as logs from "#src/modules/logs.mts";
import {Message, MessageReaction} from "discord.js";

/**
 * Module for automatic emoji reactions on messages
 * @param message - Message to potentially react to
 */
export async function react(message: Message): Promise<void> {

    if (addLikesToMedia(message.channelId)) {
        let hasImage = false;

        let linkRegEx = /https?:\/\/(www\.)?([^\/]+)\/.*$/; // Extracts domains from links present in the message.
        const linkMatches = message.content.match(linkRegEx);

        if (linkMatches) {
            const domain = linkMatches[2];
            if (artLinks.links.includes(domain)) hasImage = true;
        }

        message.attachments.forEach((attachment => {
            let contentType = attachment.contentType || null;
            if (contentType && ['image','video'].includes(contentType.split('/')[0])) hasImage = true;
        }));

        if (hasImage) await message.react(getRandomLikeReaction());
        return;
    }

    if (addLikes(message.channelId)) await message.react(emojis.Like);
    if (addVotes(message.channelId)) await message.react(emojis.Upvote).then(() => message.react(emojis.Downvote));

    await logs.logMessage(`⬆️ Adding automatic reactions to message in <#${message.channelId}>.`);
}

export async function removeReactions(messageReaction: MessageReaction): Promise<void> {
    await logs.logMessage(`🗑️ Removing ❤️ reaction on message in <#${messageReaction.message.channel.id}>.`);

    await messageReaction.message.fetch();
    // @ts-ignore - Remove the like and delete emojis
    messageReaction.message.reactions.cache.get(emojiId(emojis.Like))?.remove();
    await messageReaction.remove();
}

function getRandomLikeReaction() {
    return Math.random() < 0.05 ? emojis.Yo : emojis.Like;
}