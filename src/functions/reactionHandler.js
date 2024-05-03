imageChannels = [
  '1235600701602791455', // Dev art
  '981527027142262824' // #Art
]

function react(message) {
  hasImage = false;
  message.attachments.forEach((attachment => {
    contentType = attachment.contentType || null;
    if (['image','video'].includes(contentType.split('/')[0])) hasImage = true;
  }));

  if (!imageChannels.includes(message.channelId)) {
    message.react('1235590078064234537');
  } else if (hasImage) message.react('1235590078064234537');
}

module.exports = { react }