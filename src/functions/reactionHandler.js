const emojis = require("../emojis.js");
const artLinks = require("./artLinks.json").links;

function react(message, reactionChannel) {
  [channelID, reactLikeToImages, reactLike, reactVotes] = reactionChannel; // (sorry)

  if (reactLikeToImages) {
    hasImage = false; // Default init of hasImage

    linkRegEx = /^https?:\/\/(www\.)?([^\/]+)\/.*$/;
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
  
  if (reactLike) message.react(emojis.like);
  if (reactVotes) {message.react(emojis.upvote); message.react(emojis.downvote)};
}

module.exports = { react }