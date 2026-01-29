import {Client, Events} from "discord.js";
import {addLikesToMedia, serverEmojis} from "#src/core/phantys_home.mts";
import {removeReactions} from "#src/modules/autoEmojiReactions.mts";

export function init(client: Client) {
    // Emoji reaction handling
    client.on(Events.MessageReactionAdd, async (reaction, author) => {
        // Fetch message in channel by ID
        const message = await reaction.message.channel.messages.fetch(reaction.message.id);

        // If user adds Delete to their message, remove likes
        if (addLikesToMedia(reaction.message.channelId)
            && reaction.emoji.id === serverEmojis.Delete
            && author.id === message.author.id) {

            await removeReactions(reaction);
        }
    });
}