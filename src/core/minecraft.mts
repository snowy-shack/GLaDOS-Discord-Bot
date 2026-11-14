import fetch from "node-fetch";
import {delayInMilliseconds} from "#src/core/util.mts";

export type MinecraftPlayer = { uuid: string; username: string };
export type PlayerSkins = { default_color: number; skins: string[] };

export async function getMinecraftPlayer(username: string, retrying = false): Promise<MinecraftPlayer | undefined> {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);

    if (response.status === 404) return undefined; // No such player

    // Hit them back
    if (response.status === 429 && !retrying) {
        await delayInMilliseconds(2000 + Math.random() * 1500);
        return getMinecraftPlayer(username, true);
    }

    if (!response.ok) throw new Error(`Minecraft player lookup failed with status ${response.status}`);

    const ObjectJSON = await response.json();

    return {
        uuid: ObjectJSON.id,
        username: ObjectJSON.name
    }
}

export function getSkin(uuid: string): string {
    return `https://mc-heads.net/head/${uuid}/600.png`;
}

export async function getPlayerSkins(uuid: string): Promise<PlayerSkins> {
    const response = await fetch(`https://api.portalmod.net/v1/player/${encodeURIComponent(uuid)}`);

    if (!response.ok) throw new Error(`Player skin lookup failed with status ${response.status}`);

    return await response.json();
}
