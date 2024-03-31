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

module.exports = { incBoostingDay };