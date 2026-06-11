import {factorials} from "#src/consts/miscellaneous.mts";
import {Message, PermissionFlagsBits} from "discord.js";
import * as llm from "#src/modules/openAIHandler.mts";
import {dateToString, daysSince, getAuthorName, trimString} from "#src/core/util.mts";
import {getClient} from "#src/core/client.mts";
import {
    getGlobalField,
    getUserData,
    globalFields,
    setGlobalField,
    setUserField,
    userField,
    userFields
} from "#src/modules/localStorage.mts";
import {logMessage} from "#src/core/logs.mts";
import {channels} from "#src/core/phantys_home.mts";

export const replyFunctions: ((message: Message) => string | Promise<string | undefined> | undefined)[] = [maybeCount, factorial, glados, calc, jork, loss, marco, trackWordle];

/* UTILITY STUFF */

const sanitize = (str: string) => {
    return str
        .replaceAll('\n', ' ')
        .replace(/[\\[\]()*\-=_\/:;'"{}<>|`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

function isAdmin(message: Message) {
    const member = message.member;
    if (!member || message.channel.isDMBased()) return false;

    return member.permissionsIn(message.channel).has(PermissionFlagsBits.Administrator);
}

/* END UTILITY STUFF */

function factorial(message: Message) {
    const captured = message.content.match(/(\d+)!/);

    if (!captured || captured.length === 0 || Number(captured[1]) < 0) {
        return;
    }

    if (Number(captured[1]) <= 100) {
        return `The factorial of ${captured[1]} is ${factorials[Number(captured[1])]}! ✨`;
    }
}

const COOLDOWN_MS = 1000 * 60 * 5;
let lastAIResponse = 0;
async function glados(message: Message) {
    if (Date.now() - lastAIResponse < COOLDOWN_MS && !isAdmin(message)) return undefined;

    if (hasWord("glados", message.content) || message.mentions.has(getClient().user ?? '') ) {
        const isReply = !!message.reference?.messageId;

        const scanMessages = isReply
                ? [ await message.fetchReference(), message ]
                : Array.from((await message.channel.messages.fetch({ limit: 10 })).reverse().values());

        const recentMessages = scanMessages.map(m => ({
            glados: getAuthorName(m) === "GLaDOS",
            username: getAuthorName(m),
            content: trimString(sanitize(m.content), 75, true)
        } as llm.ContextMessage));

        let typingInterval: NodeJS.Timeout | undefined;
        const sendTyping = () => { // GLaDOS is typing...
            if ("sendTyping" in message.channel) {
                void message.channel.sendTyping();
            }
        };

        try {
            const responsePromise = llm.getResponse([{ glados: false, content: message.content, username: getAuthorName(message) }]);
            const isUnsafe = await llm.isUnsafe([{ glados: false, content: message.content, username: getAuthorName(message) }]);

            if (isUnsafe) {
                void logMessage("Not replying to possibly inappropriate message.");
                return undefined;
            }

            sendTyping();

            typingInterval = setInterval(() => {
                sendTyping();
            }, 5000); // Retype every 5 seconds

            const response = await responsePromise;

            if (typeof response == "string") {
                lastAIResponse = Date.now();
                console.log("SET")
                return trimString(response, 1900, false);
            }
        } finally {
            if (typingInterval) {
                clearInterval(typingInterval);
            }
        }
    }
}

function calc(message: Message) {
    if (hasWord("calc", message.content)) {
        return "Calc is short for calculator btw guys, they're just using slang.";
    }
}

function jork(message: Message) {
    if (hasWord("jorkin", message.content)) {
        return "straight up";
    }
}

function loss(message: Message) {
    if (hasWord("loss", message.content)) {
        if (Math.random() < 0.95) {
            return "\\|  \\|\\|\n\\|\\| \\|_";
        } else {
            return "⠀⠀⠀⣴⣴⡤\n" +
                "⠀⣠⠀⢿⠇⡇⠀⠀⠀⠀⠀⠀⠀⢰⢷⡗\n" +
                "⠀⢶⢽⠿⣗⠀⠀⠀⠀⠀⠀⠀⠀⣼⡧⠂⠀⠀⣼⣷⡆\n" +
                "⠀⠀⣾⢶⠐⣱⠀⠀⠀⠀⠀⣤⣜⣻⣧⣲⣦⠤⣧⣿⠶\n" +
                "⠀⢀⣿⣿⣇⠀⠀⠀⠀⠀⠀⠛⠿⣿⣿⣷⣤⣄⡹⣿⣷\n" +
                "⠀⢸⣿⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣿⣿⣿⣿\n" +
                "⠀⠿⠃⠈⠿⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⠿⠿⠿\n" +
                "\n" +
                "⠀⢀⢀⡀⠀⢀⣤⠀⠀⠀⠀⠀⠀⠀⡀⡀\n" +
                "⠀⣿⡟⡇⠀⠭⡋⠅⠀⠀⠀⠀⠀⢰⣟⢿\n" +
                "⠀⣹⡌⠀⠀⣨⣾⣷⣄⠀⠀⠀⠀⢈⠔⠌\n" +
                "⠰⣷⣿⡀⢐⢿⣿⣿⢻⠀⠀⠀⢠⣿⡿⡤⣴⠄⢀⣀⡀\n" +
                "⠘⣿⣿⠂⠈⢸⣿⣿⣸⠀⠀⠀⢘⣿⣿⣀⡠⣠⣺⣿⣷\n" +
                "⠀⣿⣿⡆⠀⢸⣿⣿⣾⡇⠀⣿⣿⣿⣿⣿⣗⣻⡻⠿⠁\n" +
                "⠀⣿⣿⡇⠀⢸⣿⣿⡇⠀⠀⠉⠉⠉⠉⠉⠉⠁";
        }
    }
}

function marco(message: Message) {
    if (message.content.toLowerCase() === "marco") {
        return "polo";
    }
}

export const WORDLE_APP_ID = "1211781489931452447";
type wordleKeys = keyof typeof userFields.Wordle;

function trackWordle(message: Message) {
    if (message.author.id != WORDLE_APP_ID) return undefined;

    const lines = message.content.split('\n');
    let players = 0;

    for (const line of lines) {
        // Match digits or 'X' before the slash
        const lineMatch = line.match(/^\D*([\dX])\s*\/\s*\d+:\s*(.+)$/i);
        if (!lineMatch) continue;

        const score = lineMatch[1].toUpperCase();
        const rest = lineMatch[2];

        const userMatches = rest.matchAll(/<@(\d+)>/g);
        for (const match of userMatches) {
            players++;
            const id = match[1];
            // 'SolvesX' or 'Solves1'-'Solves6'
            void incrementWordleScores(id, userFields.Wordle[(`Solves${score}`) as wordleKeys], Number(score));
        }
    }

    if (players > 0) {
        const before = getGlobalField(globalFields.Wordle.GamesTracked);
        void setGlobalField(globalFields.Wordle.GamesTracked, before + 1);
        void logMessage(`🪵 Tracked wordle stats of ${players} participating players today.`);
    }
}

function maybeCount(message: Message) {
    if (message.channelId !== channels.Counting) return;

    const captured = message.content.match(/^(\d+)$/);

    // One in 500
    if (captured && (Math.random() * 500 < 1 || ( Math.random() * 5 < 1 && captured[1].endsWith("999"))) ) {
        const channel = message.channel;
        if ("send" in channel) {
            channel.send(`${Number(captured[1]) + 1} :)`);
            return "";
        }
    }
}

// Not really a reaction, but still here for ease of use
async function incrementWordleScores(id: string, field: userField, lastScore: number) {
    let data = getUserData(id);

    let value = data[field] ?? 0;
    await setUserField(id, field, value + 1);
    await setUserField(id, userFields.Wordle.LastScore, lastScore);

    const streak = data[userFields.Wordle.Streak] ?? 0;
    const lastPlayed = data[userFields.Wordle.LastPlayed];

    // If played yesterday, increase streak, otherwise reset.
    await setUserField(id, userFields.Wordle.Streak, daysSince(lastPlayed) <= 2 ? streak + 1 : 1 );
    await setUserField(id, userFields.Wordle.LastPlayed, dateToString(new Date()));
}

/**
 * Check for case-insensitive words in a text, separated by non-alphabetic characters (so it's not contained in another word)
 * @param word - The word to check for
 * @param input - The input string to check
 */
function hasWord(word: string, input: string): boolean {
    return new RegExp(`(\\W|^)${word}(\\W|$)`, "i").test(input);
}