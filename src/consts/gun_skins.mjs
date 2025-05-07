export const gun_skins = {
    Booster:    {id: 'booster'   , uuid: '2ba60975-4f3f-47c7-981b-e0d938115288', name: 'Booster Skin'},
    Translator: {id: 'translator', uuid: 'c14e9ce7-1d48-4e00-af27-4a232c959f8a', name: 'Translator Skin'},
    Birthday:   {id: 'birthday',   uuid: '3d8ded0b-cf82-4121-867e-59896cfb899c', name: 'Birthday Skin'},
}

export const all_skins =
    Object.values(gun_skins).map(skin => ({
        name: skin.name,
        value: skin.id
    })
);