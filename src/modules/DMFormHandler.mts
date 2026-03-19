import {getClient} from "#src/core/client.mts";
import * as database from "#src/core/database.mts";
import * as logs from "#src/core/logs.mts";
import * as skinForm from "#src/modules/skinFormHandler.mts";
import {skinTypeFromFooter} from "#src/modules/skinFormHandler.mts";
import {userFields, setUserField, userField} from "#src/modules/localStorage.mts";
import { getMember } from "#src/core/discord.mts";
import { toError } from "#src/core/try-catch.mts";
import { Message } from "discord.js";
import {getGunSkin} from "#src/modules/portalGunSkinLoader.mts";

export async function getLastBotMessage(message: Message): Promise<Message | undefined> {
    let lastMessage;

    const scanMessages = (await message.channel.messages.fetch({ limit: 10 })).reverse();

    // Goes from top to bottom to get the latest values
    for (let [_, message] of scanMessages) {

        try {
            if (message.embeds.length > 0) lastMessage = message;
        } catch (error: unknown) {
            await logs.logError("fetching embeds for DM form", toError(error));
        }
    }

    return lastMessage;
}

export async function replyToDM(message: Message) {
    const client = await getClient();

    let lastFormIndex = -1;
    let uuidGot: string | null = "";
    
    let lastMessage = await getLastBotMessage(message);
    if (!lastMessage) return;

    const footerText = lastMessage.embeds?.[0]?.footer?.text || "";

    if (client.application && lastMessage.author.id === client.application.id) {
        lastFormIndex = Math.min(parseInt(footerText?.split(' ')[1]?.split('/')[0]) || 3, 3);

        if (lastMessage.embeds[1] && lastMessage.embeds[1].description) {
            const uuidMatch = /UUID: (.+?)`/.exec(lastMessage.embeds[1].description);
            uuidGot = uuidMatch ? uuidMatch[1] : "";
        }
    }

    if (lastFormIndex === 2 && message.content === "confirm") {
        const skinType = skinTypeFromFooter(lastMessage);
        if (!skinType) {
            await logs.logError("processing 'confirm' of skin form", new Error("No skin type found in footer"));
            return;
        }

        void setUserField(message.author.id, `${skinType}.unlocked` as userField, "true");
        void setUserField(message.author.id, userFields.MinecraftUUID, uuidGot);

        let skinID = (await getGunSkin(skinType))?.skin_id;

        if (!skinID) {
            await logs.logError("processing 'confirm' of skin form", Error("Portal gun skin ID was not found in fetched"));
            return;
        }

        await database.addGunSkin(uuidGot, skinID);
        await logs.logMessage(`💎 Added ${skinType} skin to uuid '${uuidGot}' ${await getMember(message.author.id)}.`);
    }

    let embeds = await skinForm.createResponseEmbed(lastFormIndex, message.content.toLowerCase(), skinTypeFromFooter(lastMessage));

    if (embeds) {
        await message.author.send({ embeds: embeds } );
    }
}
