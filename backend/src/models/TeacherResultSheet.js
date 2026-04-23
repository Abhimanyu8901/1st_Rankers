const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const teacherResultSheetSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    entries: {
      type: [
        {
          _id: false,
          subject: String,
          totalMarks: {
            type: Number,
            default: 0
          },
          obtainedMarks: {
            type: Number,
            default: 0
          }
        }
      ],
      default: []
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    obtainedMarks: {
      type: Number,
      default: 0
    }
  },
  schemaOptions
);

module.exports = mongoose.models.TeacherResultSheet || mongoose.model("TeacherResultSheet", teacherResultSheetSchema);
