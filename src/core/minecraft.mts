import fetch from "node-fetch";

export type MinecraftPlayer = { uuid: string; username: string };
export type PlayerSkins = { default_color: number; skins: string[] };

export async function getMinecraftPlayer(username: string): Promise<MinecraftPlayer> {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);

    if (!response.ok) return { uuid: '', username: '' }; // TODO this is terrible

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
