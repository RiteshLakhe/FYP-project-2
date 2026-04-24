const mongoose = require("mongoose");

const propertyReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullname: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const visitScheduleSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitorName: { type: String, required: true },
    visitorEmail: { type: String, required: true },
    visitorPhone: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    note: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
    responseMinutes: { type: Number, default: null },
  },
  { timestamps: true }
);

const priceHistorySchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String, trim: true, default: "Initial listing" },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: {
      type: String,
      required: true,
      enum: ["Room", "Appartment", "Commercial Space"],
    },

    propertyType: {
      type: String,
      required: true,
      enum: ["Residential", "Commercial"],
    },

    address: { type: String, required: true },
    city: { type: String, required: true },
    municipality: { type: String, required: true },
    wardNo: { type: String, required: true },
    totalArea: { type: Number, required: true },
    floor: { type: String, required: true },
    dimension: { type: Number, required: true },

    roadType: {
      type: String,
      required: true,
      enum: ["Gravelled", "Paved", "Alley"],
    },

    propertyFace: {
      type: String,
      required: true,
      enum: [
        "East",
        "West",
        "North",
        "South",
        "South-East",
        "South-West",
        "North-East",
        "North-West",
      ],
    },

    bedrooms: { type: Number },
    bathrooms: { type: Number },
    kitchens: { type: Number },
    halls: { type: Number },
    furnishing: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
    },
    balcony: { type: Number },
    attachedBathroom: { type: String },
    suitable: { type: String },
    floorLoad: { type: Number },
    powerBackup: { type: String, enum: ["Yes", "No"] },
    liftAccess: { type: String, enum: ["Yes", "No"] },
    pantryArea: { type: String, enum: ["Yes", "No"] },
    parkingSpace: { type: String },

    imgUrls: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return val.length >= 5;
        },
        message: "At least 5 images are required.",
      },
    },

    price: { type: Number, required: true },
    priceInWords: { type: String, required: true },

    negotiable: {
      type: String,
      required: true,
      enum: ["Yes", "No"],
    },

    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      mapLabel: { type: String, required: true },
      googleMapsUrl: { type: String, required: true },
    },

    verifiedListing: {
      type: Boolean,
      default: true,
    },

    complaintsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviews: {
      type: [propertyReviewSchema],
      default: [],
    },

    visitSchedules: {
      type: [visitScheduleSchema],
      default: [],
    },

    priceHistory: {
      type: [priceHistorySchema],
      default: [],
    },

    trustScore: {
      score: { type: Number, default: 0 },
      label: {
        type: String,
        enum: ["Low", "Moderate", "High", "Excellent"],
        default: "Low",
      },
      breakdown: {
        verifiedIdentity: { type: Number, default: 0 },
        positiveReviews: { type: Number, default: 0 },
        responseTime: { type: Number, default: 0 },
        listingAccuracy: { type: Number, default: 0 },
        complaintHistory: { type: Number, default: 0 },
      },
      responseRate: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Rented"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
