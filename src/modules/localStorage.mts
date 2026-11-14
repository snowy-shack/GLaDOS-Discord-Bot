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
        FirstPlayed:  "wordle.first_played",
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
        GamesTracked:    "wordle.games_tracked",
        ServerStreak:    "wordle.server_streak",
        ServerLastPlayed: "wordle.server_last_played",
    },
    Security: {
        AllowedDomains: "security.allowedDomains",
        UsedTestingCodes: "security.usedTestingCodes"
    },
    Github: {
        InfinityButtonsIssue10Notified: "github.infinityButtonsIssue10Notified"
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

// Storage loads in parallel with the Discord client, so events can arrive before init() is done.
// Writing in that window saves a still-empty entry over the user's file (lost data on 2026-10-09).
// Writers wait for `storageReady`, readers throw instead of returning empty data, and save()
// refuses outright. If init() fails, storageReady never resolves: nothing gets written.
let isReady = false;
let markReady!: () => void;
export const storageReady: Promise<void> = new Promise(resolve => { markReady = resolve; });

export function isStorageReady() {
    return isReady;
}

function assertReady(action: string) {
    if (!isReady) throw new Error(`Storage ${action} before it finished loading`);
}

const USER_LOAD_CONCURRENCY = 16;

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
        tryCatch(loadUserFiles())
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

    isReady = true;
    markReady();
}

// Reads user files a few at a time instead of one by one; any unreadable file still fails the whole load.
async function loadUserFiles() {
    const files = (await promises.readdir(USERS_DIR)).filter(file => file.endsWith('.json'));
    const data: Record<string, any> = {};
    let next = 0;

    async function worker() {
        while (next < files.length) {
            const file = files[next++];
            const contents = await readFile(path.join(USERS_DIR, file), 'utf-8');
            try {
                data[path.parse(file).name] = JSON.parse(contents);
            } catch (error) {
                throw new Error(`Could not parse user file ${file}: ${toError(error).message}`);
            }
        }
    }

    await Promise.all(Array.from({ length: Math.min(USER_LOAD_CONCURRENCY, files.length) }, worker));
    return data;
}

async function save(type: storage_type, userID?: string) {
    assertReady("saved");

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
    assertReady("read");
    let list: { user: string; value: any }[] = [];

    for (const [userID, userData] of Object.entries(storage.users)) {
        if (field in userData) list.push({ user: userID, value: userData[field] });
    }

    return list;
}

export function getUserField(userID: string, field: userField) {
    assertReady("read");
    storage.users[userID] ??= {};
    let value = storage.users[userID][field];
    if (["true", "false"].includes(value)) value = value === "true";

    return value;
}

export function getUserData(userID: string) {
    assertReady("read");
    return clone(storage.users[userID]);
}

export async function setUserField(userID: string, field: userField, newValue: any = "true") {
    // Only awaits during boot, so writes after boot still apply synchronously and in call order
    if (!isReady) await storageReady;
    storage.users[userID] ??= {};

    // If value is already set, don't replace it
    if (storage.users[userID][field] == newValue) return;

    storage.users[userID][field] = newValue;

    await save('users', userID);
    console.log(`Set "${field}" for user ${userID} to`, newValue);
}

export function getGlobalField(field: globalField) {
    assertReady("read");
    let value = storage.global[field];
    if (["true", "false"].includes(value)) value = value === "true";

    return value;
}

export function getGlobalData() {
    assertReady("read");
    return clone(storage.global);
}

export async function setGlobalField(field: globalField, newValue: any = "true") {
    if (!isReady) await storageReady;

    // If value is already set, don't replace it
    if (storage.global[field] === newValue) return;

    storage.global[field] = newValue;

    await save('global');
    console.log(`Set global field "${field}" to`, newValue);
}

export async function removeUserField(userID: string, field: userField) {
    if (!isReady) await storageReady;
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
    if (!isReady) await storageReady;
    const userData = (storage.users[userID] ??= {});
    const list = userData[field];

    if (!Array.isArray(list)) throw Error(`Field "${field}" is not an array for user ${userID}`);

    list.push(value);
    await save('users', userID);
    console.log(`Added \`${value}\` to "${field}" for user ${userID}`);
}

export async function popEntry(userID: string, field: userField) {
    if (!isReady) await storageReady;
    const list = storage.users[userID]?.[field];

    if (!Array.isArray(list)) throw Error(`Field "${field}" is not an array for user ${userID}`);
    if (list.length === 0) return undefined;

    const entry = list.pop();
    await save('users', userID);
    console.log(`Popped \`${entry}\` from "${field}" for user ${userID}`);

    return entry;
}

export default { init, name: () => "localStorage" };