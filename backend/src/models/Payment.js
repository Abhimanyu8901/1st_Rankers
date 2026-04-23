const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const paymentSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
