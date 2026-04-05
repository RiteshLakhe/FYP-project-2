const express = require("express");
const router = express.Router();
const { logIn, forgotPassword, resetPassword } = require("../controller/login.controller");

router.post("/login", logIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;