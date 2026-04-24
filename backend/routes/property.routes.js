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
} = require("../controller/property.controller");
const { protect, checkVerified } = require("../middleware/auth.middleware")
const router = express.Router();

router.post("/postProperty/:id", protect, checkVerified, upload.array("images", 10), createProperty);
router.get("/getAllProperty", getAllProperties);
router.get("/propertyById/:id", getPropertyById)
router.get("/owner/:userId", getPropertiesByOwner)
router.put("/updateProperty/:id", protect, updateProperty)
router.delete("/deleteProperty/:id", protect, deleteProperty)
router.patch("/updateStatus/:id", protect, updatePropertyStatus);

module.exports = router;
