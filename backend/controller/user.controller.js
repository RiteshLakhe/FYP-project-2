const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
const crypto = require("crypto");
const { sendMail: sendEmail, isEmailConfigured } = require("../utils/emailSender");
const multer = require("multer");
const DatauriParser = require("datauri/parser");
const path = require("path");
const { cloudinary, isCloudinaryConfigured } = require("../utils/cloudinary");
const mongoose = require("mongoose");
const { saveLocalFiles } = require("../utils/localUploads");
require('dotenv').config();

const parser = new DatauriParser();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});


const uploadImages = async (files) => {
  const uploads = files.map(async (file) => {
    const ext = path.extname(file.originalname).toString();
    const file64 = parser.format(ext, file.buffer);

    if (!isCloudinaryConfigured) {
      const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
      const [localUrl] = await saveLocalFiles([file], "avatars", baseUrl);
      return localUrl;
    }

    const result = await cloudinary.uploader.upload(file64.content, {
      folder: "rentEase/userAvatar",
    });
    return result.secure_url;
  });

  return Promise.all(uploads);
};

const createUser = async (req, res) => {
  const { fullname, phoneNumber, email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      fullname,
      phoneNumber,
      email,
      password: hashedPassword,
      profileImage: `https://avatar.iran.liara.run/username?username=${fullname}`,
      isVerified: true,
    });

    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.roles,
      isVerified: newUser.isVerified,
      currentRole: newUser.currentRole,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully. Please sign in.",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        phoneNumber: newUser.phoneNumber,
        profileImage: newUser.profileImage,
        email: newUser.email,
        roles: newUser.roles,
        currentRole: newUser.currentRole,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified." });

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.roles,
      isVerified: user.isVerified,
      currentRole: user.currentRole,
    });

    res.status(200).json({
      message: "Account verified successfully!",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        phoneNumber: user.phoneNumber,
        email: user.email,
        profileImage: user.profileImage,
        roles: user.roles,
        currentRole: user.currentRole,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const saveProperty = async (req, res) => {
  const { propertyId } = req.body;
  try {
    const user = await userModel.findById(req.user.id);
    if (!user.savedProperties.includes(propertyId)) {
      user.savedProperties.push(propertyId);
      await user.save();
    }

    res.status(200).json({ message: "Property saved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save property", error });
  }
};

const unsaveProperty = async (req, res) => {
  const userId = req.user.id;
  const { propertyId } = req.params;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.savedProperties.findIndex(
      (id) => id.toString() === propertyId
    );
    if (index === -1) {
      return res.status(400).json({ message: "Property not in saved list" });
    }

    user.savedProperties.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Property unsaved successfully" });
  } catch (error) {
    console.error("Unsave error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

const getSavedProperties = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).populate("savedProperties");
    res.status(200).json({ properties: user.savedProperties });
  } catch (error) {
    res.status(500).json({ message: "Failed to get saved properties", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select("-password")
      .populate("savedProperties", "title price imgUrls");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Handle password change with verification
    if (updates.currentPassword && updates.newPassword) {
      const existingUser = await userModel.findById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(updates.currentPassword, existingUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      updates.password = await bcrypt.hash(updates.newPassword, 10);
      delete updates.currentPassword;
      delete updates.newPassword;
    } else if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const file = req.file; 
    if (file) {
      const imgUrls = await uploadImages([file]);
      updates.profileImage = imgUrls[0];
    }

    const user = await userModel
      .findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const switchRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!["tenant", "landlord"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user.roles.includes(newRole)) {
      user.roles.push(newRole);
      await user.save();
    }

    user.currentRole = newRole;
    await user.save();

    res.status(200).json({
      message: `Switched to ${newRole}`,
      currentRole: user.currentRole,
      roles: user.roles,
    });
  } catch (error) {
    console.error("Error switching role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendEnquiry = async (req, res) => {
  const { fullname, email, phone, message, ownerEmail } = req.body;

  try {
    await sendEmail({
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: "New Property Enquiry - RentEase",
      html: `
        <h2>You have a new enquiry!</h2>
        <p><strong>From:</strong> ${fullname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ 
      success: true,
      message: "Enquiry sent successfully" 
    });
  } catch (error) {
    console.error("Enquiry Email Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send enquiry" 
    });
  }
};

const sendMail = async (req, res) => {
  const { fullname, email, phone, message } = req.body;

  if (!fullname || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const mailOptions = {
    from: email, 
    to: process.env.EMAIL_USER, 
    subject: `Contact Form Submission from ${fullname}`,
    html: `
      <h3>Contact Form Submission</h3>
      <p><strong>Name:</strong> ${fullname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  };

  try {
    await sendEmail(mailOptions);
    res.status(200).json({ 
      message: isEmailConfigured ? 'Email sent successfully.' : 'Email service is not configured yet. Message was not sent.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
}

module.exports = {
  upload,
  createUser,
  getAllUsers,
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  getUserById,
  updateUser,
  deleteUser,
  switchRole,
  verifyOtp,
  sendEnquiry,
  sendMail,
};
