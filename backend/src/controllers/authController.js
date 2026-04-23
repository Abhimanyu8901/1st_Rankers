const asyncHandler = require("../utils/asyncHandler");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const { User, Teacher, Student, Course, Enrollment } = require("../models");
const { logActivity } = require("../utils/activityLogger");
const { sendEmail } = require("../utils/emailTransport");

const buildAuthPayload = async (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture
  };

  if (user.role === "teacher") {
    payload.profile = await Teacher.findOne({ user_id: user._id || user.id });
  }

  if (user.role === "student") {
    payload.profile = await Student.findOne({ user_id: user._id || user.id });
  }

  return payload;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      message: "If this email exists, an OTP has been sent."
    });
  }

  const otp = generateOtp();
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "1st Rankers password reset OTP",
    text: `Your 1st Rankers password reset OTP is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>1st Rankers Password Reset</h2>
        <p>Your OTP for resetting the password is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `
  });

  res.json({
    message: "If this email exists, an OTP has been sent."
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (!email || !otp || !newPassword) {
    res.status(400);
    throw new Error("Email, OTP, and new password are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const user = await User.findOne({ email });

  if (
    !user ||
    !user.resetOtpHash ||
    !user.resetOtpExpiresAt ||
    user.resetOtpExpiresAt.getTime() < Date.now() ||
    user.resetOtpHash !== hashOtp(otp)
  ) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password = newPassword;
  user.resetOtpHash = undefined;
  user.resetOtpExpiresAt = undefined;
  await user.save();

  res.json({
    message: "Password updated successfully. Please log in with your new password."
  });
});

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    specialization,
    teacherFatherName,
    qualification,
    contactNumber,
    fatherName,
    motherName,
    dob,
    address,
    studentContactNumber,
    gender,
    courseId
  } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("User already exists");
  }

  if (!["teacher", "student"].includes(role)) {
    res.status(400);
    throw new Error("Only teacher and student registration is allowed");
  }

  let selectedCourse = null;
  if ((role === "student" || role === "teacher") && courseId) {
    selectedCourse = await Course.findById(courseId);
    if (!selectedCourse) {
      res.status(400);
      throw new Error("Selected course not found");
    }
  }

  const user = await User.create({ name, email, password, role });

  if (role === "teacher") {
    const teacher = await Teacher.create({
      user_id: user.id,
      fatherName: teacherFatherName,
      specialization: selectedCourse?.name || specialization || "General",
      qualification,
      contactNumber,
      courseId: courseId || null
    });

    await logActivity({
      action: "registered",
      entityType: "teacher",
      entityName: name,
      entityEmail: email,
      performedBy: name,
      performedByRole: "teacher",
      description: `Teacher registered with course ${selectedCourse?.name || "not selected"}`
    });
  }

  if (role === "student") {
    const student = await Student.create({
      user_id: user.id,
      fatherName,
      motherName,
      dob,
      address,
      contactNumber: studentContactNumber,
      gender,
      courseId: courseId || null
    });

    if (selectedCourse) {
      const existingEnrollment = await Enrollment.findOne({
        student_id: student.id,
        course_id: courseId
      });
      if (!existingEnrollment) {
        await Enrollment.create({
          student_id: student.id,
          course_id: courseId
        });
      }
    }

    await logActivity({
      action: "registered",
      entityType: "student",
      entityName: name,
      entityEmail: email,
      performedBy: name,
      performedByRole: "student",
      description: `Student registered with course ${selectedCourse?.name || "not selected"}`
    });
  }

  const payload = await buildAuthPayload(user);

  res.status(201).json({
    token: generateToken(user),
    user: payload
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const payload = await buildAuthPayload(user);

  res.json({
    token: generateToken(user),
    user: payload
  });
});

const me = asyncHandler(async (req, res) => {
  const payload = await buildAuthPayload(req.user);
  res.json(payload);
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    teacherFatherName,
    qualification,
    contactNumber,
    courseId,
    fatherName,
    motherName,
    dob,
    address,
    studentContactNumber,
    gender
  } = req.body;

  if (email && email !== req.user.email) {
    const existing = await User.findOne({ email });
    if (existing && String(existing.id) !== String(req.user.id)) {
      res.status(400);
      throw new Error("Email already registered");
    }
  }

  req.user.name = name ?? req.user.name;
  req.user.email = email ?? req.user.email;
  if (password) {
    req.user.password = password;
  }
  await req.user.save();

  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ user_id: req.user.id });
    if (teacher) {
      teacher.fatherName = teacherFatherName ?? teacher.fatherName;
      teacher.qualification = qualification ?? teacher.qualification;
      teacher.contactNumber = contactNumber ?? teacher.contactNumber;
      teacher.courseId = courseId ?? teacher.courseId;
      await teacher.save();
    }
  }

  if (req.user.role === "student") {
    const student = await Student.findOne({ user_id: req.user.id });
    if (student) {
      student.fatherName = fatherName ?? student.fatherName;
      student.motherName = motherName ?? student.motherName;
      student.dob = dob ?? student.dob;
      student.address = address ?? student.address;
      student.contactNumber = studentContactNumber ?? student.contactNumber;
      student.gender = gender ?? student.gender;
      student.courseId = courseId ?? student.courseId;
      await student.save();
    }
  }

  const refreshedUser = await User.findById(req.user.id);
  const payload = await buildAuthPayload(refreshedUser);
  res.json(payload);
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Profile picture is required");
  }

  req.user.profilePicture = `/uploads/profiles/${req.file.filename}`;
  await req.user.save();

  const payload = await buildAuthPayload(req.user);
  res.json(payload);
});

const getPublicCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ name: 1 });

  res.json(courses);
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  me,
  updateProfile,
  getPublicCourses,
  uploadProfilePicture
};
