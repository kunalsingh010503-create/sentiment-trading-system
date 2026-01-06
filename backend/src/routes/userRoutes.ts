import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

// When someone posts to /register, run the register function
router.post("/register", UserController.register);

export default router;