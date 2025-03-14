const mongoose = require("mongoose");
const User = require("./User.js"); // Đảm bảo khớp với tên file
const Post = require("./Post.js"); // Đảm bảo khớp với tên file
const Category = require("./Category.js"); // Đảm bảo khớp với tên file
const Comment = require("./Comment.js");

// Initialize database object
const db = {};

db.User = User;
db.Post = Post;
db.Category = Category;
db.Comment = Comment;

// Connect to database
db.connectDB = async (req, res, next) => {
    try {
        await mongoose
            .connect(process.env.MONGODB_URI)
            .then(() => console.log("Connect to MongoDB successfully"));
    } catch (err) {
        next(err);
        process.exit();
    }
};

module.exports = db;