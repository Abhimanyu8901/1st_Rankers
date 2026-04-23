# 1st Rankers API

Base URL: `http://localhost:5000/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Admin

- `GET /admin/dashboard`
- `GET /admin/teachers`
- `POST /admin/teachers`
- `PUT /admin/teachers/:id`
- `DELETE /admin/teachers/:id`
- `GET /admin/students`
- `POST /admin/students`
- `PUT /admin/students/:id`
- `DELETE /admin/students/:id`
- `GET /admin/courses`
- `POST /admin/courses`
- `PUT /admin/courses/:id`
- `DELETE /admin/courses/:id`
- `POST /admin/enrollments`
- `GET /admin/reports`
- `GET /admin/payments`
- `POST /admin/payments`
- `GET /admin/notifications`
- `POST /admin/notifications`

## Teacher

- `GET /teacher/dashboard`
- `GET /teacher/courses`
- `POST /teacher/materials`
- `POST /teacher/attendance`
- `POST /teacher/quizzes`
- `GET /teacher/courses/:courseId/students`
- `POST /teacher/results`

## Student

- `GET /student/dashboard`
- `GET /student/courses`
- `GET /student/quizzes`
- `POST /student/quizzes/submit`
- `GET /student/results`
- `GET /student/attendance`
- `GET /student/payments`

## Authentication

Send JWT in the `Authorization` header:

`Authorization: Bearer <token>`

## Sample Register Payload

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "Student@123",
  "role": "student"
}
```

## Sample Teacher Quiz Payload

```json
{
  "course_id": 1,
  "title": "Physics Unit Test",
  "questions": [
    {
      "question": "What is Newton's second law?",
      "options": ["F=ma", "E=mc2", "V=IR", "pV=nRT"],
      "correctAnswer": "F=ma"
    }
  ]
}
```
