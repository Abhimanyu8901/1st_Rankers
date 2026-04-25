const cors = require("cors");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { mongoose } = require("./models");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim();
      const isVercelPreview = normalizedOrigin.endsWith(".vercel.app");
      const isAllowed = allowedOrigins.includes(normalizedOrigin) || isVercelPreview;

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", async (req, res) => {
  let database = "disconnected";
  try {
    database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch (error) {
    database = "error";
  }

  res.json({ status: "ok", database });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

app.use(errorHandler);

module.exports = app;
