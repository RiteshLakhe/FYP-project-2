const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  switchRole,
  verifyOtp,
  saveProperty,
  getSavedProperties,
  unsaveProperty,
  sendEnquiry,
  sendMail,
  upload
} = require("../controller/user.controller");
const { protect } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/registerUser", createUser);
router.get("/getAllUsers", getAllUsers);
router.get("/getUserById/:id", getUserById);
router.put("/updateUser/:id", protect, upload.single('profileImage'), updateUser);
router.delete("/deleteUser/:id", protect, deleteUser);
router.post("/switch-role", protect, switchRole);
router.post("/verify-otp", verifyOtp)
router.post("/save-properties", protect, saveProperty)
router.get("/get-saved-properties", protect, getSavedProperties)
router.delete("/unsave-property/:propertyId", protect, unsaveProperty)
router.post("/send-enquiry", protect, sendEnquiry);
router.post('/contact', sendMail);

module.exports = router;
