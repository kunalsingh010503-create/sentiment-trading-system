import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Portfolio } from "../entities/Portfolio";
import { Trade } from "../entities/Trade";
import { Holding } from "../entities/Holding"; // <--- 1. ADD THIS IMPORT

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "sentiment_trading",
    synchronize: true, // This will automatically create the 'holdings' table for you
    logging: false,
    entities: [User, Portfolio, Trade, Holding], // <--- 2. ADD Holding TO THIS LIST
    migrations: [],
    subscribers: [],
});