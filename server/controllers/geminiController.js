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
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Vui lòng nhập tin nhắn" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        res.json({
            response: response.text()
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({
            error: "Có lỗi xảy ra khi xử lý yêu cầu"
        });
    }
};

