const Item = require("../models/Item");

// ========================================
// Add New Item
// POST /api/items
// Private
// ========================================
const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      date,
      contact,
    } = req.body;

    const initialStatus = req.body.status || (type === "Lost" ? "Lost" : "Found");

    const item = await Item.create({
      user: req.user._id,
      title,
      description,
      category,
      type,
      location,
      date,
      contact,
      status: initialStatus,
      image: req.file ? req.file.filename : "",
    });

    res.status(201).json({
      success: true,
      message: "Item Report Submitted Successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Get All Items
// GET /api/items
// Public
// ========================================
const getAllItems = async (req, res) => {
  try {
    const { category, type, status, search } = req.query;

    const conditions = [];

    if (category && category !== "All") {
      conditions.push({ category });
    }

    if (type === "Lost") {
      // Lost items page: only show items that are still lost or pending claim
      conditions.push({ 
        type: "Lost", 
        status: { $nin: ["Found", "Claimed", "Returned"] } 
      });
    } else if (type === "Found") {
      // Found items page: include reported found items and recovered lost items
      conditions.push({
        $or: [
          { type: "Found" },
          { status: { $in: ["Found", "Claimed", "Returned"] } },
        ],
      });
    } else if (type) {
      conditions.push({ type });
    }

    if (status && status !== "All") {
      conditions.push({ status });
    }

    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const items = await Item.find(filter)
      .populate("user", "name email phone")
      .populate("founder", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Get Single Item
// GET /api/items/:id
// Public
// ========================================
const getSingleItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("user", "name email phone studentId")
      .populate("founder", "name email phone studentId");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item Not Found",
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Get My Reports
// GET /api/items/my-items
// Private
// ========================================
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Update Item
// PUT /api/items/:id
// Private
// ========================================
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item Not Found",
      });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedData = {
      ...req.body,
    };

    if (req.file) {
      updatedData.image = req.file.filename;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Item Updated Successfully",
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Delete Item
// DELETE /api/items/:id
// Private
// ========================================
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item Not Found",
      });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Item Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getSingleItem,
  getMyItems,
  updateItem,
  deleteItem,
};