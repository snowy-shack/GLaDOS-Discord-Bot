export type DeepValue<T> = T extends string
    ? T
    : T extends object
        ? DeepValue<T[keyof T]>
        : never;

export type dateString = `${number}-${number}-${number}`;