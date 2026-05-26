const express = require("express");

const router = express.Router();

const {
  register,
  login,
  changePassword,
  inviteUser,
  setPassword
} = require("../controllers/userController");

const auth = require("../middleware/Auth");
const admin = require("../middleware/admin");

const User = require("../models/User");

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Logged-in User
router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

// Protected Test Route
router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user
  });
});

// Change Password
router.put("/change-password", auth, changePassword);

// Team Members
router.get("/team", auth, async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
});

// Admin Only Route
router.get("/all-users", auth, admin, async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
});

// Invite User
router.post("/invite", auth, inviteUser);

// Set Password
router.post("/set-password", setPassword);

module.exports = router;