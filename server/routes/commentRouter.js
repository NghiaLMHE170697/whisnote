const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.get("/:postId", commentController.getPostComments);
router.post("/add/:postId", commentController.addPostComment);

module.exports = router;