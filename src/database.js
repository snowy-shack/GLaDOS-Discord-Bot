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
        INSERT INTO boosters_test (discord_id, days_boosted)
        VALUES ($1, 0)
        ON CONFLICT DO NOTHING;
    `,
    [ boosterId ]);
    
    await pgClient.query(`
        UPDATE boosters_test
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
        INSERT INTO players_skins_test (player_id, skin_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
    `,
    [ minecraftUuid, gunSkins.skinType ]);
}

async function getBoosted() {
    boosted = await pgClient.query(`
        SELECT discord_id
        FROM boosters_test
        WHERE days_boosted > $1
        AND messaged IS FALSE;
    `,
    [ 90 ]);
    return boosted.rows.map(row => row.discord_id);
}
module.exports = { incBoostingDay, addGunSkin, getBoosted };