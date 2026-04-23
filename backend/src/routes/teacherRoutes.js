const express = require("express");
const teacher = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect, authorize("teacher"));

router.get("/dashboard", teacher.getDashboard);
router.get("/courses", teacher.getAssignedCourses);
router.post("/materials", upload.single("file"), teacher.uploadMaterial);
router.delete("/materials/:materialId", teacher.deleteMaterial);
router.post("/attendance", teacher.takeAttendance);
router.get("/attendance/history", teacher.getAttendanceHistory);
router.post("/quizzes", teacher.createQuiz);
router.get("/result-sheets", teacher.getResultSheets);
router.post("/result-sheets", teacher.createResultSheet);
router.get("/courses/:courseId/students", teacher.getCourseStudents);
router.post("/results", teacher.evaluatePerformance);

module.exports = router;
