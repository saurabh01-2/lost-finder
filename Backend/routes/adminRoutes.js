const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllItems,
  updateItemStatus,
  deleteItem,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// ========================================
// Dashboard
// GET /api/admin/dashboard
// ========================================
router.get("/dashboard", protect, adminOnly, getDashboardStats);

// ========================================
// User Management
// ========================================

// Get All Users
// GET /api/admin/users
router.get("/users", protect, adminOnly, getAllUsers);

// Block / Unblock User
// PUT /api/admin/users/:id
router.put("/users/:id", protect, adminOnly, toggleUserStatus);

// Delete User
// DELETE /api/admin/users/:id
router.delete("/users/:id", protect, adminOnly, deleteUser);

// ========================================
// Item Management
// ========================================

// Get All Items
// GET /api/admin/items
router.get("/items", protect, adminOnly, getAllItems);

// Update Item Status
// PUT /api/admin/items/:id/status
router.put("/items/:id/status", protect, adminOnly, updateItemStatus);

// Delete Any Item
// DELETE /api/admin/items/:id
router.delete("/items/:id", protect, adminOnly, deleteItem);

module.exports = router;