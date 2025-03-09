const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const httpErrors = require("http-errors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const db = require("./models");

// Khởi tạo Express
const app = express();

// Import Routes
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRouter");
const categoryRouter = require("./routes/categoryRouter");

// Middleware
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

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
        origin: process.env.CLIENT_URL || "https://whisnote-client.vercel.app",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        credentials: true,
    })
);

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
