const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const TEST_PORT = 5002;
let server;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ ASSERTION FAILED: ${message}`);
        throw new Error(message);
    }
    console.log(`✅ ${message}`);
}

async function runTests() {
    console.log("=== STARTING FULL BACKEND API SUITE (STEPS 1-20) ===");
    server = app.listen(TEST_PORT);
    const BASE_URL = `http://localhost:${TEST_PORT}/api`;

    try {
        const uniqueSuffix = Date.now();
        const userAEmail = `user_a_${uniqueSuffix}@example.com`;
        const userBEmail = `user_b_${uniqueSuffix}@example.com`;
        const passwordA = "SecretPass123!";
        const newPasswordA = "NewSecretPass456!";

        // 1. REGISTER USER A
        console.log("\n--- Testing Registration (Step 5) ---");
        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "User A", email: userAEmail, password: passwordA })
        });
        assert(res.status === 201, "User A registered successfully with status 201");
        const regA = await res.json();
        assert(regA.userId, "User A received userId");

        // 2. DUPLICATE REGISTER
        res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Duplicate User", email: userAEmail, password: passwordA })
        });
        assert(res.status === 409, "Duplicate registration rejected with 409 Conflict");

        // 3. REGISTER USER B (For multi-tenant isolation tests)
        res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "User B", email: userBEmail, password: passwordA })
        });
        assert(res.status === 201, "User B registered successfully with status 201");

        // 4. LOGIN USER A (Step 6)
        console.log("\n--- Testing Login (Step 6) ---");
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userAEmail, password: "WrongPassword" })
        });
        assert(res.status === 401, "Wrong password rejected with 401 Unauthorized");

        res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userAEmail, password: passwordA })
        });
        assert(res.status === 200, "User A logged in successfully with status 200");
        const loginA = await res.json();
        const tokenA = loginA.token;
        assert(tokenA, "JWT token received for User A");

        // LOGIN USER B
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userBEmail, password: passwordA })
        });
        const loginB = await res.json();
        const tokenB = loginB.token;

        // 5. GET PROFILE (Step 18)
        console.log("\n--- Testing User Profile API (Step 18) ---");
        res = await fetch(`${BASE_URL}/auth/profile`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        assert(res.status === 200, "User profile retrieved with 200 OK");
        const profileData = await res.json();
        assert(profileData.user && profileData.user.email === userAEmail, "Profile contains correct email");
        assert(profileData.user.password === undefined, "Profile does NOT expose password");

        // 6. UPDATE PROFILE (Step 19)
        console.log("\n--- Testing Update Profile API (Step 19) ---");
        const updatedNameA = "User A Updated";
        res = await fetch(`${BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({ name: updatedNameA, email: userAEmail })
        });
        assert(res.status === 200, "Profile updated with 200 OK");
        const updatedProfile = await res.json();
        assert(updatedProfile.user.name === updatedNameA, "Profile name updated in response");

        // Duplicate email rejection on profile update
        res = await fetch(`${BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({ name: updatedNameA, email: userBEmail })
        });
        assert(res.status === 409, "Email conflict on profile update rejected with 409");

        // 7. CHANGE PASSWORD (Step 20)
        console.log("\n--- Testing Change Password (Step 20) ---");
        res = await fetch(`${BASE_URL}/auth/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({ currentPassword: "WrongOldPassword", newPassword: newPasswordA })
        });
        assert(res.status === 401, "Incorrect current password rejected with 401");

        res = await fetch(`${BASE_URL}/auth/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({ currentPassword: passwordA, newPassword: newPasswordA })
        });
        assert(res.status === 200, "Password changed successfully with 200 OK");

        // Verify login with new password
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userAEmail, password: newPasswordA })
        });
        assert(res.status === 200, "Login with newly changed password succeeded");

        // 8. TASK VALIDATION (Step 12)
        console.log("\n--- Testing Task Validation (Step 12) ---");
        // Missing title
        res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({ title: "   ", description: "Empty title test" })
        });
        assert(res.status === 400, "Empty task title rejected with 400 Bad Request");

        // Invalid status
        res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({ title: "Valid Title", status: "INVALID_STATUS" })
        });
        assert(res.status === 400, "Invalid task status rejected with 400 Bad Request");

        // Invalid priority
        res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({ title: "Valid Title", priority: "SUPER_URGENT" })
        });
        assert(res.status === 400, "Invalid task priority rejected with 400 Bad Request");

        // 9. CREATE TASKS (Step 8)
        console.log("\n--- Testing Task Creation (Step 8) ---");
        const task1Res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({
                title: "Task 1: Complete Documentation",
                description: "Write comprehensive README and deployment guide",
                status: "TODO",
                priority: "HIGH",
                due_date: "2026-10-01"
            })
        });
        assert(task1Res.status === 201, "Task 1 created with status 201");
        const task1Data = await task1Res.json();
        const task1Id = task1Data.taskId;

        const task2Res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({
                title: "Task 2: Build Frontend",
                description: "React Vite Tailwind CSS application setup",
                status: "IN_PROGRESS",
                priority: "HIGH",
                due_date: "2026-10-05"
            })
        });
        const task2Data = await task2Res.json();
        const task2Id = task2Data.taskId;

        const task3Res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({
                title: "Task 3: Unit Tests",
                description: "Run automated API tests",
                status: "COMPLETED",
                priority: "LOW",
                due_date: "2026-10-10"
            })
        });
        const task3Data = await task3Res.json();
        const task3Id = task3Data.taskId;

        // 10. GET SINGLE TASK (Step 10)
        console.log("\n--- Testing Get Single Task (Step 10) ---");
        res = await fetch(`${BASE_URL}/tasks/${task1Id}`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        assert(res.status === 200, "Single task fetched with 200 OK");
        const singleTask = await res.json();
        assert(singleTask.task.title === "Task 1: Complete Documentation", "Task title matches");

        // 11. UPDATE TASK (Step 11 requirement in previous steps)
        console.log("\n--- Testing Update Task ---");
        res = await fetch(`${BASE_URL}/tasks/${task1Id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenA}`
            },
            body: JSON.stringify({
                title: "Task 1: Complete Documentation Updated",
                description: "Updated description",
                status: "IN_PROGRESS",
                priority: "MEDIUM",
                due_date: "2026-10-02"
            })
        });
        assert(res.status === 200, "Task updated successfully with 200 OK");

        // 12. GET TASK STATISTICS (Step 13)
        console.log("\n--- Testing Task Statistics (Step 13) ---");
        res = await fetch(`${BASE_URL}/tasks/stats`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        assert(res.status === 200, "Task stats endpoint returned 200 OK");
        const stats = await res.json();
        console.log("Stats received:", stats);
        assert(typeof stats.total === "number", "stats.total is a number");
        assert(typeof stats.todo === "number", "stats.todo is a number");
        assert(typeof stats.inProgress === "number", "stats.inProgress is a number");
        assert(typeof stats.completed === "number", "stats.completed is a number");
        assert(typeof stats.highPriority === "number", "stats.highPriority is a number");
        assert(stats.total === 3, "Total count is 3 for User A");

        // 13. SEARCH TASKS (Step 14)
        console.log("\n--- Testing Search Tasks (Step 14) ---");
        res = await fetch(`${BASE_URL}/tasks?search=Frontend`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        const searchRes = await res.json();
        assert(searchRes.tasks.length === 1 && searchRes.tasks[0].id === task2Id, "Search found matching task");

        // 14. FILTER TASKS (Step 15)
        console.log("\n--- Testing Filter Tasks (Step 15) ---");
        res = await fetch(`${BASE_URL}/tasks?status=COMPLETED`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        const filterStatusRes = await res.json();
        assert(filterStatusRes.tasks.length === 1 && filterStatusRes.tasks[0].id === task3Id, "Filter by status COMPLETED works");

        res = await fetch(`${BASE_URL}/tasks?priority=HIGH`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        const filterPriorityRes = await res.json();
        assert(filterPriorityRes.tasks.length === 1 && filterPriorityRes.tasks[0].id === task2Id, "Filter by priority HIGH works");

        // 15. SORT TASKS (Step 16)
        console.log("\n--- Testing Sort Tasks (Step 16) ---");
        res = await fetch(`${BASE_URL}/tasks?sort=due_date&order=asc`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        const sortRes = await res.json();
        assert(sortRes.tasks.length === 3, "Sort returns all 3 tasks");
        assert(sortRes.tasks[0].id === task1Id, "Tasks correctly sorted by due_date ASC");

        // 16. PAGINATION (Step 17)
        console.log("\n--- Testing Pagination (Step 17) ---");
        res = await fetch(`${BASE_URL}/tasks?page=1&limit=2`, {
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        const pageRes = await res.json();
        assert(pageRes.tasks.length === 2, "Page limit 2 returns 2 items");
        assert(pageRes.pagination.total === 3, "Pagination total is 3");
        assert(pageRes.pagination.totalPages === 2, "Pagination totalPages is 2");

        // 17. MULTI-TENANT ISOLATION / SECURITY CHECK
        console.log("\n--- Testing Multi-Tenant Security Isolation ---");
        // User B cannot see User A's tasks
        res = await fetch(`${BASE_URL}/tasks`, {
            headers: { "Authorization": `Bearer ${tokenB}` }
        });
        const userBTasks = await res.json();
        assert(userBTasks.tasks.length === 0, "User B cannot see User A's tasks");

        // User B cannot get User A's task by ID
        res = await fetch(`${BASE_URL}/tasks/${task1Id}`, {
            headers: { "Authorization": `Bearer ${tokenB}` }
        });
        assert(res.status === 404, "User B receives 404 when querying User A's task");

        // User B cannot update User A's task
        res = await fetch(`${BASE_URL}/tasks/${task1Id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenB}`
            },
            body: JSON.stringify({ title: "Hacked Title" })
        });
        assert(res.status === 404, "User B receives 404 when updating User A's task");

        // User B cannot delete User A's task
        res = await fetch(`${BASE_URL}/tasks/${task1Id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${tokenB}` }
        });
        assert(res.status === 404, "User B receives 404 when attempting to delete User A's task");

        // 18. DELETE TASK (Step 11)
        console.log("\n--- Testing Delete Task (Step 11) ---");
        res = await fetch(`${BASE_URL}/tasks/${task3Id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        assert(res.status === 200, "User A deleted own task with 200 OK");
        const deleteMsg = await res.json();
        assert(deleteMsg.message === "Task deleted successfully", "Delete message matches requirement");

        // Deleting already deleted task returns 404
        res = await fetch(`${BASE_URL}/tasks/${task3Id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${tokenA}` }
        });
        assert(res.status === 404, "Deleting non-existent task returns 404 Not Found");

        console.log("\n🎉 ALL BACKEND API AND SECURITY TESTS PASSED SUCCESSFULLY! 🎉\n");
    } catch (err) {
        console.error("Test error:", err);
        process.exitCode = 1;
    } finally {
        if (server) {
            server.close();
        }
        await pool.end();
        process.exit(process.exitCode || 0);
    }
}

runTests();
