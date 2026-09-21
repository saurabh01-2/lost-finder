// ============================================
// Admin Middleware
// Allows access only to Admin users
// ============================================

const adminOnly = (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Check if user is jeehardik2@gmail.com
    if (req.user.email && req.user.email.toLowerCase().trim() === "jeehardik2@gmail.com") {
      req.user.role = "admin";
    }

    // Check role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Admin only.",
      });
    }

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  adminOnly,
};