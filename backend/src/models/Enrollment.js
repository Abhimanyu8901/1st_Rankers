const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const enrollmentSchema = new mongoose.Schema(
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
    fee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    }
  },
  schemaOptions
);

enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
