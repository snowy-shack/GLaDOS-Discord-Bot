import {getClient} from "#src/modules/client";
import * as database from "#src/modules/database";
import * as logs from "#src/modules/logs";
import * as skinForm from "#src/functions/skinFormHandler";
import {skinTypeFromFooter} from "#src/functions/skinFormHandler";

export async function replyToDM(message) {
    const client = await getClient();

    let lastFormIndex = -1;
    let formResponse = "";
    let uuidGot = "";

    // Booster skin form handling
    const scanMessages = await message.channel.messages.fetch({ limit: 10 })

    // Goes from top to bottom to get the latest values
    for (let message of scanMessages.reverse()) {
        message = message[1];

        try {
            const footerText = (message.embeds[0]) ? message.embeds[0].footer.text : "";

            if (message.author.id === client.application.id) {
                lastFormIndex = Math.min(parseInt(footerText?.split(' ')[1]?.split('/')[0]) || 3, 3);

                if (message.embeds[1] !== undefined) {
                    const uuidMatch = /UUID: (.+?)`/.exec(message.embeds[1].description);
                    uuidGot = uuidMatch ? uuidMatch[1] : null;
                }

            } else {
                formResponse = message.content;
            }
        } catch (error) {
            await logs.logError("handling DM form", error);
        }
    }

    if (lastFormIndex === 2 && formResponse === "confirm") {
        const skinType = skinTypeFromFooter(message);

        await database.addGunSkin(uuidGot, skinType);
        await logs.logMessage(`💎 Added ${skinType} skin to uuid '${uuidGot}' \`<@${message.author.id}>\`.`);

        lastFormIndex = -2; // Throw error message TODO what?
    }

    let formMessageEmbeds = await skinForm.respond(lastFormIndex, formResponse.toLowerCase(), "booster");

    if (formMessageEmbeds) {
        await message.author.send({ embeds: formMessageEmbeds } );
    }
}
