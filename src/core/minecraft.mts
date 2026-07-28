import fetch from "node-fetch";

export async function getAccount(username: string): Promise<{uuid: string, username: string}> {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

    if (!response.ok) return { uuid: '', username: '' };

    const ObjectJSON = await response.json();

    return {
        uuid: ObjectJSON.id,
        username: ObjectJSON.name
    }
}

export function getSkin(uuid: string): string {
    return `https://mc-heads.net/head/${uuid}/600.png`;
}