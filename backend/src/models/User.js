const { mongoose } = require("../config/db");
const bcrypt = require("bcryptjs");
const { schemaOptions } = require("./shared");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String
    },
    resetOtpHash: {
      type: String
    },
    resetOtpExpiresAt: {
      type: Date
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true
    }
  },
  schemaOptions
);

userSchema.pre("save", async function save() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
