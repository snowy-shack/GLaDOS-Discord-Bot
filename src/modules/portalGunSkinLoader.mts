import { tryCatch } from "#src/core/try-catch.mts";
import logs from "#src/core/logs.mts";

type Skin = {
    skin_id: string;
    name: string;
    description: string;
    artist?: string;
};

export const KNOWN_SKINS: { [key: string]: string } = {
    Birthday: "birthday",
    Booster: "booster",
}

let gun_skins: Record<string, Skin> = {};
let all_skins: { name: string; value: string }[] = [];

const loadPromise = fetchSkins();

export async function fetchSkins(): Promise<void> {
    const { data, error } = await tryCatch<Skin[]>(
        fetch("https://api.portalmod.net/v1/skins").then((res) => res.json())
    );

    if (error) {
        await logs.logError("fetching skins", error);
        return;
    }

    gun_skins = Object.fromEntries(
        data.map((skin) => [skin.skin_id, skin])
    );

    all_skins = data.map((skin) => ({
        name: skin.name,
        value: skin.skin_id,
    }));
}

export async function getGunSkins() {
    await loadPromise;
    return gun_skins;
}

export async function getAllSkins() {
    await loadPromise;
    return all_skins;
}

export async function getGunSkin(skin_id: string): Promise<Skin | undefined> {
    await loadPromise;
    return Object.values(gun_skins).find(skin => skin.skin_id === skin_id);
}

export default { fetchSkins }