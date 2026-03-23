require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { testConnection, initDatabase } = require("./config/db_config");

const initDatabaseTables = require("./database/initDB");

const app = express();

//Config cho phép frontend gọi API
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);

//Config cho phép đọc cookie từ request
app.use(cookieParser()); // middleware đọc cookie

//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static file (ảnh + pdf)

// Route
const authRoutes = require("./routes/auth.Routes");
//Use Route
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 8080;
const startServer = async () => {
    try {
        // tạo db nêu chưa có + chọn db
        await initDatabase();

        // kiểm tra kết nối database
        await testConnection();

        // tạo bảng nếu chưa có
        await initDatabaseTables();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server failed to start:", error);
    }
};

startServer();
