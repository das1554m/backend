const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendInvite = require("../utils/sendInvite");

// 🟢 REGISTER USER
exports.register = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    // 🔍 CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧾 CREATE USER
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: true
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

// 🟢 LOGIN USER
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // 🔍 FIND USER
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🔍 CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // 🔐 GENERATE TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

// 🔐 CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;

    // 🔍 FIND LOGGED-IN USER
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🔍 CHECK OLD PASSWORD
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password incorrect"
      });
    }

    // 🔐 HASH NEW PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password changed successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

// 📧 INVITE USER
exports.inviteUser = async (req, res) => {
  try {

    const { name, email, role } = req.body;

    // 🔍 CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 🔐 CREATE INVITE TOKEN
    const inviteToken = crypto.randomBytes(32).toString("hex");

    const inviteExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // 🧾 CREATE USER
    await User.create({
      name,
      email,
      role: role || "user",
      inviteToken,
      inviteExpires,
      isVerified: false
    });

    // 🔗 INVITE LINK
    const inviteLink =
      `${process.env.FRONTEND_URL}/set-password?token=${inviteToken}&email=${email}`;

    // 📩 SEND EMAIL
    await sendInvite({
      to: email,
      name,
      inviteLink
    });

    res.json({
      message: "Invite sent successfully!"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

// 🔐 SET PASSWORD
exports.setPassword = async (req, res) => {
  try {

    const { token, email, password } = req.body;

    // 🔍 FIND USER
    const user = await User.findOne({
      email,
      inviteToken: token,
      inviteExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired invite link"
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // 🧹 CLEAR INVITE DATA
    user.inviteToken = undefined;
    user.inviteExpires = undefined;

    user.isVerified = true;

    await user.save();

    res.json({
      message: "Password set! You can now login."
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};