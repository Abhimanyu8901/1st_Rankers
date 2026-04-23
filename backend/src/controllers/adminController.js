const asyncHandler = require("../utils/asyncHandler");
const {
  User,
  Teacher,
  Student,
  Course,
  Enrollment,
  Attendance,
  Result,
  Payment,
  TeacherPayment,
  Notification,
  Quiz,
  ActivityLog
} = require("../models");
const { logActivity } = require("../utils/activityLogger");
const {
  mapAttendance,
  mapCourse,
  mapEnrollment,
  mapPayment,
  mapResult,
  mapStudent,
  mapTeacher,
  mapTeacherPayment
} = require("../utils/mongoMappers");

const getDashboard = asyncHandler(async (req, res) => {
  const [students, teachers, courses, enrollments, payments] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Payment.find()
  ]);

  const totalRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  res.json({
    totals: { students, teachers, courses, enrollments, totalRevenue },
    paymentsByStatus: {
      pending: payments.filter((payment) => payment.status === "pending").length,
      paid: payments.filter((payment) => payment.status === "paid").length,
      failed: payments.filter((payment) => payment.status === "failed").length
    }
  });
});

const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().populate({ path: "user_id", model: User, select: "-password" });
  res.json(teachers.map(mapTeacher));
});

const getTeacherDetails = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate({ path: "user_id", model: User, select: "-password" })
    .populate({ path: "courseId", model: Course });

  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  const assignedCourses = await Course.find({ teacher_id: teacher.id }).sort({ createdAt: -1 });
  const salaryPayments = await TeacherPayment.find({ teacher_id: teacher.id }).sort({ createdAt: -1 });

  res.json({
    ...mapTeacher(teacher),
    salaryPayments: salaryPayments.map(mapTeacherPayment),
    assignedCourses: assignedCourses.map((course) => mapCourse(course))
  });
});

const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, specialization, fatherName, qualification, contactNumber, courseId } = req.body;
  const user = await User.create({ name, email, password, role: "teacher" });
  const teacher = await Teacher.create({
    user_id: user.id,
    fatherName: fatherName || "",
    specialization,
    qualification: qualification || "Not provided",
    contactNumber: contactNumber || "Not provided",
    courseId: courseId || null
  });

  await logActivity({
    action: "registered",
    entityType: "teacher",
    entityName: name,
    entityEmail: email,
    performedBy: req.user.name,
    performedByRole: req.user.role,
    description: `Admin created teacher account for ${name}`
  });

  const result = await Teacher.findById(teacher.id).populate({ path: "user_id", model: User, select: "-password" });
  res.status(201).json(mapTeacher(result));
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate({ path: "user_id", model: User });

  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  teacher.specialization = req.body.specialization ?? teacher.specialization;
  await teacher.save();

  teacher.user_id.name = req.body.name ?? teacher.user_id.name;
  teacher.user_id.email = req.body.email ?? teacher.user_id.email;
  if (req.body.password) {
    teacher.user_id.password = req.body.password;
  }
  await teacher.user_id.save();

  const updated = await Teacher.findById(req.params.id).populate({ path: "user_id", model: User, select: "-password" });
  res.json(mapTeacher(updated));
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate({ path: "user_id", model: User });
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  await logActivity({
    action: "deleted",
    entityType: "teacher",
    entityName: teacher.user_id.name,
    entityEmail: teacher.user_id.email,
    performedBy: req.user.name,
    performedByRole: req.user.role,
    description: `Admin deleted teacher account for ${teacher.user_id.name}`
  });

  await Course.updateMany({ teacher_id: teacher.id }, { teacher_id: null });
  await TeacherPayment.deleteMany({ teacher_id: teacher.id });
  await Teacher.deleteOne({ _id: teacher.id });
  await User.deleteOne({ _id: teacher.user_id.id });
  res.json({ message: "Teacher deleted successfully" });
});

const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().populate({ path: "user_id", model: User, select: "-password" });
  res.json(students.map(mapStudent));
});

const getStudentDetails = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate({ path: "user_id", model: User, select: "-password" })
    .populate({ path: "courseId", model: Course });

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const [payments, results, attendanceRecords, enrollments] = await Promise.all([
    Payment.find({ student_id: student.id }).sort({ createdAt: -1 }),
    Result.find({ student_id: student.id }).populate({
      path: "quiz_id",
      model: Quiz,
      populate: { path: "course_id", model: Course }
    }),
    Attendance.find({ student_id: student.id }).populate({ path: "course_id", model: Course }),
    Enrollment.find({ student_id: student.id }).populate({ path: "course_id", model: Course }).sort({ createdAt: -1 })
  ]);

  res.json({
    ...mapStudent(student),
    payments: payments.map(mapPayment),
    results: results.map(mapResult),
    attendanceRecords: attendanceRecords.map(mapAttendance),
    enrollments: enrollments.map(mapEnrollment)
  });
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: "student" });
  const student = await Student.create({ user_id: user.id });

  await logActivity({
    action: "registered",
    entityType: "student",
    entityName: name,
    entityEmail: email,
    performedBy: req.user.name,
    performedByRole: req.user.role,
    description: `Admin created student account for ${name}`
  });

  const result = await Student.findById(student.id).populate({ path: "user_id", model: User, select: "-password" });
  res.status(201).json(mapStudent(result));
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate({ path: "user_id", model: User });

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  student.attendance = req.body.attendance ?? student.attendance;
  student.performance = req.body.performance ?? student.performance;
  await student.save();

  student.user_id.name = req.body.name ?? student.user_id.name;
  student.user_id.email = req.body.email ?? student.user_id.email;
  if (req.body.password) {
    student.user_id.password = req.body.password;
  }
  await student.user_id.save();

  const updated = await Student.findById(req.params.id).populate({ path: "user_id", model: User, select: "-password" });
  res.json(mapStudent(updated));
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate({ path: "user_id", model: User });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  await logActivity({
    action: "deleted",
    entityType: "student",
    entityName: student.user_id.name,
    entityEmail: student.user_id.email,
    performedBy: req.user.name,
    performedByRole: req.user.role,
    description: `Admin deleted student account for ${student.user_id.name}`
  });

  await Enrollment.deleteMany({ student_id: student.id });
  await Attendance.deleteMany({ student_id: student.id });
  await Result.deleteMany({ student_id: student.id });
  await Payment.deleteMany({ student_id: student.id });
  await Student.deleteOne({ _id: student.id });
  await User.deleteOne({ _id: student.user_id.id });
  res.json({ message: "Student deleted successfully" });
});

