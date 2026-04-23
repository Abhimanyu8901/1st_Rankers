const express = require("express");
const {
  forgotPassword,
  getPublicCourses,
  login,
  me,
  register,
  resetPassword,
  updateProfile,
  uploadProfilePicture
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const profileUpload = require("../middleware/profileUploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/courses", getPublicCourses);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
router.post("/profile-picture", protect, profileUpload.single("image"), uploadProfilePicture);

module.exports = router;
