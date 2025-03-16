const User = require("../models/User.js");
const { uploadImageFile } = require("../cloudFly.config/objectStorage");
const JwtProvider = require("../provider/JwtProvider");
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");

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
      avatar: user.avatar,
      role: user.role
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};


// 👤 Xem thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🔍 Request params:", req.params);

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

exports.upgradePlan = async (req, res) => {
  try {
    const { userId, plan } = req.body;

    // Validate input
    if (!userId || !plan) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: 'Định dạng ID người dùng không hợp lệ'
      });
    }

    // Extract duration from Vietnamese plan title
    const durationMatch = plan.match(/Gói (\d+) (Tháng|Năm)/i);

    if (!durationMatch) {
      return res.status(400).json({ error: 'Định dạng gói không hợp lệ' });
    }

    const amount = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();

    // Calculate premium expiry date (original logic)
    const currentDate = new Date();
    let expiryDate = new Date(currentDate);

    if (unit === 'tháng') {
      // Month-based plans
      switch (amount) {
        case 1:
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          break;
        case 6:
          expiryDate.setMonth(expiryDate.getMonth() + 6);
          break;
        default:
          expiryDate.setMonth(expiryDate.getMonth() + amount);
      }
    } else if (unit === 'năm') {
      // Year-based plans
      switch (amount) {
        case 1:
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          break;
        default:
          expiryDate.setFullYear(expiryDate.getFullYear() + amount);
      }
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          role: 'premium',
          premium_expiry: expiryDate
        }
      },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Plan upgraded successfully',
      premium_expiry: expiryDate.toISOString(),
      user: {
        id: updatedUser._id,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, phone, facebook, twitter, tiktok } = req.body;
    const avatarFile = req.file;

    if (!userId) {
      return res.status(400).json({ message: 'Không tìm thấy người dùng' });
    }

    if (!username) {
      return res.status(400).json({ message: 'Username không được bỏ trống' });
    }
    if (phone && !/^\+?\d{10,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Sai định dạng số điện thoại' });
    }

    const social = {
      facebook: facebook || '',
      twitter: twitter || '',
      tiktok: tiktok || ''
    };

    // Validate social URLs
    if (social.facebook) {
      const fbRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]{5,}\/?$/i;
      if (!fbRegex.test(social.facebook)) {
        return res.status(400).json({ message: 'Sai định dạng Facebook' });
      }
    }

    if (social.twitter) {
      const twRegex = /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/[a-zA-Z0-9_]{1,15}\/?$/i;
      if (!twRegex.test(social.twitter)) {
        return res.status(400).json({ message: 'Sai định dạng Twitter' });
      }
    }

    if (social.tiktok) {
      const ttRegex = /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]{2,24}\/?$/i;
      if (!ttRegex.test(social.tiktok)) {
        return res.status(400).json({ message: 'Sai định dạng TikTok' });
      }
    }

    let avatarUrl = null;
    if (avatarFile) {
      // Upload to CloudFly (similar to post images)
      const uploadResult = await uploadImageFile(
        avatarFile,
        `avatar-${Date.now()}-${userId}`,
        "user-image"
      );

      if (uploadResult.status !== 200) {
        return res.status(500).json({
          message: "Avatar upload failed",
          error: uploadResult.error
        });
      }

      avatarUrl = uploadResult.url;
    }

    // Prepare update data
    const updateData = {
      username,
      phone: phone || null,
      social: {
        facebook: facebook || '',
        twitter: twitter || '',
        tiktok: tiktok || ''
      },
      ...(avatarUrl && { avatar: avatarUrl })
    };

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Cật nhật hồ sơ thành công',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}



