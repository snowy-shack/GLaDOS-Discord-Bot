import logs from "#src/core/logs.mts";
import {Message, TextChannel} from "discord.js";
import {userLockup} from "#src/actions/userLockup.mts";
import {userFields, getUserField} from "#src/modules/localStorage.mts";

let scamLinks: Set<string> = new Set();

async function refreshScamURLs() {
    const linksResponse = await fetch("https://raw.githubusercontent.com/Discord-AntiScam/scam-links/refs/heads/main/list.json");
    const json: string[] = await linksResponse.json();

    json.push("discord.gg"); // Include Discord invites

    scamLinks = new Set(json);

    await logs.logMessage(`⚔️ Scam URLs refreshed. ${scamLinks.size} links found.`);
}

async function checkMessage(message: Message) {
    if (getUserField(message.author.id, userFields.Security.Whitelisted)) return;

    // Match URLs in the message and extract domains (group 3)
    const linkRegEx = /(?:https?:\/\/)?(?:www\.)?([^\/\s]+)(?:\/.*)?/g;
    const linkMatches = message.content.match(linkRegEx);
    if (!linkMatches) return;

    for (const match of linkMatches) {
        const domain = match.replace(/(?:https?:\/\/)?(?:www\.)?/, '').split('/')[0];
        if (scamLinks.has(domain) && message.member && message.channel instanceof TextChannel) {
            await userLockup(message.member, message.channel, message.content);
            try {
                await message.delete(); // Try to delete the message
            } catch (e) {
                await logs.logWarning(`Could not delete suspected spam message, ${e}`);
            }
        }
    }
}

export default { refreshScamURLs, checkMessage };