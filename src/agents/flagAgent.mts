import { promises, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import * as logs from "#src/modules/logs.mts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_DIR = path.join(__dirname, "../../userData");

try {
    await promises.mkdir(USERS_DIR);
} catch (e) {}

export const flags = {
    Ghost: "ghost",
    Security: {
        LockedUp:     "security.lockedUp",
    },
    Booster: {
        BoostingDays: "booster.boostingDays",
        Messaged:     "booster.messaged",
        Unlocked:     "booster.unlocked",
    },
    Translator: {
        Messaged:     "translator.messaged",
        Unlocked:     "translator.unlocked",
    },
    Birthday: {
        Date:         "birthday.date",
        Messaged:     "birthday.messaged",
        Unlocked:     "birthday.unlocked",
    },
    MinecraftUUID:    "minecraft.uuid",
}

export const all_flags = getFlagsList(flags);

function getFlagsList(obj: { [key: string]: string | {} }): { name: string, value: string }[] {
    let result: { name: string, value: string }[] = [];

    for (const value of Object.values(obj)) {
        if (typeof value !== 'string' && value !== null) {
            // Recursively call the function for nested objects
            result = result.concat(
                getFlagsList(value as { [key: string]: string }).map((subValue) => ({
                    name: subValue.value,
                    value: subValue.value,
                }))
            );
        } else {
            result.push({name: value, value: value});
        }
    }

    return result;
}

export async function getAllFlagValues(key: string) {
    let list = [];

    const usersList = readdirSync(USERS_DIR)
        .filter(file => file.endsWith(".json"))
        .map(name => name.split('.')[0]);

    for (let user of usersList) {
        let value = await getFlag(user, key);

        if (value) {
            list.push({ user, value });
        }
    }

    return list;
}

export async function getFlag(userId: string, key: string) {
    return (await getUserData(userId))[key];
}

export async function getUserData(userId: string) {
    const userFile = path.join(USERS_DIR, `${userId}.json`);

    try {
        const fileData = await promises.readFile(userFile, "utf8");
        return JSON.parse(fileData);
    } catch (error: any) {
        if (error?.code !== "ENOENT")
            await logs.logError(`getting user flags for user ${userId}`, error);
    }

    return {};
}

/* private */ async function saveUserData(userId: string, data: string) {
    const userFile = path.join(USERS_DIR, `${userId}.json`);

    await promises.writeFile(
        userFile,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

export async function setFlag(userId: string, key: string, value = "true") {
    const userData = await getUserData(userId);

    // Set the flag
    userData[key] = value;

    try {
        await saveUserData(userId, userData);
        console.log(`Set "${key}" for user ${userId} to`, value);
    } catch (error: any) {
        await logs.logError(`setting user flags for user '${userId}', key '${key}' and value '${value}'`, error);
    }
}

export async function removeFlag(userId: string, key: string) {
    try {
        const userData = await getUserData(userId);

        if (key in userData) {
            // Remove the flag
            delete userData[key];

            await saveUserData(userId, userData);
            console.log(`Removed "${key}" for user ${userId}`);
        } else {
            console.log(`Key "${key}" not found for user ${userId}`);
        }
    } catch (error: any) {
        await logs.logError(`removing user flag for user '${userId}', key '${key}'`, error);
    }
}

export async function addEntry(userId: string, key: string, value: string) {
    try {
        const userData = await getUserData(userId);

        if (!Array.isArray(userData[key])) {
            // noinspection ExceptionCaughtLocallyJS
            throw Error(`Tried adding entry to non-array for user '${userId}'`);
        }

        userData[key] = userData[key].push(value);

        await saveUserData(userId, userData);
        console.log(`Added \`${value}\` to "${key}" for user ${userId}`);

    } catch (error: any) {
        await logs.logError(`adding user entry for user '${userId}', and '${key}', and value '${value}'`, error);
    }
}

export async function popEntry(userId: string, key: string) {
    try {
        const userData = await getUserData(userId);

        if (!Array.isArray(userData[key])) {
            // noinspection ExceptionCaughtLocallyJS
            throw Error("Tried popping entry from non-array");
        }
        const entry = userData[key].pop();

        console.log(`Popped \`${entry}\` from "${key}" for user ${userId}`);

        return entry;
    } catch (error: any) {
        await logs.logError(`popping user entry for user '${userId}' and key '${key}'`, error);
    }
}