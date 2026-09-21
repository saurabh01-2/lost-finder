const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Receiver of the notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification Title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification Message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Related Item (Optional)
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },

    // Related Claim (Optional)
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      default: null,
    },

    // Sender who caused the notification (e.g. founder or claimant)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        "ItemFound",
        "Claim",
        "ClaimConfirmed",
        "ClaimApproved",
        "Item",
        "System",
        "Admin"
      ],
      default: "System",
    },

    // Read Status
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);