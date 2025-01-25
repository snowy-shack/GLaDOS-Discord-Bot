const pg = require("pg");

const logs = require("./logs");

const pgClient = new pg.Client({
    host:     process.env.DBHOST,
    port:     process.env.DBPORT,
    database: process.env.DBNAME,
    user:     process.env.DBUSER,
    password: process.env.DBPASS,
});

pgClient.connect();

async function ensureDbConnection(retries = 5, delay = 1000) {
    while (retries--) {
        try {
            await pgClient.query('SELECT 1');
            return;
        } catch {
            console.warn(`Reconnecting to DB... (${5 - retries}/5)`);
            try { await pgClient.end(); } catch {}
            pgClient.connect();
        }
        await new Promise(r => setTimeout(r, delay *= 2));
    }
    throw new Error('Database reconnection failed');
}

// async function incBoostingDay(boosterId) {
//     await pgClient.query(`
//         INSERT INTO boosters (discord_id, days_boosted)
//         VALUES ($1, 0)
//         ON CONFLICT DO NOTHING;
//     `,
//     [ boosterId ]);
    
//     await pgClient.query(`
//         UPDATE boosters
//         SET days_boosted = days_boosted + 1
//         WHERE boosters.discord_id = $1;
//     `,
//     [ boosterId ]);
// }

async function incBoostingDay(boosterId) {
    await ensureDbConnection();
    try {
        await pgClient.query(`
            INSERT INTO boosters (discord_id, days_boosted, last_modified)
            VALUES ($1, 0, NOW())
            ON CONFLICT DO NOTHING;
        `, [boosterId]);

        const result = await pgClient.query(`
            UPDATE boosters
            SET days_boosted = days_boosted + 1,
                last_modified = NOW()
            WHERE discord_id = $1
            RETURNING *;
        `, [boosterId]);
        
        return result.rowCount > 0; // Return the number of rows affected.
    } catch (error) {
        console.error("Error updating booster:", error);
        logs.logError(error);
        return false;
    }
}

const gunSkins = {
    booster: "2ba60975-4f3f-47c7-981b-e0d938115288",
    donator: "",
    colour: "169752be-2bf6-4ce2-9653-03098354505e"
}

async function addGunSkin(minecraftUuid, skinType) {
    await ensureDbConnection();
    await pgClient.query(`
        INSERT INTO players_skins (player_id, skin_id)
        VALUES ($1, $2);
    `,
    [ minecraftUuid, gunSkins[skinType] ]);
}

async function getBoosted(days) {
    await ensureDbConnection();
    // boosted = await pgClient.query(`
    //     SELECT discord_id
    //     FROM boosters
    //     WHERE days_boosted >= $1
    //     AND messaged IS FALSE;
    // `,
    // [ days ]);
    // await pgClient.query(`
    //     UPDATE boosters
    //     SET messaged = TRUE
    //     WHERE days_boosted >= $1;
    // `,
    // [ days ]); 
    boosted = await pgClient.query(`
        WITH updated_boosters AS (
            UPDATE boosters
            SET messaged = TRUE
            WHERE days_boosted >= $1
            AND messaged IS FALSE
            RETURNING discord_id
        )
        SELECT discord_id
        FROM updated_boosters;
    `, [ days ]); // Ensure the same person doesn't get messaged multiple times

    return boosted.rows.map(row => row.discord_id);
}

async function markBoosterAsMessaged(discordId) {
    await ensureDbConnection();
    await pgClient.query(`
        UPDATE boosters
        SET messaged = TRUE
        WHERE discord_id = $1;
    `, [discordId]);
}

module.exports = { 
    incBoostingDay, 
    addGunSkin, 
    getBoosted,
    markBoosterAsMessaged
};
