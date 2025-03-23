require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
// Cấu hình transporter cho nodemailer
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',  // Hoặc service khác như 'outlook', 'yahoo', v.v.
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });
};
// Hàm gửi email nhắc nhở
const sendJournalReminder = async () => {
    try {
        const transporter = createTransporter();
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN');

        const mailOptions = {
            from: `"WhisNote" <${process.env.EMAIL}>`,
            to: process.env.RECIPIENT_EMAIL,
            subject: `WhisNote - Nhắc nhở viết nhật ký ngày ${dateStr}`,
            html: `
        <h2>WhisNote - Đã đến giờ viết nhật ký!</h2>
        <p>Xin chào,</p>
        <p>Đây là lời nhắc nhở để bạn viết nhật ký cho ngày ${dateStr}.</p>
        <p>Hãy dành vài phút để ghi lại những suy nghĩ, cảm xúc và sự kiện quan trọng trong ngày hôm nay.</p>
        <p>Chúc bạn một ngày tốt lành!</p>
        <p><em>WhisNote - Nơi lưu giữ những khoảnh khắc của bạn</em></p>
        <p>https://whisnote-client.vercel.app/</p>
      `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email nhắc nhở đã được gửi:', info.response);
        return info;
    } catch (error) {
        console.error('❌ Lỗi khi gửi email nhắc nhở:', error);
        throw error;
    }
};
// Khởi động lịch gửi email
const startReminderSchedule = () => {
    // Kiểm tra các biến môi trường cần thiết
    if (!process.env.EMAIL || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
        console.warn('⚠️ Thiếu thông tin cấu hình email trong file .env. Chức năng nhắc nhở sẽ không hoạt động.');
        return;
    }
    // Mặc định: "0 6 * * *" - 6:00 AM mỗi ngày
    const reminderTime = process.env.REMINDER_TIME || "0 6 * * *";

    try {
        cron.schedule(reminderTime, () => {
            console.log('🔔 Đang gửi lời nhắc viết nhật ký...');
            sendJournalReminder();
        });

        console.log(`📅 Lịch nhắc nhở viết nhật ký đã được thiết lập: ${reminderTime}`);
    } catch (error) {
        console.error('❌ Lỗi khi thiết lập lịch nhắc nhở:', error);
    }
};
module.exports = {
    startReminderSchedule,
    sendJournalReminder
}; 