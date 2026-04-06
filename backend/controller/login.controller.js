const crypto = require('crypto');
const userModel = require("../model/user.model");
const adminModel = require("../model/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/token");
require("dotenv").config();
const { sendMail, isEmailConfigured } = require("../utils/emailSender");

const logIn = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 1. Check if Admin
    const admin = await adminModel.findOne({ email });
    if (admin) {
      const isAdminPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isAdminPasswordValid) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }

      const token = generateToken({
        id: admin._id,
        email: admin.email,
        roles: "admin",
      });

      if (rememberMe) {
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        token,
        user: {
          id: admin._id,
          fullname: admin.fullname,
          phoneNumber: null,
          profileImage: "",
          email: admin.email,
          roles: "admin",
          currentRole: "admin",
        },
      });
    }

    // 2. Check if Normal User
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isUserPasswordValid = await bcrypt.compare(password, user.password);
    if (!isUserPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.currentRole,
    });

    if (rememberMe) {
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });
    }

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        email: user.email,
        currentRole: user.currentRole,
        roles: user.roles,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body
  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found with that email' });

    const token = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/registration/reset-password/${token}`;

    await sendMail({
      from: `"RentEase Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset - RentEase',
      html: `
        <p>You requested to reset your RentEase password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background: #1E293B; color: #fff; text-decoration: none;" target="_blank">Reset Password</a>
        <p>If you didn’t request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.json({
      message: isEmailConfigured
        ? 'Password reset link sent to your email.'
        : 'Email is not configured. Returning reset details for development.',
      devResetToken: isEmailConfigured ? undefined : token,
      devResetLink: isEmailConfigured ? undefined : resetLink,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully. Please sign in.' });
  } catch (err) {
    console.error('Error in resetPassword:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { logIn, forgotPassword, resetPassword };
