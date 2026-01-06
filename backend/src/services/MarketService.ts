import axios from "axios";

export class MarketService {
  // Your Finnhub API Key
  private static FINNHUB_KEY = "d5ebtj1r01qjckl356c0d5ebtj1r01qjckl356cg"; 
  
  // Fallback prices in case the API limit is hit or network fails
  private static FALLBACK_PRICES: Record<string, number> = {
    "TSLA": 250.00,
    "AAPL": 180.00,
    "NVDA": 450.00
  };

  /**
   * FETCH REAL PRICE
   * Connects to Finnhub to get the 'current price' (c)
   */
  static async getPrice(symbol: string): Promise<number> {
    const cleanSymbol = symbol.toUpperCase();
    
    try {
      // console.log(`Fetching live price for ${cleanSymbol}...`);
      
      const url = `https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${this.FINNHUB_KEY}`;
      const response = await axios.get(url);
      
      // Finnhub response format: { c: 250.5, d: -1.2, dp: -0.4 ... }
      const currentPrice = response.data.c;

      if (!currentPrice) {
        throw new Error("No price data returned");
      }

      return Number(currentPrice);
      
    } catch (error: any) {
      console.warn(`⚠️ API Error for ${cleanSymbol}: ${error.message}`);
      console.warn(`Using fallback price.`);
      return this.FALLBACK_PRICES[cleanSymbol] || 100.00;
    }
  }
}