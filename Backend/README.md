# BRIGHT LEARN Backend

## Overview
This is the backend for the BRIGHT LEARN e-learning platform, built with Node.js, Express.js, and a JSON-based database (lowdb). It supports students, teachers, and admins with secure, modular, and scalable RESTful APIs.

## Tech Stack
- Node.js
- Express.js
- lowdb (JSON database)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)

## Project Structure
- `server.js`: Main Express app
- `routes/`: API route files
- `controllers/`: Business logic
- `db/`: lowdb config and JSON data
- `middleware/`: Auth, error, rate limit
- `lib/mockData.js`: Initial mock data

## API Endpoints

### Homepage
- `GET /api/courses`: List all courses
- `POST /api/auth/login`: User login (returns JWT)
- `POST /api/auth/signup`: User signup

### Student Dashboard
- `GET /api/students/:id/courses`: Enrolled courses, progress, grades
- `GET /api/students/:id/grades`: Table of grades
- `POST /api/students/:id/enroll`: Enroll in course
- `GET /api/students/:id/notifications`: Notifications
- `PATCH /api/students/:id/profile`: Update profile
- `POST /api/assignments/:id/submit`: Submit assignment

### Teacher Dashboard
- `GET /api/teachers/:id/courses`: Teacher's courses
- `POST /api/teachers/courses`: Create course
- `PATCH /api/teachers/courses/:id`: Update course
- `DELETE /api/teachers/courses/:id`: Delete course
- `POST /api/teachers/assignments`: Create assignment/quiz
- `GET /api/teachers/assignments/:id/submissions`: Assignment submissions
- `PATCH /api/teachers/assignments/:id/submissions/:studentId`: Grade submission
- `GET /api/teachers/:id/students`: Students in teacher's courses
- `GET /api/teachers/:id/analytics`: Analytics

### Admin Dashboard
- `GET /api/admin/teachers`: List teachers
- `POST /api/admin/teachers`: Create teacher
- `PATCH /api/admin/teachers/:id`: Update teacher
- `DELETE /api/admin/teachers/:id`: Deactivate teacher
- `GET /api/admin/students`: List students
- `PATCH /api/admin/students/:id`: Update student
- `DELETE /api/admin/students/:id`: Deactivate student
- `POST /api/admin/disciplinary`: Record disciplinary action
- `GET /api/admin/courses`: List courses
- `POST /api/admin/courses`: Create course
- `PATCH /api/admin/courses/:id`: Update course
- `DELETE /api/admin/courses/:id`: Delete course
- `GET /api/admin/analytics`: Platform analytics
- `GET /api/admin/audit-logs`: Audit logs

## Authentication
- JWT required for all protected routes.
- Use `Authorization: Bearer <token>` header.

## Error Handling
- Returns JSON with `message` and appropriate HTTP status code.

## Multilingual Support
- Error messages default to English.

## Rate Limiting
- 100 requests per 15 minutes per IP.

## Audit Logs
- All admin actions are logged in the database.

## Notifications
- Notifications are stored and can be fetched by students.

## How to Run
1. Install dependencies: `npm install`
2. Start server: `node server.js`
3. The server runs on port 5000 by default.

## Notes
- Easily upgradable to MongoDB or SQL by replacing lowdb.
- See controllers for detailed business logic.

---

For any questions, see the code comments or contact the maintainer.
