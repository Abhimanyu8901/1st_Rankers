const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const materialSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["file", "video"],
      required: true
    },
    filePath: String,
    videoUrl: String
  },
  schemaOptions
);

module.exports = mongoose.models.Material || mongoose.model("Material", materialSchema);
