import {env} from "#src/core/env.mts";
import * as logs from "#src/core/logs.mts";
import {toError} from "#src/core/try-catch.mts";
import {dateToString, daysSince} from "#src/core/util.mts";
import {dateString} from "#src/core/types.mts";
import {
    getGlobalField,
    getUserData,
    globalFields,
    setGlobalField,
    setUserField,
    userField,
    userFields
} from "#src/modules/localStorage.mts";
import wordleReminder from "#src/modules/wordleReminder.mts";
import wordlePlayStatus from "#src/modules/wordlePlayStatus.mts";

type Envelope = { id: string, type: string, payload: any };

const RECONNECT_DELAY_MS = 3000;
let socket: WebSocket | undefined;

function send(envelope: Envelope) {
    if (socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(envelope));
}

async function handleMessage(raw: string) {
    let envelope: Envelope;
    try {
        envelope = JSON.parse(raw);
    } catch (error) {
        await logs.logError("parsing wordle bridge message", toError(error));
        return;
    }

    switch (envelope.type) {
        case "get_streak": {
            const {discordId} = envelope.payload;
            send({
                id: envelope.id,
                type: "streak_data",
                payload: {
                    discordId,
                    playerStreak: (getUserData(discordId) ?? {})[userFields.Wordle.Streak] ?? 0,
                    serverStreak: getGlobalField(globalFields.Wordle.ServerStreak) ?? 0,
                }
            });
        } break;

        case "game_finished": {
            const {discordId, guesses, finished} = envelope.payload;
            await recordGameFinished(discordId, guesses, finished);
            send({id: envelope.id, type: "ack", payload: {}});
            await wordlePlayStatus.announceFinished(discordId);
        } break;
    }
}

type wordleKeys = keyof typeof userFields.Wordle;

// Launch day of wordle tracking, used to backfill FirstPlayed for veterans who predate that field
const WORDLE_PARTICIPATION_EPOCH = "05-01-2026" as dateString;

async function recordGameFinished(discordId: string, guesses: number, finished: boolean) {
    const score = finished ? String(guesses) : "X";
    const field = userFields.Wordle[(`Solves${score}`) as wordleKeys] as userField;

    const data = getUserData(discordId) ?? {};

    if (!data[userFields.Wordle.FirstPlayed]) {
        const hasPriorPlays = Object.values(userFields.Wordle)
            .filter(f => f.startsWith("wordle.solves_"))
            .some(f => (data[f as userField] ?? 0) > 0);
        const firstPlayed = hasPriorPlays
            ? WORDLE_PARTICIPATION_EPOCH
            : dateToString(new Date(Date.now() - 86400000)); // New players backdate to yesterday, existing ones anchor to launch day
        await setUserField(discordId, userFields.Wordle.FirstPlayed, firstPlayed);
    }

    const solves = data[field] ?? 0;
    await setUserField(discordId, field, solves + 1);
    await setUserField(discordId, userFields.Wordle.LastScore, finished ? guesses : 0);

    const previousStreak = data[userFields.Wordle.Streak] ?? 0;
    const lastPlayed = data[userFields.Wordle.LastPlayed];

    // A win continues the streak if played within the last 2 days, else restarts it at 1. A loss breaks it to 0.
    const streak = finished ? (daysSince(lastPlayed) <= 2 ? previousStreak + 1 : 1) : 0;
    await setUserField(discordId, userFields.Wordle.Streak, streak);
    await setUserField(discordId, userFields.Wordle.LastPlayed, dateToString(new Date()));

    void wordleReminder.handleSolved(discordId);

    // Server streak advances once per calendar day, not once per game.
    const serverLastPlayed = getGlobalField(globalFields.Wordle.ServerLastPlayed);
    const serverDaysSince = serverLastPlayed ? daysSince(serverLastPlayed) : Infinity;
    if (serverDaysSince !== 0) {
        const serverStreak = getGlobalField(globalFields.Wordle.ServerStreak) ?? 0;
        await setGlobalField(globalFields.Wordle.ServerStreak, serverDaysSince <= 2 ? serverStreak + 1 : 1);
        await setGlobalField(globalFields.Wordle.ServerLastPlayed, dateToString(new Date()));
    }

    const before = getGlobalField(globalFields.Wordle.GamesTracked) ?? 0;
    await setGlobalField(globalFields.Wordle.GamesTracked, before + 1);
}

function connect() {
    const url = env.WORDLE_WS_URL;
    const token = env.WORDLE_WS_TOKEN;
    if (!url || !token) {
        void logs.logWarning("WORDLE_WS_URL/WORDLE_WS_TOKEN not set, wordle bridge disabled.");
        return;
    }

    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
        void logs.logMessage("🪢 Connected to Wordle server.");
        send({id: "", type: "auth", payload: {token}});
    });

    socket.addEventListener("message", (event) => {
        void handleMessage(String(event.data));
    });

    socket.addEventListener("close", () => {
        socket = undefined;
        setTimeout(connect, RECONNECT_DELAY_MS);
    });

    socket.addEventListener("error", async (event) => {
        await logs.logError("wordle bridge socket", toError((event as any).error ?? new Error("Unknown socket error")));
    });
}

async function init(_storageReady: void) {
    connect();
}

export default {init, name: () => "wordleBridge"};
