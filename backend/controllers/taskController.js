const pool = require("../config/db");

const VALID_STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const ALLOWED_SORT_FIELDS = ["created_at", "updated_at", "due_date", "title", "priority", "status"];

const isValidDate = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

// CREATE TASK
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            due_date
        } = req.body;

        // Step 12: Validation
        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required and cannot be empty"
            });
        }

        const taskStatus = status ? status.trim().toUpperCase() : "TODO";
        if (status && !VALID_STATUSES.includes(taskStatus)) {
            return res.status(400).json({
                message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`
            });
        }

        const taskPriority = priority ? priority.trim().toUpperCase() : "MEDIUM";
        if (priority && !VALID_PRIORITIES.includes(taskPriority)) {
            return res.status(400).json({
                message: `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(", ")}`
            });
        }

        const formattedDueDate = due_date && String(due_date).trim() !== "" ? String(due_date).trim() : null;
        if (formattedDueDate && !isValidDate(formattedDueDate)) {
            return res.status(400).json({
                message: "Invalid due_date format. Please provide a valid date string."
            });
        }

        const userId = req.user.id;

        const [result] = await pool.query(
            `INSERT INTO tasks
            (user_id, title, description, status, priority, due_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title.trim(),
                description && description.trim() ? description.trim() : null,
                taskStatus,
                taskPriority,
                formattedDueDate
            ]
        );

        res.status(201).json({
            message: "Task created successfully",
            taskId: result.insertId
        });

    } catch (error) {
        console.error("Create task error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// GET ALL TASKS (with Search, Filter, Sort, and Optional Pagination)
const getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search, status, priority, sort, order, page, limit } = req.query;

        let whereClauses = ["user_id = ?"];
        let queryParams = [userId];

        // Step 14: Search in title and description
        if (search && search.trim() !== "") {
            const searchTerm = `%${search.trim()}%`;
            whereClauses.push("(title LIKE ? OR description LIKE ?)");
            queryParams.push(searchTerm, searchTerm);
        }

        // Step 15: Filter by status
        if (status && VALID_STATUSES.includes(status.trim().toUpperCase())) {
            whereClauses.push("status = ?");
            queryParams.push(status.trim().toUpperCase());
        }

        // Step 15: Filter by priority
        if (priority && VALID_PRIORITIES.includes(priority.trim().toUpperCase())) {
            whereClauses.push("priority = ?");
            queryParams.push(priority.trim().toUpperCase());
        }

        const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

        // Step 16: Whitelisted Sorting
        let sortField = "created_at";
        if (sort && ALLOWED_SORT_FIELDS.includes(sort.toLowerCase())) {
            sortField = sort.toLowerCase();
        }

        let sortOrder = "DESC";
        if (order && order.toLowerCase() === "asc") {
            sortOrder = "ASC";
        }

        // Step 17: Optional Pagination
        const isPaginated = page !== undefined || limit !== undefined;

        if (isPaginated) {
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
            const offset = (pageNum - 1) * limitNum;

            // Total count query
            const [countRows] = await pool.query(
                `SELECT COUNT(*) AS total FROM tasks ${whereSQL}`,
                queryParams
            );
            const total = countRows[0].total;
            const totalPages = Math.ceil(total / limitNum) || 1;

            // Tasks query with LIMIT & OFFSET
            const [tasks] = await pool.query(
                `SELECT * FROM tasks ${whereSQL} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
                [...queryParams, limitNum, offset]
            );

            return res.json({
                message: "Tasks fetched successfully",
                tasks: tasks,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: total,
                    totalPages: totalPages
                }
            });
        }

        // Return all tasks if pagination is not specified
        const [tasks] = await pool.query(
            `SELECT * FROM tasks ${whereSQL} ORDER BY ${sortField} ${sortOrder}`,
            queryParams
        );

        res.json({
            message: "Tasks fetched successfully",
            tasks: tasks
        });

    } catch (error) {
        console.error("Get tasks error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// GET SINGLE TASK BY ID
const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const [tasks] = await pool.query(
            `SELECT *
             FROM tasks
             WHERE id = ? AND user_id = ?`,
            [taskId, userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task fetched successfully",
            task: tasks[0]
        });

    } catch (error) {
        console.error("Get task error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const {
            title,
            description,
            status,
            priority,
            due_date
        } = req.body;

        // Step 12: Validation
        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required and cannot be empty"
            });
        }

        const taskStatus = status ? status.trim().toUpperCase() : "TODO";
        if (status && !VALID_STATUSES.includes(taskStatus)) {
            return res.status(400).json({
                message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`
            });
        }

        const taskPriority = priority ? priority.trim().toUpperCase() : "MEDIUM";
        if (priority && !VALID_PRIORITIES.includes(taskPriority)) {
            return res.status(400).json({
                message: `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(", ")}`
            });
        }

        const formattedDueDate = due_date && String(due_date).trim() !== "" ? String(due_date).trim() : null;
        if (formattedDueDate && !isValidDate(formattedDueDate)) {
            return res.status(400).json({
                message: "Invalid due_date format. Please provide a valid date string."
            });
        }

        const [result] = await pool.query(
            `UPDATE tasks
             SET title = ?,
                 description = ?,
                 status = ?,
                 priority = ?,
                 due_date = ?
             WHERE id = ? AND user_id = ?`,
            [
                title.trim(),
                description && description.trim() ? description.trim() : null,
                taskStatus,
                taskPriority,
                formattedDueDate,
                taskId,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully"
        });

    } catch (error) {
        console.error("Update task error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// STEP 11: DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const [result] = await pool.query(
            "DELETE FROM tasks WHERE id = ? AND user_id = ?",
            [taskId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("Delete task error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// STEP 13: GET TASK STATISTICS
const getTaskStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            `SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'TODO' THEN 1 ELSE 0 END) AS todo,
                SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgress,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) AS highPriority
             FROM tasks
             WHERE user_id = ?`,
            [userId]
        );

        const stats = rows[0] || {};

        res.json({
            total: Number(stats.total) || 0,
            todo: Number(stats.todo) || 0,
            inProgress: Number(stats.inProgress) || 0,
            completed: Number(stats.completed) || 0,
            highPriority: Number(stats.highPriority) || 0
        });

    } catch (error) {
        console.error("Get task stats error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats
};