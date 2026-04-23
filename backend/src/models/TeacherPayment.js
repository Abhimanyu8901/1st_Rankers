const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const teacherPaymentSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    reference: String
  },
  schemaOptions
);

module.exports = mongoose.models.TeacherPayment || mongoose.model("TeacherPayment", teacherPaymentSchema);
