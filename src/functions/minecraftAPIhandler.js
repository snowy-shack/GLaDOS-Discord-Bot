import fetch from "node-fetch";

export async function getUuid(username) {
    let usernameNew = username;
    let uuid = "";

    const url = `https://api.minecraftservices.com/minecraft/profile/lookup/name/${username}`;
    await fetch(url)
        .then(res => res.json())
        .then(json => {
            uuid = `${json.id.slice(0, 8)}-${json.id.slice(8, 12)}-${json.id.slice(12, 16)}-${json.id.slice(16, 20)}-${json.id.slice(20)}`; // Formatting with dashes
            usernameNew = json.name;
        });

    return({
        uuid: uuid,
        username: await usernameNew
    });
}

export async function getSkin(uuid) {
    return `https://mc-heads.net/head/${uuid}/600.png`;
}