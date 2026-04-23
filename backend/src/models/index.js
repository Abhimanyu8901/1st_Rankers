const { mongoose } = require("../config/db");
const User = require("./User");
const Teacher = require("./Teacher");
const Student = require("./Student");
const Course = require("./Course");
const Enrollment = require("./Enrollment");
const Attendance = require("./Attendance");
const Quiz = require("./Quiz");
const Question = require("./Question");
const Result = require("./Result");
const Payment = require("./Payment");
const TeacherPayment = require("./TeacherPayment");
const TeacherResultSheet = require("./TeacherResultSheet");
const ActivityLog = require("./ActivityLog");
const Material = require("./Material");
const Notification = require("./Notification");

module.exports = {
  mongoose,
  User,
  Teacher,
  Student,
  Course,
  Enrollment,
  Attendance,
  Quiz,
  Question,
  Result,
  Payment,
  TeacherPayment,
  TeacherResultSheet,
  ActivityLog,
  Material,
  Notification
};
