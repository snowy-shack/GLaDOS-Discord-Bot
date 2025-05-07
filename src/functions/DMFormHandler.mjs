import {getClient} from "#src/modules/client.mjs";
import * as database from "#src/modules/database.mjs";
import * as logs from "#src/modules/logs.mjs";
import * as skinForm from "#src/functions/skinFormHandler.mjs";
import {skinTypeFromFooter} from "#src/functions/skinFormHandler.mjs";
import {flags, setFlag} from "#src/agents/flagAgent.mjs";
import {gun_skins} from "#src/consts/gun_skins.mjs";
import {capitalize} from "#src/modules/util.mjs";
import {getMember} from "#src/modules/discord.mjs";

export async function getLastBotMessage(message) {
    let lastMessage;

    const scanMessages = await message.channel.messages.fetch({ limit: 10 })

    // Goes from top to bottom to get the latest values
    for (let message of scanMessages.reverse()) {
        message = message[1];

        try {
            if (message.embeds[0]) lastMessage = message;
        } catch (error) {
            await logs.logError("fetching embeds for DM form", error);
        }
    }

    return lastMessage;
}

export async function replyToDM(message) {
    const client = await getClient();

    let lastFormIndex = -1;
    let uuidGot = "";
    
    let lastMessage = await getLastBotMessage(message);
    if (!lastMessage) return;

    const footerText = lastMessage.embeds ? lastMessage.embeds[0].footer.text : "";

    if (lastMessage.author.id === client.application.id) {
        lastFormIndex = Math.min(parseInt(footerText?.split(' ')[1]?.split('/')[0]) || 3, 3);

        if (lastMessage.embeds[1]) {
            const uuidMatch = /UUID: (.+?)`/.exec(lastMessage.embeds[1].description);
            uuidGot = uuidMatch ? uuidMatch[1] : null;
        }
    }

    if (lastFormIndex === 2 && message.content === "confirm") {
        // const skinType = gun_skins.Booster.id;
        const skinType = skinTypeFromFooter(lastMessage);

        setFlag(message.author.id, flags.Booster.Unlocked, true);
        setFlag(message.author.id, flags.MinecraftUUID, uuidGot);

        let skinUUID = gun_skins[capitalize(skinType)].uuid;

        await database.addGunSkin(uuidGot, skinUUID);
        await logs.logMessage(`💎 Added ${skinType} skin to uuid '${uuidGot}' ${await getMember(message.author.id)}.`);
    }

    let embeds = await skinForm.respond(lastFormIndex, message.content.toLowerCase(), skinTypeFromFooter(lastMessage));

    if (embeds) {
        await message.author.send({ embeds: embeds } );
    }
}
