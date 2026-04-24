const express = require("express");
const router = express.Router();
const {
  logIn,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  resetPassword,
} = require("../controller/login.controller");

router.post("/login", logIn);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/resend-login-otp", resendLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
