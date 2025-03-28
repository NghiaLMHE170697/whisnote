const Post = require("../models/Post");
const Category = require("../models/Category");
const { uploadImageFile } = require("../cloudFly.config/objectStorage");
const { getTimeDifference, getVietNamDateFormat } = require("../middleware/general.middleware");
const { Readable } = require("stream");
const FormData = require("form-data");
const { default: axios } = require("axios");

// Common post transformation logic
const transformPost = (post, userId) => ({
  id: post._id,
  userId: post.user_id._id,
  username: post.user_id.username,
  avatar: post.user_id.avatar,
  content: post.content,
  category: post.category,
  privacy: post.privacy,
  medias: post.medias.map(media => ({ url: media.url })),
  likesCount: post.likesCount,
  likers: post.likes,
  liked: userId ? post.likes.includes(userId) : false,
  createdAt: getVietNamDateFormat(post.createdAt),
});

// Controller functions
const createPost = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { content, category, privacy, user_id, role } = req.body;
    const medias = req.files || [];

    if (role !== 'premium') {
      // Daily post limit check
      const now = new Date();
      const startOfDay = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate()
        )
      );
      const postCount = await Post.countDocuments({
        user_id,
        createdAt: { $gte: startOfDay }
      });

      if (postCount >= 2) return res.status(429).json({
        message: "Bạn đã đạt số lượng bài đăng tối đa (2 bài) cho người dùng miễn phí. Vui lòng thử lại vào ngày mai"
      });

      // Add these checks before processing the post
      const MAX_WORDS = 100;
      const MAX_CHARS = 600; // Adjust based on your needs

      // Trim and count
      const trimmedContent = content.trim();
      const wordCount = trimmedContent.split(/\s+/).length;
      const charCount = trimmedContent.length;

      // Combined validation
      if (wordCount > MAX_WORDS || charCount > MAX_CHARS) {
        return res.status(400).json({
          message: `Bài đăng vượt quá giới hạn: tối đa ${MAX_WORDS} từ hoặc ${MAX_CHARS} ký tự`
        });
      }
    }

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
    const { userId } = req.params;
    const posts = await Post.find({ privacy: "public" })
      .populate("category", "name")
      .populate("user_id", "username avatar")
      .sort({ createdAt: -1 });



    res.status(200).json({
      status: "success",
      data: posts.map(m => transformPost(m, userId))
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
      data: posts.map(m => transformPost(m, currentUserId))
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

const updateLikePost = async (req, res) => {
  try {
    const { userId } = req.body;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    } else {
      const alreadyLiked = post.likes.includes(userId);
      let updateLikePost;
      if (alreadyLiked) {
        updateLikePost = await Post.findByIdAndUpdate(
          postId,
          {
            $pull: { likes: userId },
            $inc: { likesCount: -1 }
          },
          { new: true }
        )
        return res.status(200).json({
          status: 200,
          message: "Unlike post successfully",
          likesCount: updateLikePost.likesCount,
          liked: false
        })
      } else if (!alreadyLiked) {
        updateLikePost = await Post.findByIdAndUpdate(
          postId,
          {
            $push: { likes: userId },
            $inc: { likesCount: 1 }
          },
          { new: true }
        )
        return res.status(200).json({
          status: 200,
          message: "Like post successfully",
          likesCount: updateLikePost.likesCount,
          liked: true
        })
      }
    }

  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const { postId, userId } = req.params
    const post = await Post.findById(postId)
      .populate("category", "name")
      .populate("user_id", "username avatar");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      status: "success",
      data: transformPost(post, userId)
    });
  } catch (error) {
    console.error("Get post by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

const getTextfromAudio = async (req, res) => {
  try {
    const { body, file } = req;
    console.log("👉 Received body:", body);
    console.log("👉 Received files:", file);
    if (file.mimetype.startsWith("audio/")) {
      const audioStream = Readable.from(file.buffer);
      const form = new FormData();
      form.append("file", audioStream, {
        filename: file.originalname,
        contentType: file.mimetype
      });
      form.append("model", "whisper-1");

      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      )

      res.status(200).json({ text: response.data.text });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

// Tìm kiếm bài đăng public
const searchPublicPosts = async (req, res) => {
  try {
    const { query } = req.query;
    const { userId } = req.params
    if (!query) {
      return res.status(400).json({
        message: "Vui lòng nhập từ khóa tìm kiếm"
      });
    }

    // Tìm kiếm chỉ bài public
    const posts = await Post.find({
      content: { $regex: query, $options: 'i' },
      privacy: "public"  // Chỉ lấy bài public
    })
      .populate("user_id", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: posts.map(m => transformPost(m, userId))
    });
  } catch (error) {
    console.error("Search public posts error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Filter bài đăng public theo category
const getPublicPostsByCategory = async (req, res) => {
  try {
    const { category, userId } = req.params;

    // Tìm kiếm category
    const categoryExists = await Category.findOne({ name: category });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category không tồn tại"
      });
    }

    // Lấy bài đăng public theo category
    const posts = await Post.find({
      category: categoryExists.name,
      privacy: "public"
    })
      .populate("user_id", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: posts.map(m => transformPost(m, userId))
    });
  } catch (error) {
    console.error("Get public posts by category error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getPublicPosts,
  getProfilePosts,
  updatePost,
  deletePost,
  updateLikePost,
  getPostById,
  getTextfromAudio,
  searchPublicPosts,
  getPublicPostsByCategory,
};