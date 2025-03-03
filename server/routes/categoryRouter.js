const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Kiểm tra xem controller có tồn tại không
console.log('categoryController:', categoryController);

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

module.exports = router;