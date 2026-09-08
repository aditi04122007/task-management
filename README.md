# TaskFlow

Task management application built with:

- **React** (Vite)
- **Tailwind CSS**
- **Node.js**
- **Express**
- **MySQL**
- **JWT (JSON Web Tokens)**

TaskFlow is a clean, modern, and production-ready full-stack task management application designed for productivity. It features robust user authentication, isolated multi-tenant workspaces, real-time statistics, search, multi-attribute filtering, whitelisted sorting, pagination, and a responsive SaaS dashboard with light and dark mode.

---

## Features

- 🔐 **Authentication & Security**
  - Secure user registration and login with bcrypt password hashing.
  - Stateless JWT token authorization.
  - Protected API routes and protected client routes with automatic session restoration.
  - Multi-tenant data isolation (users strictly access and manage only their own tasks).
- 📋 **Task Management (Full CRUD)**
  - Create, view, update, and delete tasks.
  - Instant "Mark Complete" quick action toggle.
  - Interactive deletion confirmation modals.
  - Full task detail pages (`/tasks/:id`).
- 🔍 **Search & Multi-Filter**
  - Real-time debounced search matching title and description.
  - Filter by status (`TODO`, `IN_PROGRESS`, `COMPLETED`).
  - Filter by priority (`LOW`, `MEDIUM`, `HIGH`).
  - Combine search and multiple filters simultaneously.
- ⚡ **Sorting & Pagination**
  - Whitelisted safe sorting by creation date, update date, due date, title, status, and priority (ascending/descending).
  - Configurable pagination with page navigation and items-per-page selector.
- 📊 **Real-time Statistics Dashboard**
  - Metric cards for Total Tasks, To Do, In Progress, Completed, and High Priority tasks.
  - Dynamic completion progress bar and quick-action shortcuts.
- 👤 **User Profile & Settings**
  - View account details and registration timestamp.
  - Edit name and email address with duplicate prevention.
  - Secure change password form with current password verification.
- 🎨 **Modern SaaS UI & Responsive Design**
  - Built with Tailwind CSS and Lucide React icons.
  - Light and Dark mode theme toggle persisted across reloads.
  - Responsive layout adapted for desktop, tablet, and mobile screens (with mobile drawer menu).
  - Toast notification alerts for user actions and error feedback.

---

## Project Structure

```
task-management-app/
├── backend/
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # Auth, profile, and password controllers
│   │   └── taskController.js   # Task CRUD, stats, search, sort, and pagination
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication middleware
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth routes
│   │   └── taskRoutes.js       # /api/tasks routes
│   ├── .env.example            # Backend env template
│   ├── server.js               # Express application entrypoint
│   ├── test_api.js             # Automated API and security test suite
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx    # Delete confirmation modal
│   │   │   ├── Loading.jsx         # Spinners & loading states
│   │   │   ├── Navbar.jsx          # Top navigation bar & theme toggle
│   │   │   ├── Pagination.jsx      # Page navigation controls
│   │   │   ├── ProtectedRoute.jsx  # Auth route guard
│   │   │   ├── Sidebar.jsx         # Responsive sidebar & mobile drawer
│   │   │   ├── StatsCard.jsx       # Metric cards
│   │   │   ├── TaskCard.jsx        # Task item card
│   │   │   └── TaskModal.jsx       # Create/Edit task modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state & token management
│   │   │   ├── TaskContext.jsx     # Task state, actions & filters
│   │   │   ├── ThemeContext.jsx    # Light/Dark mode state
│   │   │   └── ToastContext.jsx    # Toast notification popups
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Analytics & recent tasks
│   │   │   ├── Landing.jsx         # Public landing page
│   │   │   ├── Login.jsx           # Sign in page
│   │   │   ├── Profile.jsx         # Profile management
│   │   │   ├── Register.jsx        # Sign up page
│   │   │   ├── Settings.jsx        # Account settings & password change
│   │   │   ├── TaskDetails.jsx     # Single task view
│   │   │   └── Tasks.jsx           # Tasks list with search, filter, and pagination
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with auth interceptor
│   │   ├── App.jsx                 # Router & provider setup
│   │   ├── index.css               # Tailwind CSS base styles
│   │   └── main.jsx                # React root mount
│   ├── .env.example                # Frontend env template
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── schema.sql                      # MySQL database schema DDL
├── DEPLOYMENT.md                   # Production deployment guide
└── README.md
```

---

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) running locally

---

### 1. Database Setup

1. Open your MySQL shell or client (e.g. MySQL Workbench, phpMyAdmin, or CLI):
   ```bash
   mysql -u root -p
   ```
2. Import the schema:
   ```sql
   SOURCE path/to/schema.sql;
   ```
   Or run the queries in `schema.sql` directly:
   ```bash
   mysql -u root -p < schema.sql
   ```

---

### 2. Backend Setup

1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=task_management
   JWT_SECRET=your_jwt_secret_key_change_in_production
   FRONTEND_URL=http://localhost:5173
   ```
4. Run automated test suite:
   ```bash
   npm test
   ```
5. Start the backend server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```
   The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL` points to your backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. Build for production:
   ```bash
   npm run build
   ```

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Login with `email` and `password`, returns JWT token |
| `GET` | `/api/auth/profile` | JWT | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | JWT | Update user `name` and `email` |
| `PUT` | `/api/auth/change-password` | JWT | Change password with `currentPassword` & `newPassword` |

### Tasks (`/api/tasks`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | JWT | Get tasks with optional `search`, `status`, `priority`, `sort`, `order`, `page`, `limit` |
| `GET` | `/api/tasks/stats` | JWT | Get task statistics (`total`, `todo`, `inProgress`, `completed`, `highPriority`) |
| `GET` | `/api/tasks/:id` | JWT | Get single task by ID (user-isolated) |
| `POST` | `/api/tasks` | JWT | Create task (`title`, `description`, `status`, `priority`, `due_date`) |
| `PUT` | `/api/tasks/:id` | JWT | Update task by ID (user-isolated) |
| `DELETE` | `/api/tasks/:id` | JWT | Delete task by ID (user-isolated) |

---

## Security Best Practices
- Passwords hashed using bcrypt with salt rounds of 10.
- JWT tokens verified in middleware with user ownership validation.
- Whitelist protection on sorting attributes prevents SQL injection.
- Parameterized MySQL queries (`mysql2/promise`) prevent query injection.
- Database credentials and secrets are excluded from Git via `.gitignore`.
- No sensitive keys or database passwords exist in frontend bundles.

---

## License
ISC
