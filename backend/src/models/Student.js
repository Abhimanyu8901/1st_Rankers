const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const studentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    fatherName: String,
    motherName: String,
    dob: String,
    address: String,
    contactNumber: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null
    },
    attendance: {
      type: Number,
      default: 0
    },
    performance: {
      type: Number,
      default: 0
    }
  },
  schemaOptions
);

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);
