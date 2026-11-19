import {AttachmentBuilder} from "discord.js";
import * as logs from "#src/core/logs.mts";
import {toError} from "#src/core/try-catch.mts";
import {env} from "#src/core/env.mts";

const WORDLE_IMAGE_BASE = "https://wordle.portalmod.net";

// Render takes ~2-3s and the API is allowed to fail - a missing image should never block a message from sending
async function fetchImage(path: string, query: URLSearchParams, name: string): Promise<AttachmentBuilder | null> {
    try {
        // Beta gets its own image-only token so it can't take over the /ws/bot bridge from prod - falls back to the shared one for prod
        const token = env.WORDLE_IMAGE_TOKEN ?? env.WORDLE_WS_TOKEN;
        const res = await fetch(`${WORDLE_IMAGE_BASE}${path}?${query}`, {headers: {Authorization: `Bearer ${token}`}});
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Wordle image ${path} -> ${res.status}`);

        const buffer = Buffer.from(await res.arrayBuffer());
        return new AttachmentBuilder(buffer, {name});
    } catch (error) {
        await logs.logError("fetching wordle image", toError(error));
        return null;
    }
}

// guildId makes stored per-server avatars render on the results board too
export function fetchResultsImage(guildId: string, date?: string, name = "wordle-results.png") {
    const query = new URLSearchParams({guildId});
    if (date) query.set("date", date);

    return fetchImage("/api/results-image", query, name);
}

export type PlayerAvatarFallback = {
    guildId: string;
    displayName?: string;
    avatarHash?: string | null; // Global avatar hash
    guildAvatarHash?: string | null; // Per-server avatar hash, preferred by the renderer over avatarHash
};

// The Wordle server has no bot token, so it only knows a player's avatar from today's game record -
// these fallbacks are what it renders ("?" otherwise) before the player has a record for today
export function fetchPlayerImage(discordId: string, fallback: PlayerAvatarFallback, name = "wordle-player.png") {
    const query = new URLSearchParams({discordId, guildId: fallback.guildId});
    if (fallback.displayName) query.set("displayName", fallback.displayName);
    if (fallback.avatarHash) query.set("avatarHash", fallback.avatarHash);
    if (fallback.guildAvatarHash) query.set("guildAvatarHash", fallback.guildAvatarHash);

    return fetchImage("/api/player-image", query, name);
}
