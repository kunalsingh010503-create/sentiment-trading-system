import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Portfolio } from "../entities/Portfolio";
import { User } from "../entities/User";
// 1. Import the MarketService so we can get live prices
import { MarketService } from "../services/MarketService";

export class PortfolioController {

    /**
     * FEATURE: Create a new portfolio
     */
    static async createPortfolio(req: Request, res: Response) {
        try {
            const { userId, name, initialCapital } = req.body;

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const portfolio = new Portfolio();
            portfolio.user = user;
            portfolio.name = name;
            portfolio.initialCapital = initialCapital;
            portfolio.currentCash = initialCapital;
            portfolio.currentPortfolioValue = initialCapital;
            
            const portfolioRepository = AppDataSource.getRepository(Portfolio);
            await portfolioRepository.save(portfolio);

            return res.status(201).json({ message: "Portfolio created!", portfolio });

        } catch (error: any) {
            console.error("Error creating portfolio:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    /**
     * FEATURE: Get Portfolio Details & Holdings
     * NOW UPDATED: Recalculates 'Total Value' based on LIVE Finnhub prices.
     */
    static async getPortfolio(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const portfolioRepo = AppDataSource.getRepository(Portfolio);
            
            // 1. Fetch Portfolio + Holdings
            const portfolio = await portfolioRepo.createQueryBuilder("portfolio")
                .leftJoinAndSelect("portfolio.holdings", "holdings")
                .where("portfolio.id = :id", { id })
                .getOne();

            if (!portfolio) {
                return res.status(404).json({ message: "Portfolio not found" });
            }

            // 2. ⚡️ RECALCULATION LOOP
            // We loop through holdings to calculate what they are worth RIGHT NOW.
            let currentHoldingsValue = 0;

            if (portfolio.holdings && portfolio.holdings.length > 0) {
                console.log(`🔄 Recalculating value for ${portfolio.holdings.length} holdings...`);
                
                for (const holding of portfolio.holdings) {
                    // Fetch real-time price from MarketService (Finnhub)
                    const livePrice = await MarketService.getPrice(holding.symbol);
                    
                    // Add to total: Live Price * Quantity
                    // We use Number() to ensure math works even if DB sends strings
                    const value = livePrice * Number(holding.quantity);
                    currentHoldingsValue += value;
                }
            }

            // 3. Update the Portfolio Object
            // Total Value = Cash in Hand + Current Value of Stocks
            const newTotalValue = Number(portfolio.currentCash) + currentHoldingsValue;
            
            // Only save if the value has actually changed (prevents unnecessary DB writes)
            if (Math.abs(Number(portfolio.currentPortfolioValue) - newTotalValue) > 0.01) {
                portfolio.currentPortfolioValue = newTotalValue;
                await portfolioRepo.save(portfolio);
                console.log(`✅ Portfolio Value Updated: $${newTotalValue.toFixed(2)}`);
            }

            // Diagnostic log
            console.log(`✅ Fetched Portfolio: ${portfolio.name}`);
            console.log(`📦 Holdings found: ${portfolio.holdings?.length || 0}`);

            return res.json(portfolio);

        } catch (error: any) {
            console.error("GET_PORTFOLIO_ERROR:", error.message);

            // FALLBACK: Returns basic data if the calculation fails
            try {
                const basicPortfolio = await AppDataSource.getRepository(Portfolio).findOneBy({ id: req.params.id });
                if (basicPortfolio) {
                    return res.json({ ...basicPortfolio, holdings: [] });
                }
            } catch (fallbackError) {
                return res.status(500).json({ message: "Database connection failed" });
            }

            return res.status(500).json({ message: "Error fetching portfolio", error: error.message });
        }
    }
}