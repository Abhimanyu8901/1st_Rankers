const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null
    }
  },
  schemaOptions
);

module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);
