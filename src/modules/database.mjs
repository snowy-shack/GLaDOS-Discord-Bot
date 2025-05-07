import pg from "pg";
import * as logs from "#src/modules/logs.mjs";
import {delayInMilliseconds} from "#src/modules/util.mjs";

let pgClient;

let initialized = false;
await ensureDBConnection();
initialized = true;

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
                if (initialized) await logs.logMessage("❓ Attempting Database (re)connection.");
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

export async function addGunSkin(minecraftUuid, skinUUID) {
    await ensureDBConnection();
    await pgClient.query(`
        INSERT INTO players_skins (minecraft_id, skin_id)
        VALUES ($1, $2);
    `,
    [ minecraftUuid, skinUUID ]);
}