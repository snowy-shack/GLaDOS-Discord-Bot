import pg from "pg";
import * as logs from "#src/modules/logs.mts";
import {delayInMilliseconds} from "#src/modules/util.mts";

let pgClient: pg.Client;

const RETRIES: number = 5;

let initialized = false;
await ensureDBConnection();
initialized = true;

/* private */ async function ensureDBConnection(retries = RETRIES, delay = 1000) {
    while (retries--) {
        try {
            await pgClient.query('SELECT 1');

            if (initialized) await logs.logMessage("✅ Database connection successful.");
            return;
        } catch {
            if (retries < RETRIES - 1) {
                console.warn(`Reconnecting to DB... (${5 - retries}/5)`);
            } else {
                if (initialized) await logs.logWarning("❌ Attempting Database reconnection.");
            }

            pgClient?.end().catch(() => {});

            pgClient = new pg.Client({
                host:        process.env.DBHOST,
                port: Number(process.env.DBPORT),
                database:    process.env.DBNAME,
                user:        process.env.DBUSER,
                password:    process.env.DBPASS,
            });

            await pgClient.connect();
        }
        await delayInMilliseconds(delay *= 2);
    }
    throw new Error('Database reconnection failed');
}

export async function addGunSkin(minecraftUuid: string, skinUUID: string) {
    await ensureDBConnection();

    await pgClient.query(`
        INSERT INTO players_skins (minecraft_id, skin_id)
        VALUES ($1, $2);
    `,
    [ minecraftUuid, skinUUID ]);
}