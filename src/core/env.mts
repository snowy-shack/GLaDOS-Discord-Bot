/**
 * Environment variables. Import after envloader so dotenv has run.
 * TOKEN is validated when used (client.init / register); DB vars when DB connects.
 */

export const env = {
    get TOKEN(): string {
        const v = process.env.TOKEN;
        if (v === undefined || v === "") throw new Error("Missing required environment variable: TOKEN");
        return v;
    },
    DBHOST: process.env.DBHOST,
    DBPORT: process.env.DBPORT,
    DBNAME: process.env.DBNAME,
    DBUSER: process.env.DBUSER,
    DBPASS: process.env.DBPASS,
    APIKEY: process.env.APIKEY,
} as const;

export function requireDatabaseEnv(): { host: string; port: number; database: string; user: string; password: string } {
    const host = process.env.DBHOST;
    const port = process.env.DBPORT;
    const database = process.env.DBNAME;
    const user = process.env.DBUSER;
    const password = process.env.DBPASS;
    if (!host || !database || !user || password === undefined)
        throw new Error("Missing required DB env: DBHOST, DBNAME, DBUSER, DBPASS");
    return { host, port: Number(port) || 5432, database, user, password };
}
