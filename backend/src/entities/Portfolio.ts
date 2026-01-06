import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Trade } from "./Trade";
import { Holding } from "./Holding"; // <--- ADD THIS

@Entity()
export class Portfolio {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, (user) => user.portfolios)
    user: User;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column("decimal", { precision: 12, scale: 2, default: 0 })
    initialCapital: number;

    @Column("decimal", { precision: 12, scale: 2, default: 0 })
    currentCash: number;

    @Column("decimal", { precision: 12, scale: 2, default: 0 })
    currentPortfolioValue: number;
    
    @Column({ default: true })
    isActive: boolean;

    // A portfolio has many historical trades
    @OneToMany(() => Trade, (trade) => trade.portfolio)
    trades: Trade[];

    // 👇 THIS IS THE CRITICAL ADDITION
    // This allows dashboard.tsx to see your "Stock Owned" section
    @OneToMany(() => Holding, (holding) => holding.portfolio)
    holdings: Holding[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}