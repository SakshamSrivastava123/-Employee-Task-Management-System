# Employee & Task Management System (MERN)

React (Vite) + Node.js/Express + MongoDB (Mongoose). No authentication, as per the brief.
All business rules are enforced on the **backend**; the frontend only mirrors them for fast feedback.

```
server/   Express API  (routes -> controllers -> services -> models)
client/   React app    (pages -> components -> api / hooks / utils)
```

## Setup

Requirements: Node 18+, a MongoDB instance (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env        # fill in MONGODB_URI
npm install
npm run dev                 # http://localhost:5000

# 2. Web app
cd ../client
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

### Environment variables

| File | Variable | Purpose |
|------|----------|---------|
| server/.env | `PORT` | API port (default 5000) |
| server/.env | `MONGODB_URI` | MongoDB connection string |
| server/.env | `CLIENT_ORIGIN` | Comma-separated allowed frontend origins (CORS) |
| server/.env | `TIMEZONE_OFFSET_MINUTES` | Minutes added to UTC to decide what "today" is for overdue (IST = 330) |
| client/.env | `VITE_API_URL` | API base URL, ending in `/api` |

No secrets are committed; only `.env.example` files are.

### Deployment (suggested)
- **API**: Render Web Service, root `server`, build `npm install`, start `npm start`, set the env vars above (Atlas URI, `CLIENT_ORIGIN` = frontend URL).
- **Frontend**: Netlify/Vercel, root `client`, build `npm run build`, publish `dist`, set `VITE_API_URL` to the Render URL + `/api`. `client/public/_redirects` makes deep links (e.g. `/tasks?page=2`) work on refresh.

## API overview

All list endpoints return `{ success, data, pagination: { page, limit, total, totalPages } }`.
Errors return `{ success: false, message, errors: [{ field, message }] }` with **400** (invalid data / broken rule), **404** (not found) or **409** (duplicate Employee ID / email).

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/employees` | `page, limit, search (name/email/ID), department, status, sortBy (createdAt/fullName/joiningDate/employeeId), order` |
| GET | `/api/employees/lookup` | Small list for the assignee dropdown (excludes Inactive) |
| POST / GET / PUT / DELETE | `/api/employees[/:id]` | Employee ID is immutable after creation |
| GET | `/api/tasks` | `page, limit, search (title / employee name), department, priority, status, dueFrom, dueTo, overdue, assignedEmployee, sortBy (createdAt/dueDate/priority/title), order` - all filters combine |
| GET | `/api/tasks/export` | CSV of **all** tasks matching the same filters (no pagination) |
| POST / GET / PUT / DELETE | `/api/tasks[/:id]` | Create always starts as `Todo`; PUT rejects `status`, `completedDate`, `taskId`, `createdAt` |
| PUT | `/api/tasks/:id/status` | The only way to change status. Body: `{ "status": "In Progress" }` |
| GET | `/api/dashboard` | Counts, overdue, per-priority/department, employee workload - all computed in MongoDB / server |

Each task in a response includes `isOverdue` and `allowedNextStatuses`, so list, details, dashboard and CSV all use the same server-side logic, and the UI status dropdown simply renders what the server allows.

## Schema and relationship

**Employee**: `employeeId` (unique, upper-cased), `fullName`, `email` (unique, trimmed, lower-cased), `phone`, `department`, `role`, `joiningDate`, `status`, `skills[]`, `leaveStart` / `leaveEnd` (only when On Leave, otherwise removed), `activeTaskCount` (maintained atomically, see Q6).

**Task**: `taskId` (auto, `TSK-0001` from an atomic counter), `title`, `description`, `assignedEmployee` (ObjectId -> Employee), `employeeSnapshot` `{employeeId, fullName, email, department}`, `employeeDeleted`, `department`, `priority` + `priorityRank`, `status`, `startDate`, `dueDate`, `createdAt`, `completedDate`.

**Employee 1 -> N Task** through `Task.assignedEmployee`.

### How employee deletion is handled
1. Deletion is refused (400, with a clear message) while the employee has Todo / In Progress tasks.
2. Otherwise the employee is deleted, and all their tasks get `employeeDeleted: true` plus a fresh `employeeSnapshot`.
3. Old tasks therefore still show name, ID, email and department (marked "removed employee"), and remain searchable by employee name. The snapshot is also refreshed whenever an employee is edited.

## Assumptions
- A task's Department is chosen independently of the employee's department (the brief does not require them to match).
- Dates are date-only (`YYYY-MM-DD`, stored as UTC midnight). "Today" uses `TIMEZONE_OFFSET_MINUTES`.
- Assignment rules are re-checked on edit only when the employee or the Start Date changes, so unrelated edits are not blocked by a later change in the employee's status.
- Changing an employee to Inactive / On Leave does not touch tasks they already hold.
- Task delete is allowed for any status (only *editing* is blocked for Completed / Cancelled); it frees the employee's slot if the task was open.
- Due-date filter is a range (`dueFrom` / `dueTo`) plus an "Overdue only" toggle.
- Broken-rule and "status changed by another request" errors use 400; 409 is reserved for duplicates.

