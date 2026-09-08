# Production Deployment Guide: TaskFlow

This guide explains how to deploy **TaskFlow** to production with high availability, security, and scalability.

- **Frontend**: [Vercel](https://vercel.com/) (React + Vite)
- **Backend**: [Render](https://render.com/) (Node.js + Express)
- **Database**: Cloud MySQL (e.g. [Aiven](https://aiven.io/), [PlanetScale](https://planetscale.com/), [TiDB Cloud](https://tidbcloud.com/), or [Railway](https://railway.app/))

---

## 1. Create GitHub Repository

1. Go to [GitHub](https://github.com/new) and create a new repository called `taskflow` (or your preferred name).
2. Choose **Private** or **Public**. Do **not** initialize with a README (we already created one).

---

## 2. Initialize Git and Push Project

In your local terminal (from the project root directory `taskmanagment/`):

```bash
# Initialize git
git init

# Verify .gitignore is tracking node_modules and .env files properly
git status

# Add all project files
git add .

# Commit changes
git commit -m "feat: complete TaskFlow full-stack application with production setup"

# Link to GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git

# Push code to GitHub
git push -u origin main
```

> [!CAUTION]
> Double check that neither `backend/.env` nor `frontend/.env` is tracked by git. Run `git status` to verify.

---

## 3. Create Cloud MySQL Database

Sign up for a free cloud MySQL provider (such as [Aiven](https://aiven.io/), [TiDB Cloud](https://tidbcloud.com/), or [Railway](https://railway.app/)):

1. Create a new MySQL instance / cluster.
2. Select a free tier region closest to your backend hosting region.
3. Note your database credentials:
   - **Host** (e.g. `mysql-xxxx.aivencloud.com`)
   - **Port** (usually `3306` or customized)
   - **User** (e.g. `avnadmin`)
   - **Password**
   - **Database Name** (e.g. `task_management` or `defaultdb`)

---

## 4. Import / Create Database Tables

Connect to your cloud MySQL instance using your terminal or a tool like MySQL Workbench or DBeaver:

```bash
mysql -h YOUR_CLOUD_HOST -P YOUR_PORT -u YOUR_USER -p YOUR_DB_NAME < schema.sql
```

Alternatively, open the cloud SQL console or query editor and run the statements inside `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  status ENUM('TODO', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'TODO',
  priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  due_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 5. Deploy Backend to Render

1. Log into [Render](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo.
4. Configure the service settings:
   - **Name**: `taskflow-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

---

## 6. Add Backend Environment Variables

In the Render service settings, navigate to the **Environment** tab and add the following variables:

| Variable | Example Value | Description |
|---|---|---|
| `PORT` | `10000` | Port automatically assigned by Render |
| `DB_HOST` | `mysql-xxxx.aivencloud.com` | Your Cloud MySQL host |
| `DB_USER` | `avnadmin` | Your Cloud MySQL username |
| `DB_PASSWORD` | `your_cloud_db_password` | Your Cloud MySQL password |
| `DB_NAME` | `task_management` | Your database name |
| `JWT_SECRET` | `generate_a_long_random_string_here` | 64-char random hex key for JWT signing |
| `FRONTEND_URL` | `https://taskflow-frontend.vercel.app` | Leave blank initially; set once frontend is deployed |

Click **Save Changes** and wait for Render to build and deploy.

---

## 7. Retrieve Backend URL

Once the Render service is deployed, copy the assigned public URL:
`https://taskflow-backend-xxxx.onrender.com`

Verify it by visiting:
`https://taskflow-backend-xxxx.onrender.com/`
You should see:
```json
{
  "message": "TaskFlow API is running!"
}
```

---

## 8. Deploy Frontend to Vercel

1. Log into [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your `taskflow` repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:
   - `VITE_API_URL`: `https://taskflow-backend-xxxx.onrender.com/api` (use your actual backend Render URL + `/api`)
6. Click **Deploy**.

---

## 9. Configure CORS on Backend

Now that your frontend has a live URL (e.g. `https://taskflow-yourname.vercel.app`):

1. Return to your Render backend dashboard.
2. Go to **Environment**.
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://taskflow-yourname.vercel.app
   ```
4. Click **Save Changes** (Render will automatically redeploy with the updated CORS rule).

---

## 10. Test Production Deployment

Perform end-to-end testing on your live URL:

1. Visit your Vercel URL (`https://taskflow-yourname.vercel.app`).
2. Register a new user account at `/register`.
3. Log in with the registered credentials at `/login`.
4. Create new tasks with different statuses (`TODO`, `IN_PROGRESS`, `COMPLETED`) and priorities (`HIGH`, `MEDIUM`, `LOW`).
5. Test searching tasks and filtering by status and priority.
6. Test sorting and pagination.
7. Click **Mark Complete** and edit a task.
8. Delete a task using the confirmation modal.
9. Visit `/profile` and test updating your name and email.
10. Visit `/settings` and test the light/dark theme switch and changing your password.
11. Log out and ensure protected routes redirect cleanly to `/login`.

---

## 🔒 Security Checklist

- [x] Database credentials (`DB_PASSWORD`, `DB_USER`) are **never** committed to Git.
- [x] JWT Secret is kept confidential in backend environment variables.
- [x] Frontend only receives public data; user passwords are never returned in responses.
- [x] CORS is restricted to your production frontend domain.
- [x] Parameterized queries are used across all SQL endpoints.
