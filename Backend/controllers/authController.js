const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// ========================================
// Register User
// POST /api/auth/register
// ========================================
const registerUser = async (req, res) => {
  try {
    let { name, email, password, studentId, phone, course } = req.body;

    // Validation (Removed 'course' from the strictly required fields)
    if (!name || !email || !password || !studentId || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    email = email.toLowerCase().trim();

    // Check Email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    // Check Student ID
    const studentExists = await User.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ success: false, message: "Student ID already exists." });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = (email.toLowerCase() === "jeehardik2@gmail.com") ? "admin" : "student";

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      studentId,
      phone,
      course: course || "Not Specified", 
      role,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        course: user.course,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================================
// Login User
// POST /api/auth/login
// ========================================
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    email = email.toLowerCase().trim();

    // Find User
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // Check Account Status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by the Admin.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    // Ensure jeehardik2@gmail.com is always Admin
    if (email === "jeehardik2@gmail.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        course: user.course,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};