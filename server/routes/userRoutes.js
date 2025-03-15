const express = require("express");
const { register, login, getProfile, verifyOTP } = require("../controllers/userController"); 
const router = express.Router();


// Đăng ký & đăng nhập
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP); // Xác nhận OTP & đăng ký

// Xem thông tin người dùng
router.get("/:userId", getProfile);

module.exports = router;
