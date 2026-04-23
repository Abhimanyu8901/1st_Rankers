const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const teacherSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    fatherName: String,
    specialization: {
      type: String,
      required: true
    },
    qualification: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null
    }
  },
  schemaOptions
);

module.exports = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
