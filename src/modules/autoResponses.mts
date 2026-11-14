import {factorials} from "#src/consts/miscellaneous.mts";
import {Message, PermissionFlagsBits} from "discord.js";
import * as llm from "#src/modules/openAIHandler.mts";
import {getAuthorName, trimString} from "#src/core/util.mts";
import {getClient} from "#src/core/client.mts";
import {logMessage} from "#src/core/logs.mts";
import {channels} from "#src/core/phantys_home.mts";

export const replyFunctions: ((message: Message) => string | Promise<string | undefined> | undefined)[] = [maybeCount, factorial, glados, calc, jork, loss, milkshake, marco];

/* UTILITY STUFF */

const sanitize = (str: string) => {
    return str
        .replaceAll('\n', ' ')
        .replace(/[\\[\]()*\-=_\/:;'"{}<>|`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

// Swaps raw <@id> mentions for display names, using the mentions Discord.js already attached to the message
const resolveMentions = (message: Message) => {
    const botId = getClient().user?.id;

    return message.content.replace(/<@!?(\d+)>/g, (match, id) => {
        if (id === botId) return '@GLaDOS';

        const name = message.mentions.members?.get(id)?.displayName ?? message.mentions.users.get(id)?.username;
        return name ? `@${name}` : match;
    });
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
let requestInFlight = false; // Reserves the cooldown slot immediately, closing the race between the check and the eventual lastAIResponse update
async function glados(message: Message) {
    const bypassLimits = isAdmin(message);

    if (!bypassLimits && (requestInFlight || Date.now() - lastAIResponse < COOLDOWN_MS)) return undefined;

    if (hasWord("glados", message.content) || message.mentions.has(getClient().user ?? '') || Math.random() < 0.001) {
        if (!bypassLimits) requestInFlight = true;

        let typingInterval: NodeJS.Timeout | undefined;
        const sendTyping = () => { // GLaDOS is typing...
            if ("sendTyping" in message.channel) {
                void message.channel.sendTyping();
            }
        };

        try {
            const isReply = !!message.reference?.messageId;

            const scanMessages = isReply
                    ? [ await message.fetchReference(), message ]
                    : Array.from((await message.channel.messages.fetch({ limit: 3 })).reverse().values());

            const recentMessages = scanMessages.map(m => ({
                glados: getAuthorName(m) === "GLaDOS",
                username: getAuthorName(m),
                content: trimString(sanitize(resolveMentions(m)), 75, true)
            } as llm.ContextMessage));

            const responsePromise = llm.getResponse(recentMessages);
            const isUnsafe = await llm.isUnsafe(recentMessages);

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
            if (typingInterval) clearInterval(typingInterval);
            if (!bypassLimits) requestInFlight = false;
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

const MILKSHAKE_ART = ".....................   ....=-............\n" +
    ".-::::::.:--==:               -=*=-::::::.\n" +
    ".-----:.:===..                  -===-:-::.\n" +
    ".-=-::::*.                         **.:-:.\n" +
    "....:::-.      :@@@@@@@@%+::        :@===.\n" +
    "...:-:..   .=@@@@@@@%%%%%%%@@@%:     .==-.\n" +
    ".::==:    #@@#=----=+----=%::::#%:     =#=\n" +
    ".::-=.   -@@=.-=--:::::::::::::::-%     =.\n" +
    ".-==:.  =@@.. -#@@#:::+@@@@@@@::::*:\n" +
    ".:=-..  ...=%%===-::::--:::..:::::::     .\n" +
    "..=:    .=@.                       *\n" +
    "..*:    :%            :.           =\n" +
    "..#.    :@          .+@-          .--\n" +
    "..=:    ..   =     :-@@:::          -    .\n" +
    ".:==    #%-==  . -===@@+-::=:::*#=:=:\n" +
    ".:=:.  .@@===-=====@@@@%@@++::::::+*:   ==\n" +
    ".-=:+= .@::===+==#=      : ==+::::: ::  ==\n" +
    ".. :=   =  -=--.           :-:::::  -    =\n" +
    ".====-  #=:-.. :*@=-.   ::-%@%:...  -: :==\n" +
    ".:   .= . .-::====         -+=:.:.: :  .%=\n" +
    "   =. :==:-:  ..   .    -            :*+@=\n" +
    " =:     :=.=-                   :   .@@#+=\n" +
    "       .== :==   =+=*@@@=-:.   ..   :@#++=\n" +
    "   ::. .==:===:--.         ..:::::= =@%*+=\n" +
    ".=.  .=@@-.  :                   .-.=@@##=\n" +
    "  :%+==@@@=...  .-=====%#:::.  .:   =@@@@=\n" +
    "=-====@@@@@@#...-.           .==.   :+*@*+\n" +
    "=:==@@@@@@@@@@-.           .=:    :*@@=*@#\n" +
    "@@@@@@@@@@@@*@@@=              :@@@@@*@@@#\n" +
    "@@@@@@@@@@@@@%@@@@@=       :+@@@@%::==@@@@\n" +
    "@@@@@@@@= =@@@@========#%@@@%--::::-#@@@@@\n" +
    "@@@@@@@@@%  #@++@@@%%#==::::::-@@@@@@+:@@@\n" +
    "@@@@@@@@@@@  =@*======--+@@@@@@@-:::%= =@@\n" +
    "@@@@@@@@@@@@  =@@==#@@@@@@@@@@@@@@@-#: :@@\n" +
    "@@@@@@@@@@@@@= :@@@==-:::::::::::::-@: :@@";

function milkshake(message: Message) {
    if (hasWord("milkshake", message.content)) {
        return "```\n" + MILKSHAKE_ART + "\n```";
    }
}

function marco(message: Message) {
    if (message.content.toLowerCase() === "marco") {
        return "polo";
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

/**
 * Check for case-insensitive words in a text, separated by non-alphabetic characters (so it's not contained in another word)
 * @param word - The word to check for
 * @param input - The input string to check
 */
function hasWord(word: string, input: string): boolean {
    return new RegExp(`(\\W|^)${word}(\\W|$)`, "i").test(input);
}