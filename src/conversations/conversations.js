import {factorials} from "#src/consts/precalculations";

export function factorial(message) {
    const captured = message.content.match(/(\d+)!/);

    if (!captured || captured.length === 0 || captured[0] < 0) return false;

    if (captured[0] <= 100) {
        message.reply(`The factorial of ${captured[0]} is ${factorials[captured[0]]}!`);
        return true;
    }

    return false;
}