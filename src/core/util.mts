import { Message } from "discord.js";
import { getClient } from "#src/core/client.mts";
import { dateString, shortDateString } from "#src/core/types.mts";

export const DAY_IN_MS = 86400000;

/** Parsed parts from "dd-mm" or "dd-mm-yyyy". Year is undefined for short form. */
export type DateParts = { day: number; month: number; year?: number };

/**
 * Parse "dd-mm" or "dd-mm-yyyy" into numeric parts. Returns undefined if invalid.
 */
export function parseDateParts(dateStr: string): DateParts | undefined {
    if (!dateStr || typeof dateStr !== "string") return undefined;
    const parts = dateStr.trim().split("-").map(Number);
    if (parts.length < 2 || parts.some(isNaN)) return undefined;
    const [day, month, year] = parts;
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
    if (parts.length >= 3 && !isNaN(year!) && year! >= 1) {
        return { day, month, year: year! };
    }
    return { day, month };
}

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
 * @param includeDots - Whether to append … when it exceeds the given length.
 * @return The trimmed string, potentially appended with an ellipsis if trimmed.
 */
export function trimString(input: string, length: number, includeDots = true) {
    return input.length > length ? input.slice(0, length - 1) + (includeDots ? '…' : '') : input;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function daySuffix(day: number): "st" | "nd" | "rd" | "th" {
    if (day % 10 === 1 && day !== 11) return "st";
    if (day % 10 === 2 && day !== 12) return "nd";
    if (day % 10 === 3 && day !== 13) return "rd";
    return "th";
}

/**
 * Converts a Date to `dd-mm-yyyy` (e.g. 15-03-1990).
 */
export function dateToString(date: Date): dateString {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}` as dateString;
}

/**
 * Converts a Date to `dd-mm` (e.g. 15-03). Use for year-agnostic dates like birthdays "today".
 */
export function dateToShortString(date: Date): shortDateString {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}` as shortDateString;
}

/**
 * Human-readable date from "dd-mm" or "dd-mm-yyyy". Year is omitted when missing or 1900.
 * @param includeYear - Include year in output (e.g. "March 15th 1990").
 */
export function formatDate(date: string, includeYear = false): string {
    const p = parseDateParts(date);
    if (!p) return date;
    const monthName = MONTH_NAMES[p.month - 1];
    const suffix = daySuffix(p.day);
    const withYear = includeYear && p.year != null && p.year !== 1900;
    return withYear ? `${monthName} ${p.day}${suffix} ${p.year}` : `${monthName} ${p.day}${suffix}`;
}

/**
 * True if the given date string (dd-mm or dd-mm-yyyy) is today (same day and month).
 */
export function dateIsToday(date: string): boolean {
    const p = parseDateParts(date);
    if (!p) return false;
    const today = new Date();
    return today.getDate() === p.day && today.getMonth() + 1 === p.month;
}

/**
 * Sorts by next occurrence of the date (month-day). Past dates this year go to the end.
 * Accepts `value` as "dd-mm" or "dd-mm-yyyy".
 */
export function sortDatesUpcoming<T extends { value: string }>(list: T[]): T[] {
    const today = new Date();
    const todayNum = (today.getMonth() + 1) * 100 + today.getDate();

    return [...list].sort((a, b) => {
        const pA = parseDateParts(a.value);
        const pB = parseDateParts(b.value);
        if (!pA || !pB) return 0;
        const numA = pA.month * 100 + pA.day;
        const numB = pB.month * 100 + pB.day;
        const aPast = numA < todayNum;
        const bPast = numB < todayNum;
        if (aPast !== bPast) return aPast ? 1 : -1;
        return numA - numB;
    });
}

/**
 * Validates that day/month/year form a real calendar date.
 */
export function isValidDate(day: number, month: number, year: number): boolean {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Validates a "dd-mm-yyyy" string and returns true if it's a real date.
 */
export function isValidDateString(dateStr: string): boolean {
    const p = parseDateParts(dateStr);
    if (!p || p.year == null) return false;
    return isValidDate(p.day, p.month, p.year);
}

/**
 * Days elapsed since the given full date string (dd-mm-yyyy).
 */
export function daysSince(dateStr: dateString): number {
    if (!dateStr) return 0;
    const p = parseDateParts(dateStr);
    if (!p || p.year == null) return 0;
    const past = new Date(p.year, p.month - 1, p.day).getTime();
    return Math.floor((Date.now() - past) / DAY_IN_MS);
}

/**
 * Days until the next occurrence of this date (by month-day). Use for birthdays.
 * Accepts "dd-mm" or "dd-mm-yyyy". Returns 0 if today.
 */
export function daysUntilBirthday(dateStr: string): number {
    const p = parseDateParts(dateStr);
    if (!p) return NaN;
    const today = new Date();
    let next = new Date(today.getFullYear(), p.month - 1, p.day);
    if (next.getTime() < today.getTime()) next.setFullYear(today.getFullYear() + 1);
    return Math.ceil((next.getTime() - today.getTime()) / DAY_IN_MS);
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