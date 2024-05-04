const pg = require("pg");

const pgClient = new pg.Client({
    host:     process.env.DBHOST,
    port:     process.env.DBPORT,
    database: process.env.DBNAME,
    user:     process.env.DBUSER,
    password: process.env.DBPASS,
});

pgClient.connect();

async function incBoostingDay(boosterId) {
    await pgClient.query(`
        INSERT INTO boosters (discord_id, days_boosted)
        VALUES ($1, 0)
        ON CONFLICT DO NOTHING;
    `,
    [ boosterId ]);
    
    await pgClient.query(`
        UPDATE boosters
        SET days_boosted = days_boosted + 1
        WHERE boosters.discord_id = $1;
    `,
    [ boosterId ]);
}

const gunSkins = {
    booster: "2ba60975-4f3f-47c7-981b-e0d938115288",
    donator: "",
    colour: "169752be-2bf6-4ce2-9653-03098354505e"
}

async function addGunSkin(discordId, minecraftUuid, skinType) {
    await pgClient.query(`
        INSERT INTO players_skins_new (player_id, skin_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
    `,
    [ minecraftUuid, gunSkins[skinType] ]);

    await pgClient.query(`
        UPDATE users
        SET mc_uuid = $1
        WHERE discord_id = $2
    `); // not done
}

async function getBoosted() {
    boosted = await pgClient.query(`
        SELECT discord_id
        FROM boosters
        WHERE days_boosted >= $1
        AND messaged IS FALSE;
    `,
    [ 90 ]);
    await pgClient.query(`
        UPDATE boosters
        SET messaged = TRUE;
    `); // Ensure the same person doesn't get messaged multiple times
    return boosted.rows.map(row => row.discord_id);
}

module.exports = { 
    incBoostingDay, 
    addGunSkin, 
    getBoosted 
};