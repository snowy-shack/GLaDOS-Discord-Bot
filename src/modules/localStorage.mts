import {promises} from "fs";
import {fileURLToPath} from "url";
import path from "path";
import {readFile, writeFile} from "node:fs/promises";
import * as logs from "#src/core/logs.mts";
import {toError, tryCatch} from "#src/core/try-catch.mts";
import {DeepValue} from "#src/core/types.mts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.join(__dirname, "../../storage");
const USERS_DIR = path.join(__dirname, "../../storage/users");
const BACKUPS_DIR = path.join(__dirname, "../../storage/backups");

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

let saveQueue: Promise<void> = Promise.resolve();

function makeBackupName(id: string) {
    return `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.json`;
}

function isPlainObject(value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
    return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

function normalizeObject<T extends Record<string, any>>(value: unknown): T {
    return isPlainObject(value) ? value as T : {} as T;
}

async function atomicWriteJson(filePath: string, data: unknown) {
    const tempPath = `${filePath}.tmp`;
    const json = JSON.stringify(data, null, 4);

    await writeFile(tempPath, json);
    await promises.rename(tempPath, filePath);
}

async function init() {
    const STORAGE_PATH = path.join(STORAGE_DIR, 'storage.json');

    await promises.mkdir(USERS_DIR, { recursive: true });
    await promises.mkdir(BACKUPS_DIR, { recursive: true });

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

    if (globalRes.error) {
        if (globalRes.error.code === 'ENOENT') {
            await atomicWriteJson(STORAGE_PATH, {});
            storage.global = {};
        } else {
            throw globalRes.error;
        }
    } else {
        storage.global = normalizeObject(globalRes.data);
    }

    if (userRes.error) throw userRes.error;
    storage.users = normalizeObject(userRes.data);
}

async function save(type: storage_type, userID?: string) {
    const isGlobal = type === 'global';
    const filePath = isGlobal
        ? path.join(STORAGE_DIR, 'storage.json')
        : path.join(USERS_DIR, `${userID}.json`);

    const backupId = isGlobal ? 'global' : userID!;
    const source = isGlobal ? storage.global : storage.users[userID!];

    if (!isGlobal && !storage.users[userID!]) return;

    const data = clone(source);

    saveQueue = saveQueue
        .catch(() => undefined)
        .then(async () => {
            try {
                await promises.mkdir(BACKUPS_DIR, { recursive: true });
                await atomicWriteJson(filePath, data);
                await atomicWriteJson(path.join(BACKUPS_DIR, makeBackupName(backupId)), data);
            } catch (error) {
                await logs.logError(
                    `saving ${type}${isGlobal ? "" : ` for user ${userID}`}`,
                    toError(error)
                );
                throw error;
            }
        });

    return saveQueue;
}

export const all_fields = getFieldList(userFields);

function getFieldList(obj: { [key: string]: string | {} }): { name: string, value: string }[] {
    let list: { name: string, value: string }[] = [];

    for (const value of Object.values(obj)) {
        if (typeof value !== 'string' && value !== null) {
            list = list.concat(
                getFieldList(value as { [key: string]: string }).map((subValue) => ({
                    name: subValue.value,
                    value: subValue.value,
                }))
            );
        } else {
            list.push({ name: value, value: value });
        }
    }

    return list;
}

export function getFieldForAllUsers(field: userField) {
    let list: { user: string; value: any }[] = [];

    for (const [userID, userData] of Object.entries(storage.users)) {
        if (field in userData) list.push({ user: userID, value: userData[field] });
    }

    return list;
}

export function getUserField(userID: string, field: userField) {
    storage.users[userID] ??= {};
    let value = storage.users[userID][field];
    if (["true", "false"].includes(value)) value = value === "true";

    return value;
}

export function getUserData(userID: string) {
    return clone(storage.users[userID]);
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
    return clone(storage.global);
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
    if (list.length === 0) return undefined;

    const entry = list.pop();
    await save('users', userID);
    console.log(`Popped \`${entry}\` from "${field}" for user ${userID}`);

    return entry;
}

export default { init, name: () => "localStorage" };