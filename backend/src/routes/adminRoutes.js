const express = require("express");
const admin = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", admin.getDashboard);
router.route("/teachers").get(admin.getTeachers).post(admin.createTeacher);
router.route("/teachers/:id").get(admin.getTeacherDetails).put(admin.updateTeacher).delete(admin.deleteTeacher);
router.route("/students").get(admin.getStudents).post(admin.createStudent);
router.route("/students/:id").get(admin.getStudentDetails).put(admin.updateStudent).delete(admin.deleteStudent);
router.route("/courses").get(admin.getCourses).post(admin.createCourse);
router.route("/courses/:id").put(admin.updateCourse).delete(admin.deleteCourse);
router.post("/enrollments", admin.enrollStudent);
router.get("/reports", admin.getReports);
router.route("/payments").get(admin.getPayments).post(admin.createPayment);
router.post("/teacher-payments", admin.createTeacherPayment);
router.route("/notifications").get(admin.getNotifications).post(admin.createNotification);
router.get("/history", admin.getHistory);

module.exports = router;
