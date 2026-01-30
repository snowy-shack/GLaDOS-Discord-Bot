import { promises } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import {readFile, writeFile} from "node:fs/promises";
import {tryCatch} from "#src/core/try-catch.mts";
import {logError} from "#src/core/logs.mts";
import {DeepValue} from "#src/core/types.mts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.join(__dirname, "../../storage");
const USERS_DIR = path.join(__dirname, "../../storage/users");

const storage_types = {
    Global: 'global',
    Users: 'users',
} as const;

export const userFields = {
    Ghost: "ghost",
    Security: {
        LockedUp:     "security.lockedUp",
        Whitelisted:  "security.whitelisted",
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
    Wordle: {
        Streak:       "wordle.streak",
        LastPlayed:   "wordle.last_played",
        LastScore:    "wordle.last_score",
        Solves1:      "wordle.solves_1",
        Solves2:      "wordle.solves_2",
        Solves3:      "wordle.solves_3",
        Solves4:      "wordle.solves_4",
        Solves5:      "wordle.solves_5",
        Solves6:      "wordle.solves_6",
        SolvesX:      "wordle.solves_X",
    }
} as const;

export const globalFields = {
    Wordle: {
        GamesTracked:  "wordle.games_tracked"
    }
} as const;

export type userField = DeepValue<typeof userFields>
export type globalField = DeepValue<typeof globalFields>
// type field = userField | globalField;
export type storage_type = DeepValue<typeof storage_types>

let storage: {
    global: Partial<Record<globalField, any>>,
    users: Record<string, Partial<Record<userField, any>>>
} = {
    global: {},
    users: {},
};

async function init() {
    const STORAGE_PATH = path.join(STORAGE_DIR, 'storage.json');

    // Ensure directories exist
    await promises.mkdir(USERS_DIR, { recursive: true });

    // Load global & user data in parallel
    const [globalRes, userRes] = await Promise.all([
        tryCatch<any, NodeJS.ErrnoException>(readFile(STORAGE_PATH, 'utf-8').then(JSON.parse)),
        tryCatch((async () => {
            const files = await promises.readdir(USERS_DIR);
            const data: Record<string, any> = {};
            for (const file of files) {
                if (!file.endsWith('.json')) continue;
                data[path.parse(file).name] = JSON.parse(await readFile(path.join(USERS_DIR, file), 'utf-8'));
            }
            return data;
        })())
    ]);

    // Handle Global
    if (globalRes.error) {
        if (globalRes.error.code === 'ENOENT') {
            await writeFile(STORAGE_PATH, '{}');
            storage.global = {};
        } else throw globalRes.error;
    } else {
        storage.global = globalRes.data;
    }

    // Handle Users
    if (userRes.error) throw userRes.error;
    storage.users = userRes.data;
}

async function save(type: storage_type, userID?: string) {
    const isGlobal = type === 'global';
    const filePath = isGlobal
        ? path.join(STORAGE_DIR, 'storage.json')
        : path.join(USERS_DIR, `${userID}.json`);

    const data = isGlobal ? storage.global : storage.users[userID!];

    // Use tryCatch to handle potential write/circular reference errors
    const result = await tryCatch(writeFile(filePath, JSON.stringify(data, null, 4)));

    if (result.error) {
        const userCause = userID ? `, for user ${userID}` : "";
        await logError(`writing '${type}' storage ${userCause}`, result.error);
    }
}

export const all_fields = getFieldList(userFields);

// This is used by the command to display "options"
function getFieldList(obj: { [key: string]: string | {} }): { name: string, value: string }[] {
    let result: { name: string, value: string }[] = [];

    for (const value of Object.values(obj)) {
        if (typeof value !== 'string' && value !== null) {
            // Recursively call the function for nested objects
            result = result.concat(
                getFieldList(value as { [key: string]: string }).map((subValue) => ({
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

export function getFieldForAllUsers(field: userField) {
    let list = [];

    for (let [userID, userData] of Object.entries(storage.users)) {
        if (userData[field]) list.push({ user: userID, value: userData[field] });
    }

    return list;
}

export function getUserField(userID: string, field: userField) {
    storage.users[userID] ??= {};
    let value = storage.users[userID][field];
    if (["true", "false"].includes(value)) value = value === "true"; // Replace "<bool>" with actual booleans

    return value;
}

export function getUserData(userID: string) {
    return storage.users[userID];
}

export async function setUserField(userID: string, field: userField, newValue: any = "true") {
    storage.users[userID] ??= {};

    // If value is already set, don't replace it
    if (storage.users[userID][field] == newValue) return;

    storage.users[userID][field] = newValue;

    await save('users', userID);
    console.log(`Set "${field}" for user ${userID} to`, newValue);
}

export function getGlobalField(field: globalField) {
    let value = storage.global[field];
    if (["true", "false"].includes(value)) value = value === "true";

    return value;
}

export function getGlobalData() {
    return storage.global;
}

export async function setGlobalField(field: globalField, newValue: any = "true") {
    // If value is already set, don't replace it
    if (storage.global[field] === newValue) return;

    storage.global[field] = newValue;

    await save('global');
    console.log(`Set global field "${field}" to`, newValue);
}

export async function removeUserField(userID: string, field: userField) {
    storage.users[userID] ??= {};

    if (field in storage.users[userID]) {
        delete storage.users[userID][field];
        await save('users', userID);
        console.log(`Removed "${field}" for user ${userID}`);
    } else {
        console.log(`Key "${field}" not found for user ${userID}`);
    }
}

export async function addEntry(userID: string, field: userField, value: any) {
    const userData = (storage.users[userID] ??= {});
    const list = userData[field];

    if (!Array.isArray(list)) throw Error(`Field "${field}" is not an array for user ${userID}`);

    list.push(value);
    await save('users', userID);
    console.log(`Added \`${value}\` to "${field}" for user ${userID}`);
}

export async function popEntry(userID: string, field: userField) {
    const list = storage.users[userID]?.[field];

    if (!Array.isArray(list)) throw Error(`Field "${field}" is not an array for user ${userID}`);

    const entry = list.pop();
    await save('users', userID);
    console.log(`Popped \`${entry}\` from "${field}" for user ${userID}`);

    return entry;
}

export default { init };