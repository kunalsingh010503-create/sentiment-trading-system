# Project 87: AI-Driven Sentiment Trading System

A full-stack financial trading platform that executes trades based on real-time news sentiment analysis. This system integrates live market data, Natural Language Processing (NLP), and a persistence layer to automate "Bullish" or "Bearish" trading signals.

## Architecture
* **Frontend:** React (TypeScript) - Real-time dashboard with "Bullish/Bearish" signal badges.
* **Backend:** Node.js (Express) - REST API handling portfolio logic and trade execution.
* **AI Engine:** Python + TextBlob - Scrapes news headlines and calculates Polarity/Subjectivity scores.
* **Database:** PostgreSQL - Stores user portfolios, holdings, and historical sentiment data.
* **Market Data:** Finnhub API (Real-time pricing).

## Key Features
* **Live Valuation:** Portfolio updates dynamically based on real-time stock prices (Mark-to-Market).
* **Sentiment Analysis:** Python script analyzes news headlines to assign a sentiment score (-1.0 to +1.0) to holdings.
* **Visual Signals:** Dashboard automatically flags stocks as **BULLISH 🚀** or **BEARISH 📉** based on AI scores.
* **Persistence:** All trades and sentiment scores are ACID-compliant and stored in Postgres.

## How it Works
1.  **Market Data:** The Node.js backend pulls live prices from Finnhub to value the portfolio.
2.  **Analysis:** The Python script runs, scrapes news for held stocks (e.g., TSLA), and calculates a sentiment score.
3.  **Storage:** The score is written to the `holdings` table in the database.
4.  **Display:** The React frontend reads the new score and updates the UI with the appropriate signal badge.
