const crypto = require("crypto");
const userModel = require("../model/user.model");
const adminModel = require("../model/admin.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
require("dotenv").config();
const { sendMail, isEmailConfigured } = require("../utils/emailSender");
const { buildOtp, getOtpExpiry, buildOtpEmail } = require("../utils/otp");

const buildAuthResponse = (account, token, isAdmin = false) => ({
  success: true,
  message: isAdmin ? "Admin logged in successfully" : "User logged in successfully",
  token,
  user: {
    id: account._id,
    fullname: account.fullname,
    phoneNumber: isAdmin ? null : account.phoneNumber,
    profileImage: isAdmin ? "" : account.profileImage,
    email: account.email,
    roles: isAdmin ? "admin" : account.roles,
    currentRole: isAdmin ? "admin" : account.currentRole,
  },
});

const sendOtpForLogin = async (account, rememberMe, role, res) => {
  const otp = buildOtp();
  const expiresAt = getOtpExpiry();
  const emailContent = buildOtpEmail({
    fullname: account.fullname,
    otp,
    purpose: "login",
  });

  account.loginOtp = otp;
  account.loginOtpExpires = expiresAt;
  await account.save();

  await sendMail({
    from: `"RentEase Security" <${process.env.EMAIL_USER}>`,
    to: account.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  return res.status(200).json({
    success: true,
    requiresTwoStepVerification: true,
    message: isEmailConfigured
      ? "A verification code has been sent to your email."
      : "Email is not configured. Returning OTP for development.",
    email: account.email,
    role,
    rememberMe: Boolean(rememberMe),
    devOtp: isEmailConfigured ? undefined : otp,
  });
};

const logIn = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await adminModel.findOne({ email });
    if (admin) {
      const isAdminPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isAdminPasswordValid) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }

      return sendOtpForLogin(admin, rememberMe, "admin", res);
    }

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

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your sign up OTP before logging in.",
      });
    }

    return sendOtpForLogin(user, rememberMe, "user", res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, rememberMe } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const admin = await adminModel.findOne({ email });
    if (admin) {
      if (admin.loginOtp !== otp.toString().trim()) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }

      if (!admin.loginOtpExpires || admin.loginOtpExpires < Date.now()) {
        return res.status(400).json({ success: false, message: "OTP has expired" });
      }

      admin.loginOtp = undefined;
      admin.loginOtpExpires = undefined;
      await admin.save();

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

      return res.status(200).json(buildAuthResponse(admin, token, true));
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.loginOtp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (!user.loginOtpExpires || user.loginOtpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.currentRole,
      isVerified: user.isVerified,
    });

    if (rememberMe) {
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    console.error("Login OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const admin = await adminModel.findOne({ email });
    if (admin) {
      return sendOtpForLogin(admin, false, "admin", res);
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please complete sign up verification first.",
      });
    }

    return sendOtpForLogin(user, false, "user", res);
  } catch (error) {
    console.error("Resend login OTP error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with that email" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/registration/reset-password/${token}`;

    await sendMail({
      from: `"RentEase Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset - RentEase",
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
        ? "Password reset link sent to your email."
        : "Email is not configured. Returning reset details for development.",
      devResetToken: isEmailConfigured ? undefined : token,
      devResetLink: isEmailConfigured ? undefined : resetLink,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully. Please sign in." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { logIn, verifyLoginOtp, resendLoginOtp, forgotPassword, resetPassword };
