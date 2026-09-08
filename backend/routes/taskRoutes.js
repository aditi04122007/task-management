const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    createTask,
    getTasks,
    getTaskStats,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

// STEP 13: GET TASK STATISTICS
// NOTE: Must be defined before /:id to prevent Express from treating "stats" as an ID
router.get(
    "/stats",
    authenticateToken,
    getTaskStats
);

// GET ALL TASKS (with Search, Filter, Sort, Pagination)
router.get(
    "/",
    authenticateToken,
    getTasks
);

// GET SINGLE TASK
router.get(
    "/:id",
    authenticateToken,
    getTaskById
);

// CREATE TASK
router.post(
    "/",
    authenticateToken,
    createTask
);

// UPDATE TASK
router.put(
    "/:id",
    authenticateToken,
    updateTask
);

// STEP 11: DELETE TASK
router.delete(
    "/:id",
    authenticateToken,
    deleteTask
);

module.exports = router;