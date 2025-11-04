import {Message} from "discord.js";
import {getClient} from "#src/modules/client.mts";

export const DAY_IN_MS = 86400000;

/**
 * Generates a promise that resolves after the input time in milliseconds.
 *
 * @param time - The amount of time in milliseconds.
 * @return A promise that self-resolves after some time in milliseconds.
 * @example
 * // wait 200 milliseconds
 * await delayInMilliseconds(200);
 */
export function delayInMilliseconds(time: number) {
    return new Promise(resolve => setTimeout(() => resolve(null), time));
}

/**
 * Generates a promise that resolves after the input time in seconds.
 *
 * @param time - The amount of time in seconds.
 * @return A promise that self-resolves after some time in seconds.
 * @example
 * // wait 10 seconds
 * await delayInSeconds(10);
 */
export function delayInSeconds(time: number) {
    return delayInMilliseconds(time * 1000)
}

/**
 * Generates a promise that resolves after the input time in minutes.
 *
 * @param time - The amount of time in minutes.
 * @return A promise that self-resolves after some time in minutes.
 * @example
 * // wait 5 minutes
 * await delayInMinutes(5);
 */
export function delayInMinutes(time: number) {
    return delayInSeconds(time * 60)
}

/**
 * Trims a string to the specified length and appends an ellipsis (…) if the string exceeds the given length.
 *
 * @param input - The string to be trimmed.
 * @param length - The maximum length of the resulting string including the ellipsis.
 * @return The trimmed string, potentially appended with an ellipsis if trimmed.
 */
export function trimString(input: string, length: number, includeDots = true) {
    return input.length > length ? input.slice(0, length - 1) + (includeDots ? '…' : '') : input;
}

/**
 * Converts a Date object to a string formatted as `dd-mm-yyyy`.
 *
 * @param date - The Date object to be converted to a string.
 * @return The formatted date string in `dd-mm-yyyy` format.
 */
export function dateToString(date: Date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-based, so +1)
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
}

/**
 * Formats a given date string into a more readable format with an optional year inclusion.
 *
 * @param date - The input date string in the format `dd-mm-yyyy`.
 * @param [includeYear=false] - Whether to include the year in the output format.
 * @return A formatted date string, optionally including the year.
 */
export function formatDate(date: string, includeYear: boolean = false) {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const day:   number = Number(date.split('-')[0]);
    const month: string = months[Number(date.split('-')[1]) - 1];
    const year:  string = date.split('-')[2];

    const suffix: "st"|"rd"|"nd"|"th" =
        (day % 10 === 1 && day !== 11) ? "st" :
            (day % 10 === 2 && day !== 12) ? "nd" :
                (day % 10 === 3 && day !== 13) ? "rd" : "th";

    return (year === "1900" || !includeYear) ? `${month} ${day}${suffix}` : `${month} ${day}${suffix} ${year}`;
}

/**
 * Checks whether the given date string corresponds to today's date.
 *
 * @param date - The date string in the format "DD-MM".
 * @return Returns true if the given date matches today's date, otherwise false.
 */
export function dateIsToday(date: string) {
    const today = new Date();
    const [day, month] = date.split('-').map(Number);

    return today.getDate() === day && today.getMonth() + 1 === month;
}

/**
 * Sorts an array of objects containing date strings in ascending order of upcoming dates.
 * Dates that are in the past relative to the current date are moved to the end of the list.
 * Dates are expected in the format `dd-mm`.
 *
 * @param list - An array of objects, each containing at least a `value` property with a `dd-mm` formatted date string.
 * @return The sorted array where upcoming dates appear first and past dates are moved to the end.
 */
export function sortDatesUpcoming(list: { value: string, [key: string]: string }[]): { value: string, [key: string]: string }[] {
    const today = new Date();
    const currentDay: number = today.getDate();
    const currentMonth: number = today.getMonth() + 1; // getMonth() is zero-based
    const todayDate: number = currentMonth * 100 + currentDay;

    return list.sort((a, b): number => {
        const [dayA, monthA] = a.value.split('-').map(Number);
        const [dayB, monthB] = b.value.split('-').map(Number);

        const dateA: number = monthA * 100 + dayA;
        const dateB: number = monthB * 100 + dayB;

        // Move past dates to the end
        const aIsPast: boolean = dateA < todayDate;
        const bIsPast: boolean = dateB < todayDate;

        if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;
        return dateA - dateB;
    });
}

/**
 * Checks if the given day, month, and year construct a valid date.
 *
 * @param day - The day of the month.
 * @param month - The month of the year (1-12).
 * @param year - The year.
 * @return Returns true if the date is valid, false otherwise.
 */
export function isValidDate(day: number, month: number, year: number) {
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

/**
 * Capitalizes the first character of the given string.
 *
 * @param input - The string to be capitalized.
 * @return The input string with its first character converted to uppercase.
 */
export function capitalize(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Get the name of the author of a message
 * @param message - Input message
 */
export function getAuthorName(message: Message) {
    if (message.member?.id == getClient().user?.id) return "GLaDOS";

    return message.member?.nickname ?? message.member?.displayName ?? "unknown";
}