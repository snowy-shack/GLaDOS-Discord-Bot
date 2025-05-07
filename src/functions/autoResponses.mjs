import {factorials, voiceLines} from "#src/consts/miscellaneous.mjs";

export const replyFunctions = [factorial, glados, calc, jork, loss, marco]

function factorial(message) {
    const captured = message.content.match(/(\d+)!/);

    if (!captured || captured.length === 0 || captured[1] < 0) {
        return false;
    }

    if (captured[1] <= 100) {
        message.reply(`The factorial of ${captured[1]} is ${factorials[captured[1]]}! ✨`);
        return true;
    }

    return false;
}

function glados(message) {
    if (hasWord("glados", message.content)) {
        message.reply(voiceLines[Math.floor(Math.random() * voiceLines.length)]);
        return true;
    }
    return false;
}

function calc(message) {
    if (hasWord("calc", message.content)) {
        message.reply("Calc is short for calculator btw guys, they're just using slang.");
        return true;
    }
    return false;
}

function jork(message) {
    if (hasWord("jorkin", message.content)) {
        message.reply("straight up");
        return true;
    }
    return false;
}

function loss(message) {
    if (hasWord("loss", message.content)) {
        if (Math.random() < 0.95) {
            message.reply("\\|  \\|\\|\n\\|\\| \\|_");
        } else {
            message.reply("⠀⠀⠀⣴⣴⡤\n" +
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
                "⠀⣿⣿⡇⠀⢸⣿⣿⡇⠀⠀⠉⠉⠉⠉⠉⠉⠁");
        }
        return true;
    }
    return false;
}

function marco(message) {
    if (message.content.toLowerCase() === "marco") {
        message.reply("polo");
        return true;
    }
    return false;
}

// Check for case-insensitive words in a text, separated by non-alphabetic characters (so it's not contained in another word)
function hasWord(word, text) {
    return new RegExp(`(\\W|^)${word}(\\W|$)`, "i").test(text);
}