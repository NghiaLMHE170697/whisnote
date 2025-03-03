const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (phone, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP code is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });
        console.log("✅ OTP sent successfully:", message.sid);
        return true;
    } catch (error) {
        console.error("❌ Twilio Error:", error);
        return false;
    }
};

module.exports = { sendOTP };
