import { Router } from "express";
import { TradeController } from "../controllers/TradeController";

const router = Router();

router.post("/execute", TradeController.executeTrade);

export default router;  // <--- THIS LINE IS CRITICAL