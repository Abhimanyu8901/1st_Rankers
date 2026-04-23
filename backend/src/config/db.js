const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/coaching_management";
  await mongoose.connect(uri);
  return mongoose.connection;
};

module.exports = { mongoose, connectDatabase };
