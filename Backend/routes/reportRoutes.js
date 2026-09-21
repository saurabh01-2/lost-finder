const express = require("express");
const router = express.Router();

const {
  submitFoundMatch,
  confirmClaimByOwner,
  rejectClaimByOwner,
  getItemClaims,
  submitClaim,
  getMyClaims,
  cancelClaim,
  getAllClaims,
  updateClaimStatus,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

// ============================================
// Founder & Owner Flow Routes
// ============================================

// Founder reports finding a lost item
// POST /api/reports/found-match/:itemId
router.post(
  "/found-match/:itemId",
  protect,
  upload.single("proofImage"),
  submitFoundMatch
);

// Owner confirms & claims their item
// PUT /api/reports/confirm/:claimId
router.put("/confirm/:claimId", protect, confirmClaimByOwner);

// Owner rejects false report
// PUT /api/reports/reject/:claimId
router.put("/reject/:claimId", protect, rejectClaimByOwner);

// Get claims/founder reports for an item
// GET /api/reports/item/:itemId
router.get("/item/:itemId", protect, getItemClaims);

// ============================================
// Standard Claim Routes
// ============================================

// Submit Claim (Claimant claiming a found item)
// POST /api/reports/claim/:itemId
router.post(
  "/claim/:itemId",
  protect,
  upload.single("proofImage"),
  submitClaim
);

// Get Logged-in User Claims
// GET /api/reports/my-claims
router.get("/my-claims", protect, getMyClaims);

// Cancel Claim
// DELETE /api/reports/:id
router.delete("/:id", protect, cancelClaim);

// ============================================
// Admin Routes
// ============================================

// Get All Claims
// GET /api/reports
router.get("/", protect, adminOnly, getAllClaims);

// Approve / Reject Claim
// PUT /api/reports/:id
router.put("/:id", protect, adminOnly, updateClaimStatus);

module.exports = router;