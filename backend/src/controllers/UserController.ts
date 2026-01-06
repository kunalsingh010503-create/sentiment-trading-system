import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export class UserController {
    
    // Feature: Register a new user
    static async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            // 1. Check if user exists
            const userRepository = AppDataSource.getRepository(User);
            const existingUser = await userRepository.findOne({ 
                where: [{ email }, { username }] 
            });

            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            // 2. Create new User
            const user = new User();
            user.username = username;
            user.email = email;
            user.passwordHash = password; // In real life, we encrypt this!
            user.role = "student";

            // 3. Save to Database
            await userRepository.save(user);

            // 4. Send success message
            return res.status(201).json({ message: "User created successfully!", user });

        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}