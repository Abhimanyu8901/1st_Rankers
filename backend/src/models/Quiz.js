const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const quizSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  schemaOptions
);

module.exports = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
