import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Trade } from "../entities/Trade";
import { Portfolio } from "../entities/Portfolio";
import { Holding } from "../entities/Holding";
import { MarketService } from "../services/MarketService";

export class TradeController {

    static async executeTrade(req: Request, res: Response) {
        try {
            const { portfolioId, symbol, quantity, type } = req.body; 

            const portfolioRepo = AppDataSource.getRepository(Portfolio);
            const portfolio = await portfolioRepo.findOneBy({ id: portfolioId });

            if (!portfolio) {
                return res.status(404).json({ message: "Portfolio not found" });
            }

            // 1. Fetch Price & Calculate Costs
            const currentPrice = await MarketService.getPrice(symbol);
            const totalCost = currentPrice * Number(quantity);

            // 2. Fund Check (for BUY)
            if (type === 'BUY') {
                if (Number(portfolio.currentCash) < totalCost) {
                    return res.status(400).json({ message: "Insufficient funds!" });
                }
                portfolio.currentCash = Number(portfolio.currentCash) - totalCost;
            }

            // 3. Setup Trade Record
            const tradeRepo = AppDataSource.getRepository(Trade);
            const trade = new Trade();
            trade.portfolio = portfolio;
            trade.symbol = symbol.toUpperCase();
            trade.quantity = Number(quantity);
            trade.priceAtTrade = currentPrice;
            trade.action = type;
            
            // 4. 🔥 UPDATE HOLDINGS (TYPE-SAFE UPSERT)
            const holdingRepo = AppDataSource.getRepository(Holding);
            
            // Search for existing holding
            const existingHolding = await holdingRepo.findOneBy({ 
                portfolio: { id: portfolioId }, 
                symbol: symbol.toUpperCase() 
            });

            let finalHolding: Holding; // This ensures we always have a valid 'Holding' type

            if (type === 'BUY') {
                if (existingHolding) {
                    // Update existing holding values
                    const oldQty = Number(existingHolding.quantity);
                    const oldAvg = Number(existingHolding.averagePrice);
                    const newQty = oldQty + Number(quantity);
                    
                    existingHolding.quantity = newQty;
                    existingHolding.averagePrice = ((oldAvg * oldQty) + totalCost) / newQty;
                    
                    finalHolding = await holdingRepo.save(existingHolding);
                } else {
                    // Create a brand new holding
                    const newHolding = new Holding();
                    newHolding.symbol = symbol.toUpperCase();
                    newHolding.quantity = Number(quantity);
                    newHolding.averagePrice = currentPrice;
                    newHolding.portfolio = portfolio;
                    
                    finalHolding = await holdingRepo.save(newHolding);
                }
                console.log(`✅ Holding updated for ${finalHolding.symbol}`);
            }

            // 5. Final Save for Portfolio and Trade
            await tradeRepo.save(trade);
            await portfolioRepo.save(portfolio);

            return res.status(201).json({ 
                message: `Trade Executed: ${type} ${quantity} ${symbol}`, 
                cashRemaining: portfolio.currentCash 
            });

        } catch (error: any) {
            console.error("Trade failed:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}