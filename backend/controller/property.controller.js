const propertyModel = require("../model/property.model");
const { cloudinary, isCloudinaryConfigured } = require("../utils/cloudinary");
const DatauriParser = require("datauri/parser");
const path = require("path");
const multer = require("multer");
const userModel = require("../model/user.model");
const mongoose = require("mongoose");
const { saveLocalFiles } = require("../utils/localUploads");

const parser = new DatauriParser();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const validStatuses = ["Active", "Inactive", "Pending", "Rented"];
const validVisitStatuses = ["Pending", "Approved", "Rejected", "Completed"];

const getTrustLabel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
};

const calculateTrustScore = (property, owner) => {
  const averageRating = property.reviews.length
    ? property.reviews.reduce((sum, review) => sum + review.rating, 0) /
      property.reviews.length
    : 0;

  const approvedOrCompletedVisits = property.visitSchedules.filter((visit) =>
    ["Approved", "Completed"].includes(visit.status)
  );

  const respondedVisits = property.visitSchedules.filter(
    (visit) => visit.responseMinutes !== null && visit.responseMinutes !== undefined
  );

  const averageResponseMinutes = respondedVisits.length
    ? respondedVisits.reduce((sum, visit) => sum + visit.responseMinutes, 0) /
      respondedVisits.length
    : null;

  const verifiedIdentity = owner?.isVerified ? 20 : 0;
  const positiveReviews = Math.min(
    30,
    Math.round((averageRating / 5) * 20 + property.reviews.length * 2)
  );
  const responseTime =
    averageResponseMinutes === null
      ? 10
      : averageResponseMinutes <= 60
      ? 20
      : averageResponseMinutes <= 240
      ? 14
      : averageResponseMinutes <= 1440
      ? 8
      : 3;
  const listingAccuracy = property.verifiedListing && property.imgUrls.length >= 5 ? 15 : 5;
  const complaintHistory = Math.max(0, 15 - property.complaintsCount * 15);
  const score =
    verifiedIdentity +
    positiveReviews +
    responseTime +
    listingAccuracy +
    complaintHistory;

  return {
    score,
    label: getTrustLabel(score),
    breakdown: {
      verifiedIdentity,
      positiveReviews,
      responseTime,
      listingAccuracy,
      complaintHistory,
    },
    responseRate: property.visitSchedules.length
      ? Math.round((approvedOrCompletedVisits.length / property.visitSchedules.length) * 100)
      : 0,
    averageRating: Number(averageRating.toFixed(1)),
  };
};

const attachDerivedPropertyState = async (property) => {
  const owner = await userModel.findById(property.userId).select("isVerified");
  property.trustScore = calculateTrustScore(property, owner);

  if (!property.priceHistory.length) {
    property.priceHistory = [
      {
        price: property.price,
        changedAt: property.createdAt || new Date(),
        reason: "Initial listing",
      },
    ];
  }

  await property.save();
  return property;
};

const uploadImages = async (files) => {
  const uploads = files.map(async (file) => {
    const ext = path.extname(file.originalname).toString();
    const file64 = parser.format(ext, file.buffer);

    if (!isCloudinaryConfigured) {
      const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
      const [localUrl] = await saveLocalFiles([file], "properties", baseUrl);
      return localUrl;
    }

    const result = await cloudinary.uploader.upload(file64.content, {
      folder: "rentEase/Properties",
    });
    return result.secure_url;
  });

  return Promise.all(uploads);
};

