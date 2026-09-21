const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  try {
    // Check if Authorization header exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get Token
      token = req.headers.authorization.split(" ")[1];

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find User (Exclude Password)
      req.user = await User.findById(decoded.id).select("-password");

      // User Not Found
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Automatically ensure jeehardik2@gmail.com is Admin
      if (req.user.email && req.user.email.toLowerCase().trim() === "jeehardik2@gmail.com") {
        if (req.user.role !== "admin") {
          req.user.role = "admin";
          await User.findByIdAndUpdate(req.user._id, { role: "admin" });
        }
      }

      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { protect };