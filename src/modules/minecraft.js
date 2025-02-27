import fetch from "node-fetch";

export async function getUuid(username) {
    fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        .then(res => res.json())
        .then(json => {
            return({
                uuid: json.id,
                username: json.name
            });
        });
}

export function getSkin(uuid) {
    return `https://mc-heads.net/head/${uuid}/600.png`;
}