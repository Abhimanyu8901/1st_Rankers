const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    audience: {
      type: String,
      enum: ["all", "teacher", "student"],
      default: "all"
    }
  },
  schemaOptions
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
