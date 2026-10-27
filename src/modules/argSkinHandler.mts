import {Message} from "discord.js";
import * as guild from "#src/core/discord.mts";
import * as skinForm from "#src/modules/skinFormHandler.mts";
import {KNOWN_SKINS} from "#src/modules/portalGunSkinLoader.mts";
import {getGlobalField, setGlobalField, globalFields, getUserField, userField} from "#src/modules/localStorage.mts";
import * as logs from "#src/core/logs.mts";
import {isBeta} from "#src/envloader.mts";

const k = 246813579;
const v = (s: string) => /^\d{10}$/.test(s) && [...s].reduceRight((a, c, i) => a + (i & 1 ? +c : ~~(k / 10 ** (9 - +c)) % 10), 0) % 10 == 0;

// Format: argskin:<card-number>:<user-id>
export async function handleArgSkin(message: Message) {
    if (message.channelId != (isBeta ? "1557507901231341618" : "1488965114475319427")) return;
    if (!message.content.startsWith("argskin:")) return;

    const [, cardNumber, userId] = message.content.split(":");
    if (!cardNumber || !userId) return;

    const usedCodes: string[] = getGlobalField(globalFields.Security.UsedTestingCodes) ?? [];
    if (usedCodes.includes(cardNumber)) return; // Already redeemed, one-shot only

    await setGlobalField(globalFields.Security.UsedTestingCodes, [...usedCodes, cardNumber]);

    if (!v(cardNumber)) return;

    const alreadyUnlocked = getUserField(userId, `${KNOWN_SKINS.Redacted}.unlocked` as userField);
    if (alreadyUnlocked) return;

    const member = await guild.getMember(userId);
    if (!member) return;

    await skinForm.sendFormMessage(member.user, 0, undefined, KNOWN_SKINS.Redacted);
    await logs.logMessage(`🃏 Redeemed testing code for <@${userId}>, sent the ??? skin form.`);
}
