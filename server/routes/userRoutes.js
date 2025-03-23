const express = require("express");
const { register, login, getProfile, verifyOTP, upgradePlan, updateProfile, getUsers, countUserRoles } = require("../controllers/userController");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 5MB limit
});

// Đăng ký & đăng nhập
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP); // Xác nhận OTP & đăng ký

// Xem thông tin người dùng
router.get("/:userId", getProfile);
router.post("/upgrade-plan", upgradePlan);
router.put("/update-profile/:userId", upload.single("avatar"), updateProfile);
router.get("/admin/user/list", getUsers);
router.get("/admin/user/role-counts", countUserRoles);

module.exports = router;
