const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = "mongodb://127.0.0.1:27017/Lost-Found-Portal";

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("===================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`🌍 Host     : ${conn.connection.host}`);
    console.log(`📂 Database : ${conn.connection.name}`);
    console.log("===================================");
    return;
  } catch (primaryError) {
    console.warn("⚠️ Primary MongoDB connection failed:", primaryError.message);

    try {
      console.log("🔄 Attempting fallback to local MongoDB (127.0.0.1:27017)...");
      const fallbackConn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });

      console.log("===================================");
      console.log("✅ Local MongoDB Connected Successfully");
      console.log(`🌍 Host     : ${fallbackConn.connection.host}`);
      console.log(`📂 Database : ${fallbackConn.connection.name}`);
      console.log("===================================");
      return;
    } catch (fallbackError) {
      console.error("===================================");
      console.error("❌ Both Primary and Fallback MongoDB Connections Failed");
      console.error("Primary Error :", primaryError.message);
      console.error("Fallback Error:", fallbackError.message);
      console.error("👉 Please update MONGO_URI in Backend/.env with valid credentials or start MongoDB locally.");
      console.error("===================================");
    }
  }
};

module.exports = connectDB;