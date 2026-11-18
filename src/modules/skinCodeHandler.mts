import {Message} from "discord.js";
import * as guild from "#src/core/discord.mts";
import * as skinForm from "#src/modules/skinFormHandler.mts";
import {KNOWN_SKINS} from "#src/modules/portalGunSkinLoader.mts";
import {getGlobalField, setGlobalField, globalFields, getUserField, userField} from "#src/modules/localStorage.mts";
import * as logs from "#src/core/logs.mts";
import {isBeta} from "#src/envloader.mts";

const k = 246813579;
const isArgCard = (s: string) => /^\d{10}$/.test(s) && [...s].reduceRight((a, c, i) => a + (i & 1 ? +c : ~~(k / 10 ** (9 - +c)) % 10), 0) % 10 == 0;

// ISBN-10: 9 digits + check digit (0-9 or X = 10), weighted 10..1, sum divisible by 11
const isIsbn10 = (s: string) => /^\d{9}[\dX]$/.test(s) && [...s].reduce((a, c, i) => a + (c == "X" ? 10 : +c) * (10 - i), 0) % 11 == 0;

interface SkinCode {
    prefix: string;
    skin: string;
    label: string; // Shown in the log message
    isValid: (code: string) => boolean;
    usedKey: (code: string) => string; // Entry stored in UsedTestingCodes
}

const SKIN_CODES: SkinCode[] = [
    // argskin entries are stored raw because they predate the other prefixes
    {prefix: "argskin", skin: KNOWN_SKINS.Redacted, label: "???", isValid: isArgCard, usedKey: (code) => code},
    {prefix: "fruitskin", skin: KNOWN_SKINS.Fruit, label: "fruit", isValid: isIsbn10, usedKey: (code) => `fruitskin:${code}`},
];

// Format: <prefix>:<code>:<user-id>
export async function handleSkinCode(message: Message) {
    if (message.channelId != (isBeta ? "1557507901231341618" : "1488965114475319427")) return;

    const [prefix, rawCode, userId] = message.content.split(":");
    const type = SKIN_CODES.find((t) => t.prefix == prefix);
    if (!type || !rawCode || !userId) return;

    const code = rawCode.toUpperCase();
    const usedCodes: string[] = getGlobalField(globalFields.Security.UsedTestingCodes) ?? [];
    if (usedCodes.includes(type.usedKey(code))) return; // Already redeemed, one-shot only

    await setGlobalField(globalFields.Security.UsedTestingCodes, [...usedCodes, type.usedKey(code)]);

    if (!type.isValid(code)) return;

    const alreadyUnlocked = getUserField(userId, `${type.skin}.unlocked` as userField);
    if (alreadyUnlocked) return;

    const member = await guild.getMember(userId);
    if (!member) return;

    await skinForm.sendFormMessage(member.user, 0, undefined, type.skin);
    await logs.logMessage(`🃏 Redeemed testing code for <@${userId}>, sent the ${type.label} skin form.`);
}
