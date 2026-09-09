const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/taskflow_local.json');

function ensureDataFile() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        const initial = {
            users: [],
            tasks: [],
            nextUserId: 1,
            nextTaskId: 1
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
}

function readData() {
    try {
        ensureDataFile();
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(content);
    } catch {
        return { users: [], tasks: [], nextUserId: 1, nextTaskId: 1 };
    }
}

function writeData(data) {
    try {
        ensureDataFile();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error("Fallback DB write error:", err);
    }
}

function filterTasks(tasks, sql, params) {
    let result = [...tasks];
    let paramIndex = 0;

    // Filter by user_id
    if (/user_id\s*=\s*\?/i.test(sql)) {
        const userId = Number(params[paramIndex++]);
        result = result.filter(t => Number(t.user_id) === userId);
    }

    // Filter by search (title LIKE ? OR description LIKE ?)
    if (/title\s+LIKE\s+\?\s+OR\s+description\s+LIKE\s+\?/i.test(sql)) {
        const searchPattern = String(params[paramIndex++]).replace(/^%|%$/g, '').toLowerCase();
        paramIndex++; // second parameter is duplicate for description
        result = result.filter(t => {
            const titleMatch = t.title && t.title.toLowerCase().includes(searchPattern);
            const descMatch = t.description && t.description.toLowerCase().includes(searchPattern);
            return titleMatch || descMatch;
        });
    }

    // Filter by status
    if (/status\s*=\s*\?/i.test(sql)) {
        const status = String(params[paramIndex++]).toUpperCase();
        result = result.filter(t => t.status && t.status.toUpperCase() === status);
    }

    // Filter by priority
    if (/priority\s*=\s*\?/i.test(sql)) {
        const priority = String(params[paramIndex++]).toUpperCase();
        result = result.filter(t => t.priority && t.priority.toUpperCase() === priority);
    }

    return result;
}

function sortTasks(tasks, sql) {
    const result = [...tasks];
    const orderMatch = sql.match(/ORDER\s+BY\s+([a-zA-Z_]+)\s+(ASC|DESC)/i);
    if (!orderMatch) return result;

    const field = orderMatch[1].toLowerCase();
    const isAsc = orderMatch[2].toUpperCase() === 'ASC';

    result.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string' && typeof valB === 'string') {
            return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return isAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
}

function paginateTasks(tasks, sql, params) {
    if (!/LIMIT\s+\?\s+OFFSET\s+\?/i.test(sql)) {
        return tasks;
    }

    // The last two parameters are limit and offset
    const offset = Number(params[params.length - 1]) || 0;
    const limit = Number(params[params.length - 2]) || 10;

    return tasks.slice(offset, offset + limit);
}

