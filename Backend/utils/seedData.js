const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const Notification = require("../models/Notification");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Lost-Found-Portal";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for seeding...");

    // Clear existing
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});
    await Notification.deleteMany({});

    // Create Users
    const passwordHash = await bcrypt.hash("Password@123", 10);

    const admin = await User.create({
      name: "Campus Security Admin",
      email: "admin@college.edu",
      password: passwordHash,
      studentId: "ADM-001",
      phone: "+1 555-0199",
      course: "Security Administration",
      role: "admin",
    });

    const alice = await User.create({
      name: "Alice Johnson",
      email: "alice@college.edu",
      password: passwordHash,
      studentId: "STU-2024-001",
      phone: "+1 555-0101",
      course: "Computer Science",
      role: "student",
    });

    const bob = await User.create({
      name: "Bob Martinez",
      email: "bob@college.edu",
      password: passwordHash,
      studentId: "STU-2024-002",
      phone: "+1 555-0102",
      course: "Mechanical Engineering",
      role: "student",
    });

    const hardikAdmin = await User.create({
      name: "Hardik Admin",
      email: "jeehardik2@gmail.com",
      password: passwordHash,
      studentId: "ADM-HARDIK",
      phone: "+1 555-0100",
      course: "Administration",
      role: "admin",
    });

    console.log("Users created successfully:");
    console.log("- Hardik Admin : jeehardik2@gmail.com / Password@123");
    console.log("- Admin : admin@college.edu / Password@123");
    console.log("- Alice : alice@college.edu / Password@123");
    console.log("- Bob   : bob@college.edu / Password@123");

    // 1. Item in "Lost" status (Reported by Alice)
    const lostItem = await Item.create({
      title: "Blue Nike Backpack",
      description: "Navy blue backpack containing notebooks and a blue pencil case. Lost near 2nd floor library.",
      category: "Bag",
      type: "Lost",
      status: "Lost",
      location: "Library 2nd Floor",
      date: new Date(Date.now() - 24 * 3600 * 1000),
      contact: "+1 555-0101",
      user: alice._id,
      image: "",
    });

    // 2. Item in "Pending" status (Alice lost it, Bob reported finding it!)
    const pendingItem = await Item.create({
      title: "Casio Scientific Calculator",
      description: "Black Casio fx-991EX calculator with silver sticker on the cover.",
      category: "Electronics",
      type: "Lost",
      status: "Pending",
      location: "Science Block Lab 3",
      date: new Date(Date.now() - 48 * 3600 * 1000),
      contact: "+1 555-0101",
      user: alice._id,
      founder: bob._id,
      image: "",
    });

    // Create Claim for pending item
    const pendingClaim = await Claim.create({
      user: bob._id,
      owner: alice._id,
      item: pendingItem._id,
      claimType: "FOUND_REPORT",
      founderName: bob.name,
      founderContact: bob.phone,
      founderLocation: "Science Block Front Desk with Guard",
      dateFound: new Date(),
      message: "I found this calculator under bench 4 in Lab 3. I gave it to the lab assistant, or call me to collect.",
      status: "Pending",
    });

    // Notification for Alice
    await Notification.create({
      user: alice._id,
      sender: bob._id,
      item: pendingItem._id,
      claim: pendingClaim._id,
      title: `Item Found: ${pendingItem.title}`,
      message: `${bob.name} reported finding your ${pendingItem.title} at Science Block Front Desk. Review founder details and claim!`,
      type: "ItemFound",
      isRead: false,
    });

    // 3. Item in "Found" status (Recovered & confirmed)
    const recoveredItem = await Item.create({
      title: "Apple AirPods Pro",
      description: "White AirPods Pro with green silicone protective case.",
      category: "Electronics",
      type: "Lost",
      status: "Found",
      location: "Campus Cafeteria",
      date: new Date(Date.now() - 72 * 3600 * 1000),
      contact: "+1 555-0102",
      user: bob._id,
      founder: alice._id,
      image: "",
    });

    await Claim.create({
      user: alice._id,
      owner: bob._id,
      item: recoveredItem._id,
      claimType: "FOUND_REPORT",
      founderName: alice.name,
      founderContact: alice.phone,
      founderLocation: "Cafeteria Lost & Found counter",
      dateFound: new Date(Date.now() - 36 * 3600 * 1000),
      message: "Handed over safely to owner at the cafeteria counter.",
      status: "Confirmed",
      confirmedAt: new Date(Date.now() - 12 * 3600 * 1000),
    });

    console.log("Database seeded with sample Lost, Pending, and Found records!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
