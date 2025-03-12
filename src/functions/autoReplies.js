import {factorials, voiceLines} from "#src/consts/miscellaneous";

export const replyFunctions = [factorial, glados, calc]

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
    if (!hasWord("glados", message.content)) {
        return false;
    }
    message.reply(voiceLines[Math.floor(Math.random() * voiceLines.length)]);
    return true;
}

function calc(message) {
    if (!hasWord("calc", message.content)) {
        return false;
    }
    message.reply("Calc is short for calculator btw guys, they're just using slang.");
    return true;
}

// Case-insensitive
function hasWord(word, text) {
    return new RegExp(`(\\W|^)${word}(\\W|$)`, "i").test(text);
}