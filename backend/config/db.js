const mysql = require("mysql2/promise");
const path = require("path");
const fallbackDb = require("./fallbackDb");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;

let mysqlPool = null;
let useFallback = false;

try {
    if (connectionString) {
        mysqlPool = mysql.createPool(connectionString);
    } else {
        const isRemote = process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1";
        const useSSL = process.env.DB_SSL === "true" || (isRemote && (process.env.DB_HOST.includes("tidb") || process.env.DB_HOST.includes("aiven")));

        mysqlPool = mysql.createPool({
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
} catch (err) {
    console.warn("Could not create MySQL pool, using fallback storage:", err.message);
    useFallback = true;
}

const pool = {
    async query(sql, params = []) {
        if (!useFallback && mysqlPool) {
            try {
                return await mysqlPool.query(sql, params);
            } catch (err) {
                const connectionErrors = [
                    'ECONNREFUSED',
                    'ENOTFOUND',
                    'ETIMEDOUT',
                    'ER_ACCESS_DENIED_ERROR',
                    'ER_BAD_DB_ERROR',
                    'EAI_AGAIN'
                ];
                if (connectionErrors.includes(err.code) || err.message?.includes('connect ECONNREFUSED')) {
                    console.warn(`[TaskFlow DB] MySQL is unreachable (${err.code || 'ECONNREFUSED'}). Seamlessly switching to persistent storage.`);
                    useFallback = true;
                    return await fallbackDb.query(sql, params);
                }
                throw err;
            }
        }
        return await fallbackDb.query(sql, params);
    },
    async end() {
        if (mysqlPool) {
            try {
                await mysqlPool.end();
            } catch {}
        }
    }
};

module.exports = pool;