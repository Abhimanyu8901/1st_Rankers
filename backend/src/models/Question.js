const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const questionSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      default: []
    },
    correctAnswer: {
      type: String,
      required: true
    }
  },
  schemaOptions
);

module.exports = mongoose.models.Question || mongoose.model("Question", questionSchema);
