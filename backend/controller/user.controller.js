const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
const { sendMail: sendEmail, isEmailConfigured } = require("../utils/emailSender");
const multer = require("multer");
const DatauriParser = require("datauri/parser");
const path = require("path");
const { cloudinary, isCloudinaryConfigured } = require("../utils/cloudinary");
const { saveLocalFiles } = require("../utils/localUploads");
const { buildOtp, getOtpExpiry, buildOtpEmail } = require("../utils/otp");
require("dotenv").config();

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

const sendSignupOtpEmail = async (user) => {
  const otp = buildOtp();
  const otpExpires = getOtpExpiry();
  const emailContent = buildOtpEmail({
    fullname: user.fullname,
    otp,
    purpose: "signup",
  });

  user.otp = otp;
  user.otpExpires = otpExpires;
  user.otpPurpose = "signup";
  await user.save();

  await sendEmail({
    from: `"RentEase Security" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  return otp;
};

const sanitizeUser = (user) => ({
  id: user._id,
  fullname: user.fullname,
  phoneNumber: user.phoneNumber,
  profileImage: user.profileImage,
  email: user.email,
  roles: user.roles,
  currentRole: user.currentRole,
});

const createUser = async (req, res) => {
  const { fullname, phoneNumber, email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uploadedProfileImage = req.file ? (await uploadImages([req.file]))[0] : null;
    const profileImage =
      uploadedProfileImage ||
      `https://avatar.iran.liara.run/username?username=${encodeURIComponent(fullname)}`;

    const user = existingUser || new userModel({ email });
    user.fullname = fullname;
    user.phoneNumber = phoneNumber;
    user.email = email;
    user.password = hashedPassword;
    user.profileImage = profileImage;
    user.isVerified = false;
    user.roles = ["tenant"];
    user.currentRole = "tenant";

    await user.save();
    const devOtp = await sendSignupOtpEmail(user);

    return res.status(201).json({
      success: true,
      requiresTwoStepVerification: true,
      message: isEmailConfigured
        ? "Signup started. Verify the OTP sent to your email to activate the account."
        : "Email is not configured. Returning OTP for development.",
      email: user.email,
      user: sanitizeUser(user),
      devOtp: isEmailConfigured ? undefined : devOtp,
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
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }

    if (user.isVerified && user.otpPurpose !== "signup") {
      return res.status(400).json({ success: false, message: "User already verified." });
    }

    if (user.otpPurpose !== "signup") {
      return res.status(400).json({ success: false, message: "No signup verification is pending." });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpPurpose = undefined;
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.roles,
      isVerified: user.isVerified,
      currentRole: user.currentRole,
    });

    res.status(200).json({
      success: true,
      message: "Account verified successfully!",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified." });
    }

    const devOtp = await sendSignupOtpEmail(user);

    return res.status(200).json({
      success: true,
      message: isEmailConfigured
        ? "A new OTP has been sent to your email."
        : "Email is not configured. Returning OTP for development.",
      devOtp: isEmailConfigured ? undefined : devOtp,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
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
    const users = await userModel.find().select("-password -otp -loginOtp -resetPasswordToken");

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
      .select("-password -otp -loginOtp -resetPasswordToken")
      .populate("savedProperties", "title price imgUrls location");

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
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

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

    delete updates.otp;
    delete updates.loginOtp;
    delete updates.resetPasswordToken;

    const user = await userModel
      .findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password -otp -loginOtp -resetPasswordToken");

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
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

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
  resendSignupOtp,
  sendEnquiry,
  sendMail,
};
