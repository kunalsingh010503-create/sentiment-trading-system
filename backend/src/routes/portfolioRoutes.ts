import { Router } from "express";
import { PortfolioController } from "../controllers/PortfolioController";

const router = Router();

// Route to create a new portfolio
router.post("/create", PortfolioController.createPortfolio);

// 👇 ADD THIS LINE: Route to get a specific portfolio's details
router.get("/:id", PortfolioController.getPortfolio); 

export default router;