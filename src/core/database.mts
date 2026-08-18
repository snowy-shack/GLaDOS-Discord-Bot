import * as logs from "#src/core/logs.mts";

export async function addGunSkin(userID: string, minecraftUuid: string, skinUUID: string) {
    const response = await fetch(`https://api.portalmod.net/v1/players/${minecraftUuid}/skins`, {
        method: "post",
        headers: {
            "Authorization": `Bearer ${process.env.PM_API_BEARER}`
        },
        body: JSON.stringify({
            "skin_id": skinUUID
        }),
    });

    const errorLog = `❌ Failed to apply skin \`${skinUUID}\` to <@${userID}> \`${minecraftUuid}\`: ${response.status}`;

    if(response.status == 400 || response.status == 401) {
        await logs.logMessage(`${errorLog} ${(await response.json()).error}`);
        throw new Error();
    }

    if(response.status != 201) {
        await logs.logMessage(`${errorLog} ${response.body}`);
        throw new Error();
    }
}