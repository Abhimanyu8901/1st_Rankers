const asyncHandler = require("../utils/asyncHandler");
const {
  Student,
  User,
  Course,
  Material,
  Attendance,
  Enrollment,
  Quiz,
  Question,
  Result,
  TeacherResultSheet,
  Payment,
  Notification
} = require("../models");
const { mapAttendance, mapCourse, mapPayment, mapResult, mapTeacherResultSheet, mapStudent } = require("../utils/mongoMappers");

const getStudentProfile = async (userId) => {
  const student = await Student.findOne({ user_id: userId }).populate({
    path: "user_id",
    model: User,
    select: "name email role profilePicture"
  });

  return student;
};

const getStudentCourses = async (studentId) => {
  const enrollments = await Enrollment.find({ student_id: studentId }).populate({
    path: "course_id",
    model: Course
  });

  const courses = [];
  for (const enrollment of enrollments) {
    if (!enrollment.course_id) continue;
    const materials = await Material.find({ course_id: enrollment.course_id._id }).sort({ createdAt: -1 });
    const courseData = mapCourse(enrollment.course_id);
    courseData.materials = materials.map((material) => material.toJSON());
    courses.push(courseData);
  }

  return courses;
};

const getDashboard = asyncHandler(async (req, res) => {
  const student = await getStudentProfile(req.user.id);
  const courses = student ? await getStudentCourses(student.id) : [];
  const attendanceHistory = await Attendance.find({ student_id: student.id }).sort({ date: -1, createdAt: -1 });
  const results = await Result.find({ student_id: student.id });

  res.json({
    student: {
      ...mapStudent(student),
      courses,
      payments: (await Payment.find({ student_id: student.id }).sort({ createdAt: -1 })).map(mapPayment)
    },
    analytics: {
      attendance: student.attendance,
      performance: student.performance,
      averageScore: results.length
        ? results.reduce((sum, item) => sum + Number(item.score), 0) / results.length
        : 0
    },
    attendanceHistory: attendanceHistory.map(mapAttendance),
    notifications: (await Notification.find().sort({ createdAt: -1 }).limit(5)).map((item) => item.toJSON())
  });
});

const getCourses = asyncHandler(async (req, res) => {
  const student = await getStudentProfile(req.user.id);
  const courses = await getStudentCourses(student.id);
  res.json(courses);
});

const getQuizzes = asyncHandler(async (req, res) => {
  const student = await getStudentProfile(req.user.id);
  const enrollments = await Enrollment.find({ student_id: student.id });
  const courseIds = enrollments.map((item) => item.course_id);

  if (!courseIds.length) {
    return res.json([]);
  }

  const quizzes = await Quiz.find({ course_id: { $in: courseIds } }).sort({ createdAt: -1 });
  const quizIds = quizzes.map((quiz) => quiz._id);
  const questions = await Question.find({ quiz_id: { $in: quizIds } });
  const questionMap = new Map();

  questions.forEach((question) => {
    const key = String(question.quiz_id);
    const current = questionMap.get(key) || [];
    current.push(question.toJSON());
    questionMap.set(key, current);
  });

  res.json(
    quizzes.map((quiz) => ({
      ...quiz.toJSON(),
      questions: questionMap.get(String(quiz._id)) || []
    }))
  );
});

const submitQuiz = asyncHandler(async (req, res) => {
  const student = await getStudentProfile(req.user.id);
  const { quiz_id, answers } = req.body;
  const quiz = await Quiz.findById(quiz_id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const questions = await Question.find({ quiz_id: quiz._id });
  let correct = 0;

  questions.forEach((question, index) => {
    const answerKey = question.id || index;
    if (answers?.[answerKey] === question.correctAnswer || answers?.[question._id] === question.correctAnswer) {
      correct += 1;
    }
  });

  const score = questions.length ? (correct / questions.length) * 100 : 0;
  let result = await Result.findOne({ student_id: student.id, quiz_id });

  if (!result) {
    result = await Result.create({ student_id: student.id, quiz_id, score });
  } else if (Number(result.score) !== Number(score)) {
    result.score = score;
    await result.save();
  }

  const results = await Result.find({ student_id: student.id });
  const average = results.length
    ? results.reduce((sum, item) => sum + Number(item.score), 0) / results.length
    : 0;

  student.performance = average;
  await student.save();

  res.json({ score, totalQuestions: questions.length });
});

const getResults = asyncHandler(async (req, res) => {
  const student = await getStudentProfile(req.user.id);
  const quizResults = await Result.find({ student_id: student.id })
    .populate({ path: "quiz_id", model: Quiz });
  const resultSheets = await TeacherResultSheet.find({ student_id: student.id })
    .populate({ path: "course_id", model: Course })
    .sort({ createdAt: -1 });

  res.json({
    quizResults: quizResults.map(mapResult),
    resultSheets: resultSheets.map(mapTeacherResultSheet)
  });
});

const getAttendance = asyncHandler(async (req, res) => {
  const student = await getStudentProfile(req.user.id);
  const attendance = await Attendance.find({ student_id: student.id })
    .populate({ path: "course_id", model: Course })
    .sort({ date: -1, createdAt: -1 });

  res.json(attendance.map(mapAttendance));
});

const getPayments = asyncHandler(async (req, res) => {
  const student = await getStudentProfile(req.user.id);
  const payments = await Payment.find({ student_id: student.id }).sort({ createdAt: -1 });
  res.json(payments.map(mapPayment));
});

module.exports = {
  getDashboard,
  getCourses,
  getQuizzes,
  submitQuiz,
  getResults,
  getAttendance,
  getPayments
};
