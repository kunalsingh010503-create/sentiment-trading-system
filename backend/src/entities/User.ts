import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Portfolio } from "./Portfolio"; // <--- Import this

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    passwordHash: string;

    @Column({ default: "student" })
    role: string;

    // This is the missing link!
    @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
    portfolios: Portfolio[];

    @Column({ default: 0 })
    totalXp: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}