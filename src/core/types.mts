export type DeepValue<T> = T extends string
    ? T
    : T extends object
        ? DeepValue<T[keyof T]>
        : never;

/** Full date: dd-mm-yyyy (e.g. 15-03-1990) */
export type dateString = `${number}-${number}-${number}`;
/** Short date (no year): dd-mm (e.g. 15-03) */
export type shortDateString = `${number}-${number}`;