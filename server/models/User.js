const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, default: null },
    password: { type: String, required: true },
    username: {
      type: String,
      required: true,
      trim: true
    },
    email: { type: String, unique: true, required: true }, // Không bắt buộc
    avatar: { type: String, default: "../../../assets/images/users/user4.jpg" },
    role: { type: String, enum: ["free", "premium", "admin"], default: "free" },
    premium_expiry: { type: Date, default: null },
    post_count: { type: Number, default: 0 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🔹 Thêm OTP và trạng thái xác minh
    otp: { type: String, default: null },  // Mã OTP
    otp_expiry: { type: Date, default: null }, // Thời gian hết hạn OTP
    is_verified: { type: Boolean, default: false }, // Trạng thái xác minh
    preferences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }]
  },
  { timestamps: true }
);

// 🌟 Kiểm tra tài khoản premium
UserSchema.methods.isPremium = function () {
  return this.premium_expiry && this.premium_expiry > new Date();
};

// ➕ Thêm người theo dõi
UserSchema.methods.follow = async function (userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    await this.save();
  }
};

// ➖ Bỏ theo dõi người dùng
UserSchema.methods.unfollow = async function (userId) {
  this.following = this.following.filter((id) => id.toString() !== userId.toString());
  await this.save();
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