const fallbackDb = {
    async query(sql, params = []) {
        const cleanSql = sql.trim();
        const data = readData();

        // 1. SELECT 1 AS result (health check / db test)
        if (/SELECT\s+1\s+AS\s+result/i.test(cleanSql)) {
            return [[{ result: 1 }]];
        }

        // 2. USERS: SELECT id FROM users WHERE email = ? AND id != ?
        if (/SELECT\s+id\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?\s*AND\s*id\s*!=\s*\?/i.test(cleanSql)) {
            const [email, id] = params;
            const matches = data.users.filter(u => u.email.toLowerCase() === String(email).toLowerCase() && Number(u.id) !== Number(id));
            return [matches.map(u => ({ id: u.id }))];
        }

        // 3. USERS: SELECT id FROM users WHERE email = ?
        if (/SELECT\s+id\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(cleanSql)) {
            const [email] = params;
            const matches = data.users.filter(u => u.email.toLowerCase() === String(email).toLowerCase());
            return [matches.map(u => ({ id: u.id }))];
        }

        // 4. USERS: SELECT * FROM users WHERE email = ?
        if (/SELECT\s+\*\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(cleanSql)) {
            const [email] = params;
            const matches = data.users.filter(u => u.email.toLowerCase() === String(email).toLowerCase());
            return [matches];
        }

        // 5. USERS: SELECT id, name, email, created_at FROM users WHERE id = ?
        if (/SELECT\s+id,\s*name,\s*email,\s*created_at\s+FROM\s+users\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const [id] = params;
            const user = data.users.find(u => Number(u.id) === Number(id));
            return [user ? [{ id: user.id, name: user.name, email: user.email, created_at: user.created_at }] : []];
        }

        // 6. USERS: SELECT password FROM users WHERE id = ?
        if (/SELECT\s+password\s+FROM\s+users\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const [id] = params;
            const user = data.users.find(u => Number(u.id) === Number(id));
            return [user ? [{ password: user.password }] : []];
        }

        // 7. USERS: INSERT INTO users
        if (/INSERT\s+INTO\s+users/i.test(cleanSql)) {
            const [name, email, password] = params;
            const newId = data.nextUserId++;
            const newUser = {
                id: newId,
                name: String(name).trim(),
                email: String(email).trim().toLowerCase(),
                password,
                created_at: new Date().toISOString()
            };
            data.users.push(newUser);
            writeData(data);
            return [{ insertId: newId, affectedRows: 1 }];
        }

        // 8. USERS: UPDATE users SET name = ?, email = ? WHERE id = ?
        if (/UPDATE\s+users\s+SET\s+name\s*=\s*\?,\s*email\s*=\s*\?\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const [name, email, id] = params;
            const user = data.users.find(u => Number(u.id) === Number(id));
            if (user) {
                user.name = String(name).trim();
                user.email = String(email).trim().toLowerCase();
                writeData(data);
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 9. USERS: UPDATE users SET password = ? WHERE id = ?
        if (/UPDATE\s+users\s+SET\s+password\s*=\s*\?\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const [password, id] = params;
            const user = data.users.find(u => Number(u.id) === Number(id));
            if (user) {
                user.password = password;
                writeData(data);
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 10. TASKS: INSERT INTO tasks
        if (/INSERT\s+INTO\s+tasks/i.test(cleanSql)) {
            const [user_id, title, description, status, priority, due_date] = params;
            const newId = data.nextTaskId++;
            const newTask = {
                id: newId,
                user_id: Number(user_id),
                title: String(title).trim(),
                description: description && String(description).trim() ? String(description).trim() : null,
                status: status || 'TODO',
                priority: priority || 'MEDIUM',
                due_date: due_date || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            data.tasks.push(newTask);
            writeData(data);
            return [{ insertId: newId, affectedRows: 1 }];
        }

        // 11. TASKS: GET STATS (SELECT COUNT(*) AS total, SUM(...) FROM tasks WHERE user_id = ?)
        if (/SELECT\s+COUNT\(\*\)\s+AS\s+total/i.test(cleanSql) && /SUM\(CASE\s+WHEN\s+status/i.test(cleanSql)) {
            const [userId] = params;
            const userTasks = data.tasks.filter(t => Number(t.user_id) === Number(userId));
            const total = userTasks.length;
            const todo = userTasks.filter(t => t.status === 'TODO').length;
            const inProgress = userTasks.filter(t => t.status === 'IN_PROGRESS').length;
            const completed = userTasks.filter(t => t.status === 'COMPLETED').length;
            const highPriority = userTasks.filter(t => t.priority === 'HIGH').length;
            return [[{ total, todo, inProgress, completed, highPriority }]];
        }

        // 12. TASKS: SELECT * FROM tasks WHERE id = ? AND user_id = ?
        if (/SELECT\s+\*\s+FROM\s+tasks\s+WHERE\s+id\s*=\s*\?\s*AND\s*user_id\s*=\s*\?/i.test(cleanSql)) {
            const [taskId, userId] = params;
            const task = data.tasks.find(t => Number(t.id) === Number(taskId) && Number(t.user_id) === Number(userId));
            return [task ? [task] : []];
        }

        // 13. TASKS: UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?
        if (/UPDATE\s+tasks\s+SET/i.test(cleanSql)) {
            const [title, description, status, priority, due_date, taskId, userId] = params;
            const task = data.tasks.find(t => Number(t.id) === Number(taskId) && Number(t.user_id) === Number(userId));
            if (task) {
                task.title = String(title).trim();
                task.description = description && String(description).trim() ? String(description).trim() : null;
                task.status = status || 'TODO';
                task.priority = priority || 'MEDIUM';
                task.due_date = due_date || null;
                task.updated_at = new Date().toISOString();
                writeData(data);
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 14. TASKS: DELETE FROM tasks WHERE id = ? AND user_id = ?
        if (/DELETE\s+FROM\s+tasks\s+WHERE\s+id\s*=\s*\?\s*AND\s*user_id\s*=\s*\?/i.test(cleanSql)) {
            const [taskId, userId] = params;
            const index = data.tasks.findIndex(t => Number(t.id) === Number(taskId) && Number(t.user_id) === Number(userId));
            if (index !== -1) {
                data.tasks.splice(index, 1);
                writeData(data);
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 15. TASKS: COUNT with filters (SELECT COUNT(*) AS total FROM tasks WHERE ...)
        if (/SELECT\s+COUNT\(\*\)\s+AS\s+total\s+FROM\s+tasks\s+WHERE/i.test(cleanSql)) {
            const filtered = filterTasks(data.tasks, cleanSql, params);
            return [[{ total: filtered.length }]];
        }

        // 16. TASKS: SELECT * FROM tasks WHERE user_id = ? ...
        if (/SELECT\s+\*\s+FROM\s+tasks\s+WHERE/i.test(cleanSql)) {
            let filtered = filterTasks(data.tasks, cleanSql, params);
            filtered = sortTasks(filtered, cleanSql);
            filtered = paginateTasks(filtered, cleanSql, params);
            return [filtered];
        }

        return [[]];
    }
};

module.exports = fallbackDb;
