const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    // User who submitted the claim or found report
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Item being claimed or reported found
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    // Original owner of the item (the person who lost it)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Type of report
    claimType: {
      type: String,
      enum: ["FOUND_REPORT", "OWNER_CLAIM"],
      default: "FOUND_REPORT",
    },

    // Founder Details (when someone finds a lost item)
    founderName: {
      type: String,
      default: "",
    },
    founderContact: {
      type: String,
      default: "",
    },
    founderLocation: {
      type: String,
      default: "",
    },
    dateFound: {
      type: Date,
      default: Date.now,
    },

    // Proof / Message
    message: {
      type: String,
      required: [true, "Please provide details or proof"],
      trim: true,
    },

    // Supporting Image (optional)
    proofImage: {
      type: String,
      default: "",
    },

    // Claim Status
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Approved", "Rejected"],
      default: "Pending",
    },

    // Timestamp when confirmed/claimed by owner
    confirmedAt: {
      type: Date,
      default: null,
    },

    // Admin Remarks
    adminRemark: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Claim", claimSchema);