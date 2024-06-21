const emojis = require("../emojis.js");

function react(message, reactionChannel) {
  [channelID, reactLikeToImages, reactLike, reactVotes] = reactionChannel; // (sorry)

  if (reactLikeToImages) {
    hasImage = false;
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