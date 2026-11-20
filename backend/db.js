const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '.env')
});

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const db = new Pool({
    ...(connectionString ? { connectionString } : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    }),
    ...(process.env.VERCEL || process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
});

module.exports = db;
