const Post = require("../models/Post");
const Category = require("../models/Category");
const { uploadImageFile } = require("../cloudFly.config/objectStorage");

// Common post transformation logic
const transformPost = (post) => ({
  id: post._id,
  userId: post.user_id._id,
  username: post.user_id.username,
  avatar: post.user_id.avatar,
  content: post.content,
  category: post.category,
  privacy: post.privacy,
  medias: post.medias.map(media => ({ url: media.url }))
});

// Controller functions
const createPost = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { content, category, privacy, user_id } = req.body;
    const medias = req.files || [];


    // Daily post limit check
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const postCount = await Post.countDocuments({
      user_id,
      createdAt: { $gte: startOfToday }
    });

    if (postCount >= 10) return res.status(403).json({
      message: "Daily post limit reached (10 posts)"
    });

    // Category validation
    const categoryExists = await Category.exists({ name: category });
    if (!categoryExists) return res.status(400).json({
      message: "Invalid category"
    });

    // Handle image uploads if present
    let mediaUrls = [];
    if (medias && medias.length > 0) {
      // Upload images to CloudFly
      const uploadPromises = medias.map((file, index) =>
        uploadImageFile(
          file,
          `post-${Date.now()}-${index}`,
          "post-image"
        )
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Check for failed uploads
      const failedUploads = uploadResults.filter(r => r.status !== 200);
      if (failedUploads.length > 0) {
        return res.status(500).json({
          message: "Some images failed to upload",
          errors: failedUploads
        });
      }

      // Extract successful URLs
      mediaUrls = uploadResults.map(result => ({
        type: "Image",
        url: result.url
      }));
    }

    // Create post
    const newPost = await Post.create({
      content,
      category,
      privacy: privacy === "public" ? "public" : "private",
      user_id,
      medias: mediaUrls
    });

    res.status(201).json({
      status: "success",
      data: transformPost(newPost)
    });

  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getPublicPosts = async (req, res) => {
  try {
    const posts = await Post.find({ privacy: "public" })
      .populate("category", "name")
      .populate("user_id", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: posts.map(transformPost)
    });
  } catch (error) {
    console.error("Get public posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfilePosts = async (req, res) => {
  try {
    const { userId, currentUserId } = req.params;
    console.log("🔍 Request userId:", userId);
    console.log("🔑 Current userId:", currentUserId);

    const query = {
      user_id: userId,
      ...(userId !== currentUserId && { privacy: "public" })
    };

    const posts = await Post.find(query)
      .populate("category", "name")
      .populate("user_id", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: posts.map(transformPost)
    });
  } catch (error) {
    console.error("Get profile posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updates = {
      ...req.body,
      ...(req.files && {
        medias: req.files.map(file => ({
          type: "Image",
          url: `/uploads/${file.filename}`
        }))
      })
    };

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.status(200).json({
      status: "success",
      data: updatedPost
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.deleteOne();
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPost,
  getPublicPosts,
  getProfilePosts,
  updatePost,
  deletePost
};