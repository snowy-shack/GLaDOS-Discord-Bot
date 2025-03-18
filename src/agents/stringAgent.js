import { emojis } from "#src/consts/phantys_home";

export async function string(key, local = "en_us") {
    const strings = await import(`#src/consts/strings/${local}.json`, { assert: { type: "json" } });

    const string = strings.default[key] ? strings.default[key] : "[undefined string]";

    // Emojis
    return string.replace(/\$(\w+)\$/g, (match, key) => {
        return key in emojis ? emojis[key] : match; // Keep original if key is missing
    });
}

export async function templateString(key, replacements, local = "en_us") {
    const base = await string(key, local);

    // String templates
    return base.replace(/%(\d+)%/g, (match, num) => {
        const index = parseInt(num, 10) - 1;
        return replacements[index] ? replacements[index] : match; // Keep original if out of range
    });
}