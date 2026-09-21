const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    // Item Name
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
    },

    // Description
    description: {
      type: String,
      required: [true, "Description is required"],
    },

    // Category
    category: {
      type: String,
      required: true,
      enum: [
        "Mobile",
        "Laptop",
        "Bag",
        "Books",
        "ID Card",
        "Keys",
        "Wallet",
        "Watch",
        "Electronics",
        "Clothes",
        "Bottle",
        "Others"
      ],
    },

    // Lost or Found
    type: {
      type: String,
      required: true,
      enum: ["Lost", "Found"],
    },

    // Location
    location: {
      type: String,
      required: true,
    },

    // Date
    date: {
      type: Date,
      required: true,
    },

    // Item Image
    image: {
      type: String,
      default: "",
    },

    // Contact Number
    contact: {
      type: String,
      required: true,
    },

    // Item Status
    status: {
      type: String,
      enum: ["Lost", "Pending", "Found", "Claimed", "Returned"],
      default: "Lost",
    },

    // Founder who reported finding this lost item
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // User who reported item
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Is Verified by Admin
    isVerified: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);