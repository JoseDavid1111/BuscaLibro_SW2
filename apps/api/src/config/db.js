const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'buscalibro',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    },
});

module.exports = { db };