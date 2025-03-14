const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Content is required"],
            max: [1500, "Content is too long"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: [true, "Post is required"],
        }
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
