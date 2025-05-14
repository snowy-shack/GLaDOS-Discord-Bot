import { emojis } from "#src/consts/phantys_home.mts";
import {Locale} from "discord-api-types/v10";

export async function string(key: string, local: Locale = Locale.EnglishUS) {
    const strings = await import(`#src/consts/strings/${local}.json`, { assert: { type: "json" } });

    const string = strings.default[key] ? strings.default[key] : "[undefined string]";

    // Emojis
    return string.replace(/\$(\w+)\$/g, (match: string, key: string) => {
        return key in emojis ? emojis[key] : match; // Keep original if key is missing
    });
}

export async function templateString(key: string, replacements: string[], local: Locale = Locale.EnglishUS) {
    const base = await string(key, local);

    // String templates
    return base.replace(/%(\d+)%/g, (match: string, num: string) => {
        const index = parseInt(num, 10) - 1;
        // Keep original if out of range
        return replacements[index] !== undefined ? replacements[index] : match; // Explicitly check for undefined (#4)
    });
}