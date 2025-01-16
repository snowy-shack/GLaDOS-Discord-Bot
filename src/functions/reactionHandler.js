const emojis = require("../consts/emojis.js");
const artLinks = require("./art_links.json").links;
const logs = require("../logs");

// For clarity, this module is for automatic emoji reactions on messages

async function react(message, reactionChannel) {
  [channelID, reactLikeToImages, reactLike, reactVotes] = reactionChannel; // (sorry)

  if (reactLikeToImages) {
    hasImage = false;

    linkRegEx = /https?:\/\/(www\.)?([^\/]+)\/.*$/; // Extracts domains from links present in the message.
    const linkMatches = message.content.match(linkRegEx);
    if (linkMatches) {
      const domain = linkMatches[2];
      if (artLinks.includes(domain)) hasImage = true;
    }

    message.attachments.forEach((attachment => {
      contentType = attachment.contentType || null;
      if (['image','video'].includes(contentType.split('/')[0])) hasImage = true;
    }));
    if (hasImage) message.react(emojis.like);
  }
  
  if (reactLike) await message.react(emojis.like);
  if (reactVotes) { await message.react(emojis.upvote).then(() => message.react(emojis.downvote))};
  if (!reactLikeToImages) logs.logMessage(`⬆️ Adding automatic reactions to \`<#${channelID}>\``);
}

async function removeReactions(messageReaction, bySameUser) {
  if (bySameUser) {
    logs.logMessage(`🗑️ Removing ❤️ reaction on message in \`<#${messageReaction.message.channel.id}>\`.`);
    messageReaction.message.reactions.cache.get('1235590078064234537')?.remove(); // Dev
    messageReaction.message.reactions.cache.get('1264163067655229510')?.remove(); // Main
  }
  messageReaction.remove();
}

module.exports = { react, removeReactions }