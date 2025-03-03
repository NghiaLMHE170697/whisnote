const User = require("../models/User.js");
const JwtProvider = require("../provider/JwtProvider");
const bcrypt = require('bcrypt');


// 📌 Đăng ký với số điện thoại & Gửi OTP
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Vui lòng nhập tên người dùng, email và mật khẩu."
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email đã được sử dụng." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({
      message: "Đăng ký thành công!",
      userId: newUser._id,
      username: newUser.username
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Xác nhận OTP & Hoàn tất đăng ký
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Vui lòng nhập số điện thoại và OTP." });
    }

    const otpData = req.app.locals.otpStorage?.[phone];

    // Kiểm tra OTP hợp lệ
    if (!otpData || otpData.otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Mã OTP không hợp lệ hoặc đã hết hạn." });
    }

    // Tạo user mới với username
    const newUser = new User({
      username: otpData.username,
      phone,
      password: otpData.password
    });
    await newUser.save();

    // Xóa OTP sau khi xác nhận
    delete req.app.locals.otpStorage[phone];

    res.status(201).json({
      message: "Đăng ký thành công!",
      userId: newUser._id,
      username: newUser.username
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔐 Đăng nhập với email & mật khẩu
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập số điện thoại và mật khẩu." });
    }

    const user = await User.findOne({ email });
    // Kiểm tra user tồn tại
    if (!user) {
      return res.status(401).json({ error: "Sai email hoặc mật khẩu." }); // Đã sửa thông báo
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Sai email hoặc mật khẩu." });
    }

    // Tạo access token
    const token = await JwtProvider.generateToken(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      "24h"
    );

    res.json({
      message: "Đăng nhập thành công!",
      token,
      userId: user._id,
      username: user.username,
      avatar: user.avatar
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};


// 👤 Xem thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    console.log("🔍 Request params:", req.params);
    console.log("🔑 User từ token:", req.userId);

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized: Không có thông tin user từ token." });
    }

    // Nếu `/users/me`, lấy userId từ token
    const userId = req.params.id === "me" ? req.userId : req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "Không tìm thấy userId hợp lệ." });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    res.json({ status: "success", data: user });
  } catch (error) {
    console.error("🚨 Lỗi khi lấy thông tin người dùng:", error);
    res.status(500).json({ error: "Lỗi server khi lấy thông tin người dùng." });
  }
};




// ➕ Theo dõi người dùng
exports.followUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);
    if (!user || !targetUser) return res.status(404).json({ error: "Người dùng không tồn tại" });

    await user.follow(targetUser._id);
    await targetUser.followers.push(user._id);
    await targetUser.save();

    res.json({ message: `Bạn đã theo dõi ${targetUser.username}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➖ Bỏ theo dõi người dùng
exports.unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);
    if (!user || !targetUser) return res.status(404).json({ error: "Người dùng không tồn tại" });

    await user.unfollow(targetUser._id);
    await targetUser.followers.pull(user._id);
    await targetUser.save();

    res.json({ message: `Bạn đã bỏ theo dõi ${targetUser.username}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
