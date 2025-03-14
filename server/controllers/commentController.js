const Comment = require("../models/Comment");
const { getTimeDifference } = require("../middleware/general.middleware");

const addPostComment = async (req, res) => {
    const { content, author } = req.body;
    const { postId } = req.params;

    try {
        //Validate required fields
        if (!content || !author || !postId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newComment = new Comment({
            content,
            author,
            post: postId
        });

        const savedComment = await newComment.save();
        return res.status(201).json(savedComment);
    } catch (error) {
        console.error("Error adding comment: ", error);
        return res.status(500).json({ message: error.message });
    }
}

const getPostComments = async (req, res) => {
    const { postId } = req.params;
    try {
        if (!postId) {
            return res.status(400).json({ message: "Missing postId" });
        }
        const comments = await Comment.find({ post: postId })
            .populate({
                path: "author",
                select: "username avatar"
            })
            .sort({ createdAt: -1 })
            .exec();

        if (!comments || comments.length === 0) {
            return res.status(200).json([]);
        }
        const formatComment = (comment) => {
            return {
                id: comment._id,
                content: comment.content,
                author: {
                    username: comment.author.username,
                    avatar: comment.author.avatar
                },
                createdAt: getTimeDifference(comment.createdAt)
            }
        }

        const formattedComments = comments.map(formatComment);

        return res.status(200).json(formattedComments);
    } catch (error) {
        console.error("Error loading post comments", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    addPostComment,
    getPostComments
}

