require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Khởi tạo Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Thay đổi system prompt để tập trung vào viết nhật ký
const systemPrompt = `
Bạn là trợ lý AI chuyên về viết nhật ký. Bạn giúp người dùng:
- Tạo mẫu nhật ký hàng ngày
- Đưa ra gợi ý về cách viết nhật ký hiệu quả
- Cung cấp các chủ đề và câu hỏi gợi mở để viết nhật ký
- Hướng dẫn cách tổ chức và duy trì thói quen viết nhật ký

Hãy trả lời thân thiện, ngắn gọn và hữu ích. Luôn cung cấp câu trả lời súc tích, không quá 3-4 câu trừ khi cần thiết.

Lưu ý đặc biệt:
- Khi người dùng hỏi về cách bắt đầu viết nhật ký, hãy gợi ý họ bắt đầu với những câu hỏi đơn giản như "Hôm nay tôi cảm thấy thế nào?" hoặc "Điều gì đã làm tôi vui/buồn nhất hôm nay?"
- Khi người dùng cần mẫu nhật ký, hãy cung cấp một mẫu ngắn gọn phù hợp với nhu cầu của họ.
`;

// Hàm xử lý chat với Gemini
exports.getGeminiResponse = async (req, res) => {
    try {
        // Set security headers
        res.set({
            'Content-Security-Policy': "default-src 'self'",
            'X-Content-Type-Options': 'nosniff',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        });

        const { message } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: "Invalid input format"
            });
        }

        if (message.length > 500) {
            return res.status(413).json({
                error: "Message exceeds maximum length of 500 characters"
            });
        }

        // Sanitize input
        const sanitizedMessage = message.replace(/[<>]/g, '');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [{
                role: "user",
                parts: [{ text: systemPrompt }],
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        const result = await chat.sendMessage(sanitizedMessage);
        const response = await result.response;

        // Set cache headers
        res.set('Cache-Control', 'no-store, max-age=0');

        res.json({
            response: response.text()
        });

    } catch (error) {
        console.error("Gemini API Error:", error);

        // Handle specific Gemini API errors
        let statusCode = 500;
        let errorMessage = "Có lỗi xảy ra khi xử lý yêu cầu";

        if (error.message.includes('Quota exceeded')) {
            statusCode = 429;
            errorMessage = "API quota exceeded";
        } else if (error.message.includes('Invalid API key')) {
            statusCode = 401;
            errorMessage = "Invalid API configuration";
        } else if (error.message.includes('Safety setting')) {
            statusCode = 400;
            errorMessage = "Content violates safety standards";
        }

        res.status(statusCode).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

