import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Portfolio } from "./Portfolio";

@Entity("holdings")
export class Holding {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    symbol!: string;

    @Column("decimal", { precision: 12, scale: 2, default: 0 })
    quantity!: number;

    @Column("decimal", { precision: 12, scale: 2, default: 0 })
    averagePrice!: number;

    // --- NEW COLUMN FOR PROJECT 87 ---
    // Stores the AI Sentiment Score (-1.0 to +1.0)
    // nullable: true because new stocks won't have a score immediately
    @Column("float", { nullable: true })
    sentimentScore?: number;

    // This links the holding to a specific portfolio
    @ManyToOne(() => Portfolio, (portfolio) => portfolio.holdings)
    portfolio!: Portfolio;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}