export const DAY_IN_MS = 86400000;

export function delayInMilliseconds(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function delayInSeconds(time) {
    return new Promise(resolve => setTimeout(resolve, time / 1000));
}

// Cap a string str at len length
export function trimString(str, len) {
    return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

export function dateToString(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-based, so +1)
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
}

// Returns date in human-readable format
export function formatDate(date, includeYear = false) {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const day   = date.split('-')[0];
    const month = months[date.split('-')[1] - 1];
    const year  = date.split('-')[2];

    const suffix =
        (day % 10 === 1 && day !== 11) ? "st" :
            (day % 10 === 2 && day !== 12) ? "nd" :
                (day % 10 === 3 && day !== 13) ? "rd" : "th";

    return (year == 1900 || !includeYear) ? `${month} ${day}${suffix}` : `${month} ${day}${suffix} ${year}`;
}

// Returns true if today is the input date
export function dateIsToday(stringDate) {
    const today = new Date();
    const [day, month] = stringDate.split('-').map(Number);

    return today.getDate() === day && today.getMonth() + 1 === month;
}

export function sortDatesUpcoming(list) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // getMonth() is zero-based
    const todayDate = currentMonth * 100 + currentDay;

    return list.sort((a, b) => {
        const [dayA, monthA] = a.value.split('-').map(Number);
        const [dayB, monthB] = b.value.split('-').map(Number);

        const dateA = monthA * 100 + dayA;
        const dateB = monthB * 100 + dayB;

        // Move past dates to the end
        const aIsPast = dateA < todayDate;
        const bIsPast = dateB < todayDate;

        if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;
        return dateA - dateB;
    });
}

export function isValidDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}