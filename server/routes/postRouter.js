const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { isAuthorized } = require("../middleware/verifyAuth.middleware");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 📂 Kiểm tra và tạo thư mục "uploads" nếu chưa tồn tại
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Thư mục uploads đã được tạo!");
}

// ⚙️ Cấu hình Multer để lưu ảnh
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 5MB limit
});


// 📝 API Routes
router.post("/create", upload.array('medias'), postController.createPost);
router.put("/:id", isAuthorized, upload.array("images", 3), postController.updatePost);
router.delete("/:id", isAuthorized, postController.deletePost);
router.get("/public/:userId", postController.getPublicPosts); // 🟢 Route mới để lấy bài viết Public
router.get("/profile/:userId/:currentUserId", postController.getProfilePosts); // 🟢 Route mới để lấy bài viết Private
router.get("/:postId/:userId", postController.getPostById);
router.post("/like/:postId", postController.updateLikePost);
router.post("/audio-to-text", upload.single('audio'), postController.getTextfromAudio);

module.exports = router;
