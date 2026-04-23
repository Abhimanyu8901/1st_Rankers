const fs = require("fs");
const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const {
  Teacher,
  User,
  Course,
  Enrollment,
  Student,
  Material,
  Attendance,
  Quiz,
  Question,
  Result,
  TeacherResultSheet
} = require("../models");
const {
  mapAttendance,
  mapCourse,
  mapResult,
  mapStudent,
  mapTeacherResultSheet
} = require("../utils/mongoMappers");

const getTeacherProfile = async (userId) =>
  Teacher.findOne({ user_id: userId }).populate({
    path: "user_id",
    model: User,
    select: "name email role profilePicture"
  });

const getTeacherCourses = async (teacherId) => {
  const courses = await Course.find({ teacher_id: teacherId }).sort({ createdAt: -1 });
  const courseIds = courses.map((course) => course._id);
  const enrollments = courseIds.length
    ? await Enrollment.find({ course_id: { $in: courseIds } }).populate({
        path: "student_id",
        model: Student,
        populate: { path: "user_id", model: User, select: "name email role profilePicture" }
      })
    : [];
  const materials = courseIds.length ? await Material.find({ course_id: { $in: courseIds } }).sort({ createdAt: -1 }) : [];

  return courses.map((course) => {
    const courseData = mapCourse(course);
    courseData.students = enrollments
      .filter((enrollment) => String(enrollment.course_id) === String(course._id))
      .map((enrollment) => mapStudent(enrollment.student_id));
    courseData.materials = materials
      .filter((material) => String(material.course_id) === String(course._id))
      .map((material) => material.toJSON());
    return courseData;
  });
};

const getDashboard = asyncHandler(async (req, res) => {
  const teacher = await getTeacherProfile(req.user.id);
  const courses = await Course.find({ teacher_id: teacher.id });
  const courseIds = courses.map((course) => course._id);
  const students = courseIds.length ? await Enrollment.countDocuments({ course_id: { $in: courseIds } }) : 0;
  const quizzes = courseIds.length ? await Quiz.countDocuments({ course_id: { $in: courseIds } }) : 0;

  res.json({
    teacher,
    totals: {
      courses: courses.length,
      students,
      quizzes
    }
  });
});

const getAssignedCourses = asyncHandler(async (req, res) => {
  const teacher = await getTeacherProfile(req.user.id);
  const courses = await getTeacherCourses(teacher.id);
  res.json(courses);
});

