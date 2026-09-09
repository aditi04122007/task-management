const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Configure CORS to allow requests from frontend deployments
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "TaskFlow API is running!"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Fallback aliases so both /api/... and /... work
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            message: "MySQL connected successfully!",
            result: rows[0].result
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "MySQL connection failed"
        });
    }
});

app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        message: "Resource not found"
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});