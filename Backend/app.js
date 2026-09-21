const express = require("express");
const cors = require("cors");

const app = express();

// ==========================
// Global Middlewares
// ==========================

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Parse Form Data
app.use(express.urlencoded({ extended: true }));

// Static Folder for Uploaded Images
app.use("/uploads", express.static("uploads"));

// ==========================
// Import Routes
// ==========================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// ==========================
// Error Middleware
// ==========================
const errorMiddleware = require("./middleware/errorMiddleware");

// ==========================
// API Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ==========================
// Global Error Middleware
// ==========================
app.use(errorMiddleware);

// ==========================
// Export App
// ==========================
// THIS LINE IS CRITICAL - It hands the app back to server.js
module.exports = app;