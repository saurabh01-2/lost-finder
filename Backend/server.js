const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const User = require("./models/User");
    const adminUser = await User.findOneAndUpdate(
      { email: "jeehardik2@gmail.com" },
      { role: "admin" },
      { new: true }
    );
    if (adminUser) {
      console.log("👑 User jeehardik2@gmail.com has been verified as ADMIN.");
    }
  } catch (e) {
    // Ignore if DB not reachable on initial boot
  }
});

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log("===================================");
  console.log("🚀 Lost & Found Backend Started");
  console.log(`🌐 Server Running: http://localhost:${PORT}`);
  console.log("===================================");
});