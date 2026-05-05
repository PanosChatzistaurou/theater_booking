require('dotenv').config(); 
const mariadb = require('mariadb');

const pool = mariadb.createPool({
     host: process.env.DB_HOST || 'localhost', 
     user: process.env.DB_USER || 'root', 
     password: process.env.DB_PASSWORD,
     database: 'theater_booking',
     port: process.env.DB_PORT || 3000,
     connectionLimit: 5
});

module.exports = pool;