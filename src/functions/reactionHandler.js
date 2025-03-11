import emojis from "#src/consts/emojis";
import artLinks from "#src/consts/links/art_links.json" with { type: "json" };
import * as logs from "#src/modules/logs";

/**
 * Module for automatic emoji reactions on messages
 * @param message
 * @param reactionChannel
 * @returns {Promise<void>}
 */
export async function react(message, reactionChannel) {
    // This is fucked up, but it's convenient and it works.
    let [channelID, reactLikeToImages, reactLike, reactVotes] = reactionChannel;

    if (reactLikeToImages) {
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
    }

    if (reactLike)
        await message.react(emojis.like);
    if (reactVotes)
        await message.react(emojis.upvote).then(() => message.react(emojis.downvote));
    if (!reactLikeToImages)
        await logs.logMessage(`⬆️ Adding automatic reactions to \`<#${channelID}>\``);
}

export async function removeReactions(messageReaction, bySameUser) {
    if (bySameUser) {
        await logs.logMessage(`🗑️ Removing ❤️ reaction on message in \`<#${messageReaction.message.channel.id}>\`.`);

        messageReaction.message.reactions.cache.get('1235590078064234537')?.remove(); // Dev
        messageReaction.message.reactions.cache.get('1264163067655229510')?.remove(); // Main
    }
    messageReaction.remove();
}

function getRandomLikeReaction() {
    const random = Math.random();

    if (random < 0.01) {
        return emojis.yo;
    }

    return emojis.like;
}