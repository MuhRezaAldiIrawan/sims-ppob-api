const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sims_ppob",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
        return;
    }
    console.log("Database connected successfully");
    connection.release();
});

// Export promise-based pool
const promisePool = pool.promise();

module.exports = promisePool;
