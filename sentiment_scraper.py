import requests
from textblob import TextBlob
import psycopg2
import sys

# --- CONFIGURATION ---
DB_CONFIG = {
    "dbname": "sentiment_trading",
    "user": "postgres",
    "password": "password",
    "host": "localhost"
}

# Your NewsAPI Key
NEWS_API_KEY = "5b3c304d692b4f4d897cbfea1b6de1cf" 

def get_portfolio_stocks():
    """Fetch all unique symbols from the holdings table."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT symbol FROM holdings")
        stocks = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return stocks
    except Exception as e:
        print(f"❌ Database Error (Read): {e}")
        return []

def get_sentiment(symbol):
    """Fetch headlines and calculate average polarity & subjectivity."""
    url = f"https://newsapi.org/v2/everything?q={symbol}&language=en&pageSize=5&apiKey={NEWS_API_KEY}"
    
    try:
        response = requests.get(url).json()
        articles = response.get('articles', [])
        
        if not articles:
            print(f"⚠️ No news found for {symbol}")
            return 0.0, 0.0

        p_scores = [] # Polarity
        s_scores = [] # Subjectivity
        
        print(f"\n--- 📰 Analysis for {symbol} ---")
        for art in articles:
            analysis = TextBlob(art['title'])
            p = analysis.sentiment.polarity
            s = analysis.sentiment.subjectivity
            p_scores.append(p)
            s_scores.append(s)
            # Optional: Print each headline's score
            # print(f"   [{p:+.2f}] {art['title'][:60]}...")
        
        avg_p = sum(p_scores) / len(p_scores)
        avg_s = sum(s_scores) / len(s_scores)
        return avg_p, avg_s

    except Exception as e:
        print(f"❌ API Error: {e}")
        return 0.0, 0.0

def update_db_sentiment(symbol, score):
    """Write the new score into the 'sentimentScore' column."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # NOTE: We use "sentimentScore" (quotes) to match the CamelCase column in Postgres
        sql = 'UPDATE holdings SET "sentimentScore" = %s WHERE symbol = %s'
        cur.execute(sql, (score, symbol))
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"💾 Saved score {score:+.2f} for {symbol} to Database.")
    except Exception as e:
        print(f"❌ Database Error (Write): {e}")
        # Hint for debugging
        if 'column "sentimentScore" does not exist' in str(e):
            print("💡 TIP: Did you restart your backend? The new column might not exist yet.")

if __name__ == "__main__":
    print("🚀 Starting AI Sentiment Engine...")
    
    # 1. Get Stocks
    owned_stocks = get_portfolio_stocks()
    
    if not owned_stocks:
        print("📭 No stocks found in portfolio.")
    else:
        # 2. Analyze & Save
        for stock in owned_stocks:
            avg_p, avg_s = get_sentiment(stock)
            
            # Save the POLARITY score (the happy/sad signal)
            update_db_sentiment(stock, avg_p)
            
            # Print Summary
            if avg_p > 0.05:
                signal = "BULLISH 🚀"
            elif avg_p < -0.05:
                signal = "BEARISH 📉"
            else:
                signal = "NEUTRAL 😐"
                
            print(f"✅ Finished {stock}: {signal} (Pol: {avg_p:+.2f} | Subj: {avg_s:.2f})")
            
    print("\n🏁 Update Complete.")