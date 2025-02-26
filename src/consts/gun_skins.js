export const gun_skins = {
    Booster:    'booster',
    Birthday:   'birthday',
    Translator: 'translator',
}

/* private */ const ids = {
    booster:    '2ba60975-4f3f-47c7-981b-e0d938115288',
    birthday:   '3d8ded0b-cf82-4121-867e-59896cfb899c',
    translator: 'c14e9ce7-1d48-4e00-af27-4a232c959f8a',
}

export function id(name) {
    return ids[name];
}