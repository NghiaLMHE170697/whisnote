const express = require("express");
const { register, login, getProfile, followUser, unfollowUser, verifyOTP } = require("../controllers/userController"); 
const router = express.Router();
const { isAuthorized } = require("../middleware/verifyAuth.middleware");
const User = require("../models/User"); // Ensure the User model is imported



// Đăng ký & đăng nhập
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP); // Xác nhận OTP & đăng ký

// Xem thông tin người dùng
router.get("/:id", getProfile);
router.get("/me", async (req, res) => {
    try {
        console.log("🔍 Request userId từ token:", req.userId);
        
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });

        res.json({ status: "success", data: user });
    } catch (error) {
        console.error("🚨 Lỗi khi lấy user:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// Theo dõi / Bỏ theo dõi
router.post("/:id/follow", followUser);
router.post("/:id/unfollow", unfollowUser);

module.exports = router;
