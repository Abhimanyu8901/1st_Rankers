const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET || "development_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

module.exports = generateToken;
