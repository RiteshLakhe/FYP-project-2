const express = require("express");
const {
  upload,
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertiesByOwner,
  updatePropertyStatus,
  addPropertyReview,
  scheduleVisit,
  updateVisitScheduleStatus,
  addPropertyImages,
  replacePropertyImage,
  deletePropertyImage,
} = require("../controller/property.controller");
const { protect, optionalProtect, checkVerified } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/postProperty/:id", protect, checkVerified, upload.array("images", 10), createProperty);
router.get("/getAllProperty", optionalProtect, getAllProperties);
router.get("/propertyById/:id", getPropertyById);
router.get("/owner/:userId", getPropertiesByOwner);
router.post("/:id/reviews", protect, addPropertyReview);
router.post("/:id/visits", protect, scheduleVisit);
router.patch("/:id/visits/:visitId", protect, updateVisitScheduleStatus);
router.put("/updateProperty/:id", protect, updateProperty);
router.delete("/deleteProperty/:id", protect, deleteProperty);
router.patch("/updateStatus/:id", protect, updatePropertyStatus);

// Image management endpoints (landlord owner or admin)
router.post("/:id/images", protect, upload.array("images", 10), addPropertyImages);
router.put("/:id/images", protect, upload.array("images", 1), replacePropertyImage);
router.delete("/:id/images/:imageIndex", protect, deletePropertyImage);

module.exports = router;
