const skinForm = require("./skinFormHandler");
const logs = require("../logs");
const database = require("../database");

async function handleDM(message) {
  const client = await require("../client");


  // Booster skin form handling
  message.channel.messages.fetch({ limit: 10 }).then(async scanMessages => {
    previousField = -1;

    // Goes from top to bottom to get the latest values
    scanMessages.reverse().forEach(scannedMessage => {
      try {
        footerText = (typeof scannedMessage.embeds[0] != 'undefined') ? scannedMessage.embeds[0].footer.text : '';
        if (scannedMessage.author.id == client.application.id) {

          const fieldIndex = parseInt(footerText.split(' ')[1].split('/')[0]) || 3;
          previousField = Math.min(fieldIndex, 3);
          try {
            const match = /UUID: (.+?)\`/.exec(scannedMessage.embeds[1].description);
            uuidGot = match ? match[1] : null;
          } catch (error) {};
          
        } else {fieldValue = scannedMessage.content}
      } catch (error) { console.error(error) };
    })
    // console.log('previousField: ', previousField, 'fieldValue: ', fieldValue);
    if (previousField == 2 && fieldValue == 'confirm') {

      // update database here
      await database.addGunSkin(uuidGot, "booster");
      logs.logMessage(`💎 Added booster skin to uuid '${uuidGot}' \`<@${message.author.id}>\`.`);

      previousField == -2; //Throw error message
    }

    formMessageEmbeds = await skinForm.respond(previousField, fieldValue.toLowerCase(), 'booster');
    if (typeof formMessageEmbeds != 'undefined') {
      // skinForm.sendFormMessage(message.author, previousField, fieldValue.toLowerCase());
      message.author.send({ embeds: formMessageEmbeds });
    }
  })
} 

module.exports = { handleDM }