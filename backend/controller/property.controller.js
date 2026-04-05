const propertyModel = require("../model/property.model");
const cloudinary = require("../utils/cloudinary");
const DatauriParser = require("datauri/parser");
const path = require("path");
const multer = require("multer");
const userModel = require("../model/user.model");
const mongoose = require("mongoose");

const parser = new DatauriParser();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const validStatuses = ["Active", "Inactive", "Pending", "Rented"];

const uploadImages = async (files) => {
  const uploads = files.map(async (file) => {
    const ext = path.extname(file.originalname).toString();
    const file64 = parser.format(ext, file.buffer);
    const result = await cloudinary.uploader.upload(file64.content, {
      folder: "rentEase/Properties",
    });
    return result.secure_url;
  });

  return Promise.all(uploads);
};

const createProperty = async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    if (!files || files.length < 5) {
      return res.status(400).json({
        message: "Atleast 5 images are required",
      });
    }

    const imgUrls = await uploadImages(files);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const newProperty = new propertyModel({
      ...formData,
      imgUrls,
      userId: req.params.id,
    });

    await newProperty.save();

    const user = await userModel.findById(req.params.id);

    if (!user.roles.includes("landlord")) {
      user.roles.push("landlord");
      user.currentRole = "landlord";
      await user.save();
    }

    res.status(201).json({
      success: true,
      property: newProperty,
      user: {
        roles: user.roles,
        currentRole: user.currentRole,
        fullname: user.fullname,
        email: user.email,
        id: user._id,
        profileImage: user.profileImage,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status filter" });
      }
      query.status = status;
    }

    const properties = await propertyModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await propertyModel.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }
    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};

const getPropertiesByOwner = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const properties = await propertyModel
      .find({ userId: userId })
      .populate("userId", "fullname email");

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user properties",
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.status && !validStatuses.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid property status. Must be one of: Active, Inactive, Pending, Rented",
      });
    }

    const updatedProperty = await propertyModel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property: updatedProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update property",
    });
  }
};

const updatePropertyStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  try {
    const property = await propertyModel.findById(id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (property.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    property.status = status;
    await property.save();

    res
      .status(200)
      .json({ success: true, message: "Status updated", property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await propertyModel.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};

module.exports = {
  upload,
  createProperty,
  getAllProperties,
  getPropertiesByOwner,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
};
