const dotenv = require("dotenv");
const { connectDatabase, mongoose } = require("../config/db");
const { User } = require("../models");

dotenv.config();

const run = async () => {
  try {
    await connectDatabase();

    const existing = await User.findOne({ email: "admin@coachpro.com" });
    if (!existing) {
      await User.create({
        name: "System Admin",
        email: "admin@coachpro.com",
        password: "Admin@123",
        role: "admin"
      });
      console.log("Seeded default admin: admin@coachpro.com / Admin@123");
    } else {
      console.log("Default admin already exists");
    }
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

run();
