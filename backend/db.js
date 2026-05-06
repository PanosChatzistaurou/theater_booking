require('dotenv').config();

const mariadb = require('mariadb');

// CONNECTION POOL BEGIN

const pool = mariadb.createPool({
    host:             process.env.DB_HOST     || 'localhost',
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD,
    database:         process.env.DB_NAME     || 'theater_booking',
    port:             process.env.DB_PORT     || 3306,
    connectionLimit:  5
});

module.exports = pool;

// CONNECTION POOL END