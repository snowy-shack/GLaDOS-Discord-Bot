import {addLikes, addLikesToMedia, addVotes, emojiId, emojis, serverEmojis} from "#src/consts/phantys_home";
import artLinks from "#src/consts/links/art_links.json" with { type: "json" };
import * as logs from "#src/modules/logs";

/**
 * Module for automatic emoji reactions on messages
 * @param message
 * @param reactionChannel
 * @returns {Promise<void>}
 */
export async function react(message) {

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
            if (['image','video'].includes(contentType.split('/')[0])) hasImage = true;
        }));

        if (hasImage) message.react(getRandomLikeReaction());
        return;
    }

    if (addLikes(message.channelId)) await message.react(emojis.Like);
    if (addVotes(message.channelId)) await message.react(emojis.Upvote).then(() => message.react(emojis.Downvote));

    await logs.logMessage(`⬆️ Adding automatic reactions to message in <#${message.channelId}>.`);
}

export async function removeReactions(messageReaction) {
    await logs.logMessage(`🗑️ Removing ❤️ reaction on message in <#${messageReaction.message.channel.id}>.`);

    await messageReaction.message.fetch();
    // Remove the like and delete emojis
    messageReaction.message.reactions.cache.get(emojiId(emojis.Like))?.remove();
    messageReaction.remove();
}

function getRandomLikeReaction() {
    const random = Math.random();

    if (random < 0.01) {
        return emojis.Yo;
    }

    return emojis.Like;
}