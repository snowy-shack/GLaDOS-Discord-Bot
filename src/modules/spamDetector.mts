import logs from "#src/core/logs.mts";
import {Message, TextChannel} from "discord.js";
import {userLockup} from "#src/actions/userLockup.mts";
import {flags, getFlag} from "#src/modules/localStorage.mts";

let scamLinks: Set<string> = new Set();

async function refreshScamURLs() {
    const linksResponse = await fetch("https://raw.githubusercontent.com/Discord-AntiScam/scam-links/refs/heads/main/list.json");
    const json: string[] = await linksResponse.json();

    json.push("discord.gg"); // Include Discord invites

    scamLinks = new Set(json);

    await logs.logMessage(`⚔️ Scam URLs refreshed. ${scamLinks.size} links found.`);
}

async function checkMessage(message: Message) {
    if (await getFlag(message.author.id, flags.Security.Whitelisted)) return;

    let linkRegEx = /^(https?:\/\/)?(www\.)?([^\/\s]+)(\/.*)?$/; // Extracts domains from links present in the message.
    const linkMatches = message.content.match(linkRegEx);

    for (let domain in linkMatches) {
        domain = linkMatches[+domain];
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