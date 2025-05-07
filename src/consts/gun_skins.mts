export const gun_skins: { [key: string]: { [key: string]: string } } = {
    Birthday:   {id: 'birthday',   name: 'Birthday Skin'},
    Booster:    {id: 'booster',    name: 'Booster Skin'},
    Default:    {id: 'default',    name: 'Default Skin'},
    Developer:  {id: 'developer',  name: 'Developer Skin'},
    Gelocity:   {id: 'gelocity',   name: 'Gelocity Skin'},
    Playtester: {id: 'playtester', name: 'Playtester Skin'},
    Redacted:   {id: 'redacted',   name: '[???]'},
    Tintable:   {id: 'tintable',   name: 'Tintable Skin'},
    Translator: {id: 'translator', name: 'Translator Skin'},
}

export const all_skins: { name: string, value: string }[] =
    Object.values(gun_skins).map(skin => ({
        name: skin.name,
        value: skin.id
    })
);