import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import userRoutes from "./routes/userRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import tradeRoutes from "./routes/tradeRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/trades", tradeRoutes); // <--- 2. Add this line

// Health Check
app.get("/", (req, res) => {
    res.json({ message: "Sentiment Trading System API is running! 🚀" });
});

// Start Server
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connected successfully!");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
    }
};

startServer();