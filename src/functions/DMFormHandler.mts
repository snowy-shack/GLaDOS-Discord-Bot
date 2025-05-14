import {getClient} from "#src/modules/client.mts";
import * as database from "#src/modules/database.mts";
import * as logs from "#src/modules/logs.mts";
import * as skinForm from "#src/functions/skinFormHandler.mts";
import {skinTypeFromFooter} from "#src/functions/skinFormHandler.mts";
import {flags, setFlag} from "#src/agents/flagAgent.mts";
import {gun_skins} from "#src/consts/gun_skins.mts";
import {capitalize} from "#src/modules/util.mts";
import {getMember} from "#src/modules/discord.mts";
import {Message} from "discord.js";

export async function getLastBotMessage(message: Message): Promise<Message | undefined> {
    let lastMessage;

    const scanMessages = (await message.channel.messages.fetch({ limit: 10 })).reverse();

    // Goes from top to bottom to get the latest values
    for (let scanMessage of scanMessages) {
        const message = scanMessage[1];

        try {
            if (message.embeds[0]) lastMessage = message;
        } catch (error: any) {
            await logs.logError("fetching embeds for DM form", error);
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

        if (lastMessage.embeds[1].description) {
            const uuidMatch = /UUID: (.+?)`/.exec(lastMessage.embeds[1].description);
            uuidGot = uuidMatch ? uuidMatch[1] : "";
        }
    }

    if (lastFormIndex === 2 && message.content === "confirm") {
        // const skinType = gun_skins.Booster.id;
        const skinType = skinTypeFromFooter(lastMessage);
        if (!skinType) {
            await logs.logError("replyToDM:55", new Error("No skin type found in footer"));
            return;
        }

        void setFlag(message.author.id, flags.Booster.Unlocked, "true");
        void setFlag(message.author.id, flags.MinecraftUUID, uuidGot);

        let skinID = gun_skins[capitalize(skinType)].id;

        await database.addGunSkin(uuidGot, skinID);
        await logs.logMessage(`💎 Added ${skinType} skin to uuid '${uuidGot}' ${await getMember(message.author.id)}.`);
    }

    let embeds = await skinForm.respond(lastFormIndex, message.content.toLowerCase(), skinTypeFromFooter(lastMessage));

    if (embeds) {
        await message.author.send({ embeds: embeds } );
    }
}
