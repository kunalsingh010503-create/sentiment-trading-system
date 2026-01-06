import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {

    // REGISTER: Create user with encrypted password
    static async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;
            const userRepo = AppDataSource.getRepository(User);

            // 1. Check if user exists
            const existingUser = await userRepo.findOne({ where: [{ email }, { username }] });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            // 2. Encrypt password (Hash it 10 times)
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. Save User
            const user = new User();
            user.username = username;
            user.email = email;
            user.passwordHash = hashedPassword; // Save the HASH, not the plain password
            
            await userRepo.save(user);

            return res.status(201).json({ message: "User registered successfully!" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Registration failed" });
        }
    }

    // LOGIN: Check password and return a Token
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const userRepo = AppDataSource.getRepository(User);

            // 1. Find User
            const user = await userRepo.findOneBy({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            // 2. Compare Password (Input vs Hash)
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            // 3. Generate Token (The "ID Card")
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                "SUPER_SECRET_KEY", // In a real app, this goes in .env
                { expiresIn: "1h" }
            );

            return res.json({ message: "Login successful", token, user });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Login failed" });
        }
    }
}