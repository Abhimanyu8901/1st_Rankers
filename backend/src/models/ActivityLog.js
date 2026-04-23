const { mongoose } = require("../config/db");
const { schemaOptions } = require("./shared");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ["student", "teacher"],
      required: true
    },
    entityName: {
      type: String,
      required: true
    },
    entityEmail: {
      type: String,
      required: true
    },
    performedBy: {
      type: String,
      required: true
    },
    performedByRole: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  schemaOptions
);

module.exports = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);
