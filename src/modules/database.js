import pg from "pg";
import * as logs from "#src/modules/logs";
import {delayInMilliseconds} from "#src/modules/util";

let pgClient;

await ensureDBConnection();

/* private */ async function ensureDBConnection(retries = 5, delay = 1000) {
    let reconnect = false;
    while (retries--) {
        try {
            await pgClient.query('SELECT 1');

            if (reconnect) await logs.logMessage("✅ Database connection successful.");
            return;
        } catch {
            reconnect = true;
            if (retries < 4) {
                console.warn(`Reconnecting to DB... (${5 - retries}/5)`);
            } else {
                await logs.logMessage("❓ Attempting Database (re)connection.");
            }

            pgClient?.end().catch(() => {});

            pgClient = new pg.Client({
                host:     process.env.DBHOST,
                port:     process.env.DBPORT,
                database: process.env.DBNAME,
                user:     process.env.DBUSER,
                password: process.env.DBPASS,
            });

            await pgClient.connect();
        }
        await delayInMilliseconds(delay *= 2);
    }
    throw new Error('Database reconnection failed');
}

// This is just for migration; TODO remove later
export async function fetchBoosters() {
    await ensureDBConnection();
    try {
        const res = await pgClient.query('SELECT discord_id, days_boosted, messaged FROM boosters');
        return res.rows;
    } catch (err) {
        console.error('Error fetching data:', err);
        return [];
    }
}

// This is just for migration; TODO remove later
export async function fetchBirthdays() {
    await ensureDBConnection();
    try {
        const res = await pgClient.query('SELECT discord_id, birthday FROM birthdays');
        return res.rows;
    } catch (err) {
        console.error('Error fetching data:', err);
        return [];
    }
}

export async function incBoostingDay(boosterId) {
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
        await logs.logError("updating a booster", error);
        return false;
    }
}

export async function addGunSkin(minecraftUuid, skinUUID) {
    await ensureDBConnection();
    await pgClient.query(`
        INSERT INTO players_skins (player_id, skin_id)
        VALUES ($1, $2);
    `,
    [ minecraftUuid, skinUUID ]);
}

export async function getBoosted(days) {
    await ensureDBConnection();
    const boosted = await pgClient.query(`
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
export async function saveBirthday(user_id, date) {
    await ensureDBConnection();

    await pgClient.query(`
        INSERT INTO birthdays (discord_id, birthday, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING;
    `, [user_id, date.toISOString().split('T')[0]]);
}

export async function getBirthday(user_id) {
    await ensureDBConnection();

    const result = await pgClient.query(`
        SELECT birthday FROM birthdays WHERE discord_id = $1;
    `, [user_id]);

    if (result.rows.length === 0) return null; // No birthday found

    return new Date(result.rows[0].birthday);
}

export async function getBirthdaysToday() {
    await ensureDBConnection();

    const result = await pgClient.query(`
        SELECT discord_id FROM birthdays 
        WHERE TO_CHAR(birthday, 'MM-DD') = TO_CHAR(CURRENT_DATE, 'MM-DD');
    `);

    return result.rows.map(row => row.discord_id); 
}

export async function getNextBirthdays(count) {
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
