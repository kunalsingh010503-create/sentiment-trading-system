import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import tradeRoutes from "./routes/tradeRoutes";

// 👇 FIX: Import from './config/database' instead of './data-source'
import { AppDataSource } from "./config/database"; 

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/trades", tradeRoutes);

const PORT = 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:3000`);
    });
  })
  // 👇 FIX: Added ': any' to stop TypeScript from complaining
  .catch((error: any) => console.log(error));