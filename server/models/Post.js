const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
    type: {
        type: String, enum: ["Image"],
        required: true,
        validate: {
            validator: function (v) {
                return v === "Image";
            },
            message: "Media type must be 'Image'."
        }
    },
    url:{
        type: String,
        required: true
    }
}, { timestamps: true });
const PostSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true },
        category: { type: String, required: true },
        privacy: { type: String, enum: ["public", "private"], default: "private" },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        likesCount:{ type: Number, default: 0, min: [0, "Likes count must be at least 0"] },
        medias: [MediaSchema],
    },
    { timestamps: true }
);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
