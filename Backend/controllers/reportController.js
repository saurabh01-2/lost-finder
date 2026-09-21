const Claim = require("../models/Claim");
const Item = require("../models/Item");
const Notification = require("../models/Notification");

// ==========================================
// Founder Reports Finding A Lost Item
// POST /api/reports/found-match/:itemId
// Private
// ==========================================
const submitFoundMatch = async (req, res) => {
  try {
    const { founderContact, founderLocation, dateFound, message } = req.body;

    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
    }

    if (item.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report finding your own lost item.",
      });
    }

    // Check if user already submitted a pending found report for this item
    const existingClaim = await Claim.findOne({
      user: req.user._id,
      item: item._id,
      status: "Pending",
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a found report for this item. Please wait for the owner to review.",
      });
    }

    // Create the Claim record with founder details
    const claim = await Claim.create({
      user: req.user._id,
      item: item._id,
      owner: item.user,
      claimType: "FOUND_REPORT",
      founderName: req.user.name,
      founderContact: founderContact || req.user.phone || "",
      founderLocation: founderLocation || "",
      dateFound: dateFound || Date.now(),
      message: message || "I have found this item.",
      proofImage: req.file ? req.file.filename : "",
      status: "Pending",
    });

    // Update item status to Pending and record founder
    item.status = "Pending";
    item.founder = req.user._id;
    await item.save();

    // Create Notification for the original owner of the lost item
    await Notification.create({
      user: item.user,
      sender: req.user._id,
      item: item._id,
      claim: claim._id,
      title: `Item Found: ${item.title}`,
      message: `${req.user.name} reported finding your ${item.title} at ${founderLocation || "campus"}. Open to review founder details and claim!`,
      type: "ItemFound",
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: "Found report submitted! The item owner has been notified.",
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Owner Confirms and Claims Their Found Item
// PUT /api/reports/confirm/:claimId
// Private
// ==========================================
const confirmClaimByOwner = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item")
      .populate("user", "name email phone");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim / Found report not found",
      });
    }

    const item = await Item.findById(claim.item._id || claim.item);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Verify logged-in user is the owner
    const isOwner =
      item.user.toString() === req.user._id.toString() ||
      (claim.owner && claim.owner.toString() === req.user._id.toString());

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the item owner can confirm and claim this item.",
      });
    }

    // Update claim status to Confirmed
    claim.status = "Confirmed";
    claim.confirmedAt = new Date();
    await claim.save();

    // Update item status to Found (recovered) and move to Found items
    item.status = "Found";
    item.type = "Found";
    await item.save();

    // Notify the finder
    await Notification.create({
      user: claim.user._id || claim.user,
      sender: req.user._id,
      item: item._id,
      claim: claim._id,
      title: `Claim Confirmed: ${item.title}`,
      message: `${req.user.name} confirmed your report and claimed their ${item.title}! Thank you for your assistance.`,
      type: "ClaimConfirmed",
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Item successfully claimed and marked as Found!",
      claim,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Owner Rejects False Found Report
// PUT /api/reports/reject/:claimId
// Private
// ==========================================
const rejectClaimByOwner = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId).populate("item");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    const item = await Item.findById(claim.item._id || claim.item);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const isOwner =
      item.user.toString() === req.user._id.toString() ||
      (claim.owner && claim.owner.toString() === req.user._id.toString());

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the item owner can reject this report.",
      });
    }

    claim.status = "Rejected";
    await claim.save();

    // Revert item status to Lost
    item.status = "Lost";
    item.founder = null;
    await item.save();

    // Notify the finder
    await Notification.create({
      user: claim.user,
      sender: req.user._id,
      item: item._id,
      claim: claim._id,
      title: `Report Not Matched: ${item.title}`,
      message: `The owner verified the details and determined that this is not their missing ${item.title}.`,
      type: "Claim",
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Report marked as not matched. Item status reverted to Lost.",
      claim,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Claim Details for an Item
// GET /api/reports/item/:itemId
// Private
// ==========================================
const getItemClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ item: req.params.itemId })
      .populate("user", "name email phone studentId")
      .populate("owner", "name email phone studentId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// General Submit Claim (Owner claims a Found Item)
// POST /api/reports/claim/:itemId
// Private
// ==========================================
const submitClaim = async (req, res) => {
  try {
    const { message } = req.body;

    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const alreadyClaimed = await Claim.findOne({
      user: req.user._id,
      item: item._id,
      status: { $ne: "Rejected" },
    });

    if (alreadyClaimed) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a claim for this item.",
      });
    }

    const claim = await Claim.create({
      user: req.user._id,
      item: item._id,
      owner: item.user,
      claimType: "OWNER_CLAIM",
      founderName: req.user.name,
      founderContact: req.user.phone || "",
      message,
      proofImage: req.file ? req.file.filename : "",
      status: "Pending",
    });

    // Notify item reporter
    await Notification.create({
      user: item.user,
      sender: req.user._id,
      item: item._id,
      claim: claim._id,
      title: `Claim Submitted: ${item.title}`,
      message: `${req.user.name} submitted a claim for ${item.title}. Check proof to confirm.`,
      type: "Claim",
    });

    res.status(201).json({
      success: true,
      message: "Claim submitted successfully",
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get My Claims
// GET /api/reports/my-claims
// Private
// ==========================================
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      $or: [{ user: req.user._id }, { owner: req.user._id }],
    })
      .populate("item")
      .populate("user", "name email phone")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Cancel Claim
// DELETE /api/reports/:id
// Private
// ==========================================
const cancelClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    if (claim.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await claim.deleteOne();

    res.status(200).json({
      success: true,
      message: "Claim cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Claims (Admin)
// GET /api/reports
// Private/Admin
// ==========================================
const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("user", "name email phone studentId")
      .populate("owner", "name email phone studentId")
      .populate("item", "title category location type status image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Claim Status (Admin)
// PUT /api/reports/:id
// Private/Admin
// ==========================================
const updateClaimStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    claim.status = status;
    claim.adminRemark = adminRemark || "";

    if (status === "Approved" || status === "Confirmed") {
      claim.confirmedAt = new Date();
    }

    await claim.save();

    // Update Item Status
    if (status === "Approved" || status === "Confirmed") {
      await Item.findByIdAndUpdate(claim.item, {
        status: "Found",
        type: "Found",
      });
    } else if (status === "Rejected") {
      await Item.findByIdAndUpdate(claim.item, {
        status: "Lost",
        type: "Lost",
        founder: null,
      });
    }

    // Notification
    await Notification.create({
      user: claim.user,
      item: claim.item,
      claim: claim._id,
      title: `Claim ${status}`,
      message:
        status === "Approved" || status === "Confirmed"
          ? "Congratulations! Your claim / found report has been approved."
          : "Your claim / found report has been marked as rejected.",
      type: "Claim",
    });

    res.status(200).json({
      success: true,
      message: "Claim status updated successfully",
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  submitFoundMatch,
  confirmClaimByOwner,
  rejectClaimByOwner,
  getItemClaims,
  submitClaim,
  getMyClaims,
  cancelClaim,
  getAllClaims,
  updateClaimStatus,
};