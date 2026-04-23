# 1st Rankers

Full-stack coaching management platform for 1st Rankers with role-based access for Admin, Teacher, and Student.

## Stack

- Frontend: React + TypeScript + Tailwind CSS + Chart.js
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt

## Features

- Role-based register and login
- Admin analytics, teacher/student/course management, notifications, payments
- Teacher course management, material uploads, attendance, quiz creation
- Student course access, quiz attempts, results, attendance, payments
- Dark mode, search/filtering, reusable dashboard UI

## Project Structure

```text
backend/
  src/
    config/ controllers/ middleware/ models/ routes/ seeders/ utils/
frontend/
  src/
    api/ components/ context/ hooks/ pages/ types/ utils/
docs/
  api.md
```

## Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Create environment files:

- Copy [backend/.env.example](/C:/Users/Abhimanyu/Documents/New%20folder2/backend/.env.example) to `backend/.env`
- Copy [frontend/.env.example](/C:/Users/Abhimanyu/Documents/New%20folder2/frontend/.env.example) to `frontend/.env`

3. Start MongoDB locally and set `MONGODB_URI` in `backend/.env`.

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/coaching_management
```

4. Seed a default admin:

```bash
npm.cmd run seed:admin
```

5. Start both apps:

```bash
npm.cmd run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Notes

- The backend now connects to MongoDB through Mongoose.
- Make sure a MongoDB server is running before starting `npm.cmd run dev`.
- Razorpay is prepared as a payment reference integration point; live order creation is not wired yet.
- Socket.io and email notifications are left optional and can be added as the next enhancement.

## API Docs

See [docs/api.md](/C:/Users/Abhimanyu/Documents/New%20folder2/docs/api.md).
