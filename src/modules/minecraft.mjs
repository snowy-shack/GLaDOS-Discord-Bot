import fetch from "node-fetch";
import * as logs from "#src/modules/logs.mjs";

export async function getAccount(username) {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

    if (!response.ok) {
        await logs.logError("fetching Minecraft user", response.statusText);
    }

    const ObjectJSON = await response.json();

    return {
        uuid: ObjectJSON.id,
        username: ObjectJSON.name
    }
}

export function getSkin(uuid) {
    return `https://mc-heads.net/head/${uuid}/600.png`;
}