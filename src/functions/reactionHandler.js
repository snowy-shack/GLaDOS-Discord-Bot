const emojis = require("../emojis.js");
const artLinks = require("./art_links.json").links;
const logs = require("../logs");

async function react(message, reactionChannel) {
  [channelID, reactLikeToImages, reactLike, reactVotes] = reactionChannel; // (sorry)

  if (reactLikeToImages) {
    hasImage = false; // Default init of hasImage

    linkRegEx = /https?:\/\/(www\.)?([^\/]+)\/.*$/;
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
  if (reactVotes) {message.react(emojis.upvote).then(() => message.react(emojis.downvote))};
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