const dotenv = require("dotenv");
const app = require("./app");
const { connectDatabase } = require("./config/db");

dotenv.config();

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