const uploadMaterial = asyncHandler(async (req, res) => {
  const teacher = await getTeacherProfile(req.user.id);
  const { course_id, title, type, videoUrl } = req.body;
  const material = await Material.create({
    course_id,
    teacher_id: teacher.id,
    title,
    type,
    filePath: req.file ? `/uploads/${req.file.filename}` : null,
    videoUrl: type === "video" ? videoUrl : null
  });
  res.status(201).json(material);
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const teacher = await getTeacherProfile(req.user.id);
  const material = await Material.findOne({
    _id: req.params.materialId,
    teacher_id: teacher.id
  });

  if (!material) {
    res.status(404);
    throw new Error("Material not found");
  }

  if (material.filePath) {
    const absolutePath = path.join(__dirname, "..", material.filePath.replace(/^\//, ""));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  await Material.deleteOne({ _id: material.id });
  res.json({ message: "Material deleted successfully" });
});

const takeAttendance = asyncHandler(async (req, res) => {
  const { student_id, course_id, date, status } = req.body;
  let record = await Attendance.findOne({ student_id, course_id, date });

  if (!record) {
    record = await Attendance.create({ student_id, course_id, date, status });
  } else {
    record.status = status;
    await record.save();
  }

  const studentAttendance = await Attendance.find({ student_id });
  const presentCount = studentAttendance.filter((item) => item.status === "present").length;
  const attendancePercent = studentAttendance.length ? (presentCount / studentAttendance.length) * 100 : 0;

  await Student.findByIdAndUpdate(student_id, { attendance: attendancePercent });
  res.json(record);
});

const getAttendanceHistory = asyncHandler(async (req, res) => {
  const teacher = await getTeacherProfile(req.user.id);
  const teacherCourses = await Course.find({ teacher_id: teacher.id }).select("_id");
  const courseIds = teacherCourses.map((course) => course._id);

  if (!courseIds.length) {
    return res.json([]);
  }

  const history = await Attendance.find({ course_id: { $in: courseIds } })
    .populate({
      path: "student_id",
      model: Student,
      populate: { path: "user_id", model: User, select: "name email role profilePicture" }
    })
    .populate({ path: "course_id", model: Course })
    .sort({ date: -1, createdAt: -1 });

  res.json(history.map(mapAttendance));
});

const createQuiz = asyncHandler(async (req, res) => {
  const { course_id, title, questions } = req.body;
  const quiz = await Quiz.create({ course_id, title });

  if (Array.isArray(questions) && questions.length) {
    await Promise.all(
      questions.map((question) =>
        Question.create({
          quiz_id: quiz.id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer
        })
      )
    );
  }

  const createdQuiz = quiz.toJSON();
  createdQuiz.questions = (await Question.find({ quiz_id: quiz.id })).map((question) => question.toJSON());
  res.status(201).json(createdQuiz);
});

const getResultSheets = asyncHandler(async (req, res) => {
  const teacher = await getTeacherProfile(req.user.id);
  const resultSheets = await TeacherResultSheet.find({ teacher_id: teacher.id })
    .populate({
      path: "student_id",
      model: Student,
      populate: { path: "user_id", model: User, select: "name email role profilePicture" }
    })
    .populate({ path: "course_id", model: Course })
    .sort({ createdAt: -1 });

  res.json(resultSheets.map(mapTeacherResultSheet));
});

const createResultSheet = asyncHandler(async (req, res) => {
  const teacher = await getTeacherProfile(req.user.id);
  const { course_id, student_id, title, rows } = req.body;

  const normalizedRows = Array.isArray(rows)
    ? rows.slice(0, 7).map((row) => ({
        subject: row.subject || "",
        totalMarks: Number(row.totalMarks) || 0,
        obtainedMarks: Number(row.obtainedMarks) || 0
      }))
    : [];

  const totalMarks = normalizedRows.reduce((sum, row) => sum + row.totalMarks, 0);
  const obtainedMarks = normalizedRows.reduce((sum, row) => sum + row.obtainedMarks, 0);

  const resultSheet = await TeacherResultSheet.create({
    teacher_id: teacher.id,
    student_id,
    course_id,
    title,
    entries: normalizedRows,
    totalMarks,
    obtainedMarks
  });

  const created = await TeacherResultSheet.findById(resultSheet.id)
    .populate({
      path: "student_id",
      model: Student,
      populate: { path: "user_id", model: User, select: "name email role profilePicture" }
    })
    .populate({ path: "course_id", model: Course });

  res.status(201).json(mapTeacherResultSheet(created));
});

const getCourseStudents = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ course_id: req.params.courseId }).populate({
    path: "student_id",
    model: Student,
    populate: { path: "user_id", model: User, select: "name email role profilePicture" }
  });
  res.json(enrollments.map((enrollment) => mapStudent(enrollment.student_id)));
});

const evaluatePerformance = asyncHandler(async (req, res) => {
  const { student_id, quiz_id, score } = req.body;
  let result = await Result.findOne({ student_id, quiz_id });

  if (!result) {
    result = await Result.create({ student_id, quiz_id, score });
  } else if (Number(result.score) !== Number(score)) {
    result.score = score;
    await result.save();
  }

  const studentResults = await Result.find({ student_id });
  const average = studentResults.length
    ? studentResults.reduce((sum, item) => sum + Number(item.score), 0) / studentResults.length
    : 0;

  await Student.findByIdAndUpdate(student_id, { performance: average });
  res.json(mapResult(result));
});

module.exports = {
  getDashboard,
  getAssignedCourses,
  uploadMaterial,
  deleteMaterial,
  takeAttendance,
  getAttendanceHistory,
  createQuiz,
  getResultSheets,
  createResultSheet,
  getCourseStudents,
  evaluatePerformance
};
