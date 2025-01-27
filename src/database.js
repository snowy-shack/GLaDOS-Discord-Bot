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

async function ensureDBConnection(retries = 5, delay = 1000) {
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

async function incBoostingDay(boosterId) {
    await ensureDBConnection();
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
    await ensureDBConnection();
    await pgClient.query(`
        INSERT INTO players_skins (player_id, skin_id)
        VALUES ($1, $2);
    `,
    [ minecraftUuid, gunSkins[skinType] ]);
}

async function getBoosted(days) {
    await ensureDBConnection();
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
    await ensureDBConnection();
    await pgClient.query(`
        UPDATE boosters
        SET messaged = TRUE
        WHERE discord_id = $1;
    `, [discordId]);
}

// Birthday commands
async function saveBirthday(user_id, date) {
    await ensureDBConnection();

    await pgClient.query(`
        INSERT INTO birthdays (discord_id, birthday, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING;
    `, [user_id, date.toISOString().split('T')[0]]);
}

async function getBirthday(user_id) {
    await ensureDBConnection();

    const result = await pgClient.query(`
        SELECT birthday FROM birthdays WHERE discord_id = $1;
    `, [user_id]);

    if (result.rows.length === 0) return null; // No birthday found

    return new Date(result.rows[0].birthday);
}

async function getBirthdaysToday() {
    await ensureDBConnection();

    const today = new Date().toISOString().split('T')[0];

    const result = await pgClient.query(`
        SELECT discord_id FROM birthdays WHERE birthday = $1;
    `, [today]);

    return result.rows.map(row => row.discord_id); 
}

async function getNextBirthdays(count) {
    await ensureDBConnection();

    const result = await pgClient.query(`
        WITH upcoming_birthdays AS (
            SELECT discord_id, birthday,
                CASE 
                    WHEN TO_DATE(TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(birthday, 'MM-DD'), 'YYYY-MM-DD') < CURRENT_DATE
                    THEN TO_DATE(TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YYYY') || '-' || TO_CHAR(birthday, 'MM-DD'), 'YYYY-MM-DD')
                    ELSE TO_DATE(TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(birthday, 'MM-DD'), 'YYYY-MM-DD')
                END AS next_birthday
            FROM birthdays
        )
        SELECT discord_id, birthday 
        FROM upcoming_birthdays
        ORDER BY next_birthday
        LIMIT $1;
    `, [count]);

    // const result = await pgClient.query(`
    //     SELECT discord_id, birthday 
    //     FROM birthdays 
    //     WHERE discord_id = '382524802491219969'
    //     LIMIT 1;
    // `);

    return result.rows.map(row => ({
        discord_id: row.discord_id,
        birthday: new Date(row.birthday)
    }));
}




module.exports = { 
    incBoostingDay, 
    addGunSkin, 
    getBoosted,
    markBoosterAsMessaged,

    saveBirthday,
    getBirthday,
    getBirthdaysToday,
    getNextBirthdays,
};
