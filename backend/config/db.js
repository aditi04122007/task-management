const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Check if a single connection URL was provided (like DATABASE_URL or MYSQL_URL)
const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;

let pool;

if (connectionString) {
    pool = mysql.createPool(connectionString);
} else {
    // Determine if SSL is needed (most cloud providers like TiDB, Aiven, or Railway require or support SSL)
    const isRemote = process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1";
    const useSSL = process.env.DB_SSL === "true" || (isRemote && (process.env.DB_HOST.includes("tidb") || process.env.DB_HOST.includes("aiven")));

    pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "task_management",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: useSSL ? { rejectUnauthorized: false } : undefined
    });
}

module.exports = pool;