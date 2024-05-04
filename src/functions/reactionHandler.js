imageChannels = [
  '1235600701602791455', // Dev art
  '981527027142262824' // #Art
]

const emojis = require("../emojis.js");

function react(message) {
  hasImage = false;
  message.attachments.forEach((attachment => {
    contentType = attachment.contentType || null;
    if (['image','video'].includes(contentType.split('/')[0])) hasImage = true;
  }));

  if (!imageChannels.includes(message.channelId)) {
    message.react(emojis.like);
  } else if (hasImage) message.react(emojis.like);
}

module.exports = { react }