const getHistory = asyncHandler(async (_req, res) => {
  const history = await ActivityLog.find().sort({ createdAt: -1 });
  res.json(history.map((item) => item.toJSON()));
});

const getCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find()
    .populate({
      path: "teacher_id",
      model: Teacher,
      populate: { path: "user_id", model: User, select: "name email" }
    })
    .sort({ createdAt: -1 });
  res.json(courses.map(mapCourse));
});

const createCourse = asyncHandler(async (req, res) => {
  const { name, description, teacher_id } = req.body;
  const course = await Course.create({ name, description, teacher_id: teacher_id || null });
  res.status(201).json(mapCourse(course));
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  course.name = req.body.name ?? course.name;
  course.description = req.body.description ?? course.description;
  course.teacher_id = req.body.teacher_id ?? course.teacher_id;
  await course.save();

  res.json(mapCourse(course));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  await Enrollment.deleteMany({ course_id: course.id });
  await Attendance.deleteMany({ course_id: course.id });
  await Quiz.deleteMany({ course_id: course.id });
  await Course.deleteOne({ _id: course.id });
  res.json({ message: "Course deleted successfully" });
});

const enrollStudent = asyncHandler(async (req, res) => {
  const { student_id, course_id, fee, discount, finalAmount } = req.body;
  const normalizedFee = Number(fee) || 0;
  const normalizedDiscount = Math.min(100, Math.max(0, Number(discount) || 0));
  const calculatedFinalAmount = Math.max(
    0,
    finalAmount !== undefined && finalAmount !== null
      ? Number(finalAmount)
      : normalizedFee - (normalizedFee * normalizedDiscount) / 100
  );

  let enrollment = await Enrollment.findOne({ student_id, course_id });
  if (!enrollment) {
    enrollment = await Enrollment.create({
      student_id,
      course_id,
      fee: normalizedFee,
      discount: normalizedDiscount,
      finalAmount: calculatedFinalAmount
    });
  } else {
    enrollment.fee = normalizedFee;
    enrollment.discount = normalizedDiscount;
    enrollment.finalAmount = calculatedFinalAmount;
    await enrollment.save();
  }

  await Student.findByIdAndUpdate(student_id, { courseId: course_id });
  res.status(201).json(mapEnrollment(enrollment));
});

const getReports = asyncHandler(async (_req, res) => {
  const [attendance, results] = await Promise.all([
    Attendance.find().sort({ date: -1, createdAt: -1 }).limit(20),
    Result.find().sort({ createdAt: -1 }).limit(20)
  ]);

  res.json({ attendance: attendance.map(mapAttendance), results: results.map(mapResult) });
});

const getPayments = asyncHandler(async (_req, res) => {
  const [studentPayments, teacherPayments] = await Promise.all([
    Payment.find()
      .populate({
        path: "student_id",
        model: Student,
        populate: { path: "user_id", model: User, select: "name email" }
      })
      .sort({ createdAt: -1 }),
    TeacherPayment.find()
      .populate({
        path: "teacher_id",
        model: Teacher,
        populate: { path: "user_id", model: User, select: "name email" }
      })
      .sort({ createdAt: -1 })
  ]);
  res.json({
    studentPayments: studentPayments.map(mapPayment),
    teacherPayments: teacherPayments.map(mapTeacherPayment)
  });
});

const createPayment = asyncHandler(async (req, res) => {
  const { student_id, amount, status, reference } = req.body;
  const payment = await Payment.create({ student_id, amount, status, reference });
  res.status(201).json(mapPayment(payment));
});

const createTeacherPayment = asyncHandler(async (req, res) => {
  const { teacher_id, amount, status, reference } = req.body;
  const payment = await TeacherPayment.create({ teacher_id, amount, status, reference });
  res.status(201).json(mapTeacherPayment(payment));
});

const getNotifications = asyncHandler(async (_req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications.map((item) => item.toJSON()));
});

const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json(notification.toJSON());
});

module.exports = {
  getDashboard,
  getTeachers,
  getTeacherDetails,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getStudents,
  getStudentDetails,
  createStudent,
  updateStudent,
  deleteStudent,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  getReports,
  getPayments,
  createPayment,
  createTeacherPayment,
  getHistory,
  getNotifications,
  createNotification
};
