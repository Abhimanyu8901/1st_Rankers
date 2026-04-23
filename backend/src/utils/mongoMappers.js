const mapUser = (user) => (user ? user.toJSON?.() || user : null);

const mapTeacher = (teacher) => {
  if (!teacher) return null;
  const data = teacher.toJSON?.() || teacher;
  if (data.user_id && typeof data.user_id === "object") {
    data.user = mapUser(data.user_id);
  }
  if (data.courseId && typeof data.courseId === "object") {
    data.selectedCourse = data.courseId;
  }
  delete data.user_id;
  return data;
};

const mapStudent = (student) => {
  if (!student) return null;
  const data = student.toJSON?.() || student;
  if (data.user_id && typeof data.user_id === "object") {
    data.user = mapUser(data.user_id);
  }
  if (data.courseId && typeof data.courseId === "object") {
    data.primaryCourse = data.courseId;
  }
  delete data.user_id;
  return data;
};

const mapCourse = (course) => {
  if (!course) return null;
  const data = course.toJSON?.() || course;
  if (data.teacher_id && typeof data.teacher_id === "object") {
    data.teacher = mapTeacher(data.teacher_id);
  }
  return data;
};

const mapEnrollment = (enrollment) => {
  if (!enrollment) return null;
  const data = enrollment.toJSON?.() || enrollment;
  if (data.student_id && typeof data.student_id === "object") {
    data.student = mapStudent(data.student_id);
  }
  if (data.course_id && typeof data.course_id === "object") {
    data.course = mapCourse(data.course_id);
  }
  return data;
};

const mapAttendance = (attendance) => {
  if (!attendance) return null;
  const data = attendance.toJSON?.() || attendance;
  if (data.student_id && typeof data.student_id === "object") {
    data.student = mapStudent(data.student_id);
  }
  if (data.course_id && typeof data.course_id === "object") {
    data.course = mapCourse(data.course_id);
  }
  return data;
};

const mapResult = (result) => {
  if (!result) return null;
  const data = result.toJSON?.() || result;
  if (data.quiz_id && typeof data.quiz_id === "object") {
    data.quiz = data.quiz_id;
  }
  if (data.student_id && typeof data.student_id === "object") {
    data.student = mapStudent(data.student_id);
  }
  return data;
};

const mapPayment = (payment) => {
  if (!payment) return null;
  const data = payment.toJSON?.() || payment;
  if (data.student_id && typeof data.student_id === "object") {
    data.student = mapStudent(data.student_id);
  }
  return data;
};

const mapTeacherPayment = (payment) => {
  if (!payment) return null;
  const data = payment.toJSON?.() || payment;
  if (data.teacher_id && typeof data.teacher_id === "object") {
    data.teacher = mapTeacher(data.teacher_id);
  }
  return data;
};

const mapTeacherResultSheet = (sheet) => {
  if (!sheet) return null;
  const data = sheet.toJSON?.() || sheet;
  if (data.student_id && typeof data.student_id === "object") {
    data.student = mapStudent(data.student_id);
  }
  if (data.course_id && typeof data.course_id === "object") {
    data.course = mapCourse(data.course_id);
  }
  if (data.teacher_id && typeof data.teacher_id === "object") {
    data.teacher = mapTeacher(data.teacher_id);
  }
  return data;
};

module.exports = {
  mapUser,
  mapTeacher,
  mapStudent,
  mapCourse,
  mapEnrollment,
  mapAttendance,
  mapResult,
  mapPayment,
  mapTeacherPayment,
  mapTeacherResultSheet
};
