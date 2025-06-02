import logs from "#src/modules/logs.mjs";
import {Message, TextChannel} from "discord.js";
import {userLockup} from "#src/actions/userLockup.mjs";

let scamLinks: Set<string> = new Set();

async function refreshScamURLs() {
    const linksResponse = await fetch("https://raw.githubusercontent.com/Discord-AntiScam/scam-links/refs/heads/main/list.json");
    const json: string[] = await linksResponse.json();
    scamLinks = new Set(json);

    await logs.logMessage(`⚔️ Scam URLs refreshed. ${scamLinks.size} links found.`);
}

async function checkMessage(message: Message) {
    let linkRegEx = /https?:\/\/(www\.)?([^\/]+)\/.*$/; // Extracts domains from links present in the message.
    const linkMatches = message.content.match(linkRegEx);

    if (linkMatches) {
        const domain = linkMatches[2];

        if (scamLinks.has(domain) &&  message.member && message.channel instanceof TextChannel)
            await userLockup(message.member, message.channel);
    }
}

export default { refreshScamURLs, checkMessage };