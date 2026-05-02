# EventPro — Event Planning & Task Manager

A professional full-stack MERN application for planning events, assigning tasks, and tracking progress with role-based access control.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Sequelize |
| Auth | JWT + bcryptjs |
| Charts | Chart.js + react-chartjs-2 |

---

## 📁 Project Structure

```
ethara.ai/
├── backend/          # Express API server
│   ├── config/       # DB connection
│   ├── controllers/  # Business logic
│   ├── middleware/   # JWT auth + role guard
│   ├── models/       # Sequelize models
│   ├── routes/       # API routes
│   └── server.js
│
└── frontend/         # React + Vite app
    └── src/
        ├── components/  # Reusable UI components
        ├── context/     # Auth context
        ├── pages/       # Route pages
        └── services/    # API calls
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** running locally OR a MongoDB Atlas connection string

---

## 🛠️ Setup & Installation

### 1. Clone / Navigate to Project

```bash
cd ethara.ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` — set your MongoDB URI:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/event_manager
JWT_SECRET=eventmanager_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

> **Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://<username>:<password>@cluster.mongodb.net/event_manager`

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Default Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Create/edit/delete events & tasks, manage team members, assign tasks |
| **Member** | View assigned tasks, update task status only |

> Register your first user and select **Admin** to get full access.

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |
| GET | `/api/auth/users` | Admin |

### Events
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/events` | Protected |
| POST | `/api/events` | Admin |
| GET | `/api/events/:id` | Protected |
| PUT | `/api/events/:id` | Admin |
| DELETE | `/api/events/:id` | Admin |
| POST | `/api/events/:id/members` | Admin |
| DELETE | `/api/events/:id/members/:userId` | Admin |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tasks` | Protected |
| POST | `/api/tasks` | Admin |
| GET | `/api/tasks/:id` | Protected |
| PUT | `/api/tasks/:id` | Admin (full) / Member (status only) |
| DELETE | `/api/tasks/:id` | Admin |
| GET | `/api/tasks/stats` | Protected |

---

## 🗃️ Database Schemas

### User
```json
{ "name": "string", "email": "string (unique)", "password": "hashed", "role": "admin|member" }
```

### Event
```json
{ "title": "string", "description": "string", "date": "Date", "location": "string", "status": "upcoming|ongoing|completed|cancelled", "createdBy": "User ref", "members": [{ "user": "User ref", "role": "admin|member" }] }
```

### Task
```json
{ "title": "string", "description": "string", "status": "To Do|In Progress|Completed", "priority": "High|Medium|Low", "deadline": "Date", "event": "Event ref", "assignedTo": "User ref", "createdBy": "User ref" }
```

---

## 🎨 Features

- ✅ JWT Authentication with auto-refresh
- ✅ Role-based access control (Admin / Member)
- ✅ Event management with team members
- ✅ Task management with priorities, deadlines, status
- ✅ Dashboard with Chart.js analytics (Doughnut + Bar charts)
- ✅ Overdue task detection & alerts
- ✅ Search & filter tasks by status, priority, event
- ✅ Dark theme with glassmorphism UI
- ✅ Responsive design
- ✅ Toast notifications

---

## 🖥️ Running Both Servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd ethara.ai/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd ethara.ai/frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.
