import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Portfolio } from "./Portfolio";

@Entity()
export class Trade {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // Link trade to a specific portfolio
    @ManyToOne(() => Portfolio, (portfolio) => portfolio.trades)
    portfolio: Portfolio;

    @Column()
    symbol: string; // e.g., "AAPL"

    @Column("int")
    quantity: number; // e.g., 10

    @Column("decimal")
    priceAtTrade: number; // e.g., 150.00

    @Column()
    action: string; // "BUY" or "SELL"

    @CreateDateColumn()
    createdAt: Date;
}