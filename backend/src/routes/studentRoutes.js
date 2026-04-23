const express = require("express");
const student = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("student"));

router.get("/dashboard", student.getDashboard);
router.get("/courses", student.getCourses);
router.get("/quizzes", student.getQuizzes);
router.post("/quizzes/submit", student.submitQuiz);
router.get("/results", student.getResults);
router.get("/attendance", student.getAttendance);
router.get("/payments", student.getPayments);

module.exports = router;