const buildLocation = (body) => {
  const latitude = Number(body.latitude ?? body.location?.latitude);
  const longitude = Number(body.longitude ?? body.location?.longitude);
  const mapLabel =
    body.mapLabel ||
    body.location?.mapLabel ||
    [body.address, body.city].filter(Boolean).join(", ");

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Valid latitude and longitude are required");
  }

  return {
    latitude,
    longitude,
    mapLabel,
    googleMapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
  };
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

    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const newProperty = new propertyModel({
      ...formData,
      imgUrls,
      location: buildLocation(formData),
      userId: req.params.id,
      priceHistory: [
        {
          price: Number(formData.price),
          changedAt: new Date(),
          reason: "Initial listing",
        },
      ],
    });

    await newProperty.save();

    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for this property",
      });
    }

    if (!user.roles.includes("landlord")) {
      user.roles.push("landlord");
      user.currentRole = "landlord";
      await user.save();
    }

    await attachDerivedPropertyState(newProperty);

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
    const isValidationError = error?.name === "ValidationError";
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to create property",
      errors: isValidationError ? Object.fromEntries(
        Object.entries(error.errors).map(([key, value]) => [key, value.message])
      ) : undefined,
    });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const { status, includeInactive } = req.query;
    const query = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status filter" });
      }
      query.status = status;
    } else if (includeInactive !== "true") {
      query.status = "Active";
    }

    const properties = await propertyModel
      .find(query)
      .populate("userId", "fullname email phoneNumber profileImage isVerified")
      .sort({ createdAt: -1 });

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
    const property = await propertyModel
      .findById(req.params.id)
      .populate("userId", "fullname email phoneNumber profileImage isVerified")
      .populate("reviews.userId", "fullname profileImage")
      .populate("visitSchedules.visitorId", "fullname email profileImage");
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await attachDerivedPropertyState(property);

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
      .populate("userId", "fullname email phoneNumber profileImage isVerified");

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

    const existingProperty = await propertyModel.findById(req.params.id);
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (existingProperty.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (updates.status && !validStatuses.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid property status. Must be one of: Active, Inactive, Pending, Rented",
      });
    }

    if (
      updates.latitude !== undefined ||
      updates.longitude !== undefined ||
      updates.mapLabel !== undefined ||
      updates.location
    ) {
      updates.location = buildLocation(updates);
      delete updates.latitude;
      delete updates.longitude;
      delete updates.mapLabel;
    }

    if (updates.price !== undefined) {
      const nextPrice = Number(updates.price);
      if (!Number.isNaN(nextPrice) && nextPrice !== existingProperty.price) {
        updates.$push = {
          priceHistory: {
            price: nextPrice,
            changedAt: new Date(),
            reason: req.body.priceChangeReason || "Price updated",
          },
        };
      }
    }

    const updatedProperty = await propertyModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: Object.fromEntries(
          Object.entries(updates).filter(([key]) => key !== "$push" && key !== "priceChangeReason")
        ),
        ...(updates.$push ? { $push: updates.$push } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await attachDerivedPropertyState(updatedProperty);

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
    const property = await propertyModel.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await property.deleteOne();

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

const addPropertyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (property.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Landlords cannot review their own property",
      });
    }

    const existingReview = property.reviews.find(
      (review) => review.userId.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
    } else {
      property.reviews.push({
        userId: req.user._id,
        fullname: req.user.fullname,
        rating: Number(rating),
        comment,
      });
    }

    await attachDerivedPropertyState(property);
    await property.populate("reviews.userId", "fullname profileImage");

    return res.status(200).json({
      success: true,
      message: existingReview ? "Review updated" : "Review added",
      reviews: property.reviews,
      trustScore: property.trustScore,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to save review",
    });
  }
};

const scheduleVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledFor, note, visitorPhone } = req.body;

    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (property.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot schedule a visit for your own property",
      });
    }

    property.visitSchedules.push({
      visitorId: req.user._id,
      visitorName: req.user.fullname,
      visitorEmail: req.user.email,
      visitorPhone: visitorPhone || req.user.phoneNumber?.toString() || "",
      scheduledFor,
      note: note || "",
    });

    await attachDerivedPropertyState(property);
    await property.populate("visitSchedules.visitorId", "fullname email profileImage");

    return res.status(201).json({
      success: true,
      message: "Visit request submitted",
      visitSchedules: property.visitSchedules,
      trustScore: property.trustScore,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule visit",
    });
  }
};

const updateVisitScheduleStatus = async (req, res) => {
  try {
    const { id, visitId } = req.params;
    const { status } = req.body;

    if (!validVisitStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid visit status" });
    }

    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (property.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const visit = property.visitSchedules.id(visitId);
    if (!visit) {
      return res.status(404).json({ success: false, message: "Visit request not found" });
    }

    visit.status = status;
    if (visit.createdAt) {
      visit.responseMinutes = Math.max(
        0,
        Math.round((Date.now() - new Date(visit.createdAt).getTime()) / 60000)
      );
    }

    await attachDerivedPropertyState(property);
    await property.populate("visitSchedules.visitorId", "fullname email profileImage");

    return res.status(200).json({
      success: true,
      message: "Visit status updated",
      visitSchedules: property.visitSchedules,
      trustScore: property.trustScore,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update visit status",
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
  addPropertyReview,
  scheduleVisit,
  updateVisitScheduleStatus,
};
