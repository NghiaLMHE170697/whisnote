const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const httpErrors = require("http-errors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const PayOS = require("@payos/node");
require("dotenv").config();
const db = require("./models");

// Khởi tạo Express
const app = express();
const payOS = new PayOS(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_API_KEY,
    process.env.YOUR_CHECKSUM_KEY
);
// Import Routes
const {
    userRouter,
    postRouter,
    categoryRouter,
    commentRouter,
    geminiRouter,
} = require("./routes");


// ⚡ Bảo mật tốt hơn với Helmet
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "blob:"], // Hỗ trợ ảnh từ API
                scriptSrc: ["'self'", "'unsafe-inline'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
    })
);

// 🌍 CORS - Hỗ trợ cả dev và production
app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigins = [
                process.env.CLIENT_URL,
                'https://whisnote-client.vercel.app'
            ];
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

// ⚡ Rate Limit (Hạn chế DDoS Attack)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 phút
//     max: 100, // 100 requests per 15 minutes
//     message: "Too many requests from this IP, please try again later.",
// });

// app.use(limiter);

// 🖼️ Cho phép phục vụ ảnh từ thư mục "uploads"
app.use("/uploads", express.static("uploads"));

// 🚀 Kiểm tra API
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to RESTFul API - NodeJs" });
});

// 🔗 Routing
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/categories", categoryRouter);
app.use("/comments", commentRouter);
app.use("/api/gemini", geminiRouter);
app.post("/create-payment-link", async (req, res) => {
    try {
        const { plan } = req.body;
        const YOUR_DOMAIN = process.env.CLIENT_URL || 'https://whisnote-client.vercel.app';

        const orderCode = Date.now(); // Better unique ID generation

        const paymentData = {
            orderCode: orderCode,
            amount: Number(plan.price.replace(/,/g, '')),
            description: `Thanh toán ${plan.title}`,
            items: [{
                name: plan.title,
                quantity: 1,
                price: Number(plan.price.replace(/,/g, ''))
            }],
            returnUrl: `${YOUR_DOMAIN}/pricing?success=true`,
            cancelUrl: `${YOUR_DOMAIN}/pricing?canceled=true`,
        };

        const paymentLink = await payOS.createPaymentLink(paymentData);

        // Return JSON instead of redirect
        res.json({
            success: true,
            checkoutUrl: paymentLink.checkoutUrl
        });

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi hệ thống, vui lòng thử lại sau'
        });
    }
});

// ❌ Xử lý lỗi 404 (Route không tồn tại)
app.use((req, res, next) => {
    next(httpErrors(404, "Not Found"));
});

// ❌ Xử lý lỗi chung với async
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: err.message || "Internal Server Error",
        },
    });
});

// 🚀 Khởi chạy server
const HOST = process.env.HOST_NAME || "localhost";
const PORT = process.env.PORT || 9999;

db.connectDB().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running at: http://${HOST}:${PORT}`);
    });
}).catch((err) => {
    console.error("❌ Failed to connect to database:", err);
});

module.exports = app;
