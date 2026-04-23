const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const attendanceSchema = new mongoose.Schema(
  {
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
    date: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true
    }
  },
  schemaOptions
);

attendanceSchema.index({ student_id: 1, course_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
