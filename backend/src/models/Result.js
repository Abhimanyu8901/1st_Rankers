const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const resultSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    score: {
      type: Number,
      default: 0
    }
  },
  schemaOptions
);

resultSchema.index({ student_id: 1, quiz_id: 1 }, { unique: true });

module.exports = mongoose.models.Result || mongoose.model("Result", resultSchema);
