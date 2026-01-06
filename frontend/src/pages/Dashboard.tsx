import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [symbol, setSymbol] = useState("TSLA");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Make sure this matches your actual Portfolio ID from the URL/Database
  const PORTFOLIO_ID = "a83794c0-5a7b-4391-9f8b-322110b93e88"; 

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/portfolios/${PORTFOLIO_ID}`);
      setPortfolio(res.data);
    } catch (err) {
      console.error("Failed to fetch portfolio", err);
    }
  };

  const handleTrade = async () => {
    setMessage("Executing trade...");
    try {
      await axios.post("http://localhost:3000/api/trades/execute", {
        portfolioId: PORTFOLIO_ID,
        symbol: symbol.toUpperCase(),
        quantity: Number(quantity),
        type: "BUY"
      });
      setMessage(`Success! Bought ${quantity} ${symbol}`);
      fetchPortfolio(); 
    } catch (err: any) {
      setMessage("Trade Failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (!portfolio) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading your Millions... 💰</h2>;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "auto", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ color: "#333", margin: 0 }}>📊 {portfolio.name}</h1>
          <button onClick={() => navigate("/")} style={{ padding: "10px 20px", background: "#ff4d4d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
        </div>

        {/* --- STAT CARDS --- */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
          <div style={{ padding: "20px", background: "#e8f5e9", borderRadius: "10px", border: "1px solid #c8e6c9" }}>
            <h3 style={{ margin: 0, color: "#2e7d32", fontSize: "14px", textTransform: "uppercase" }}>Cash Available</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold", margin: "10px 0 0 0", color: "#1b5e20" }}>
              ${Number(portfolio.currentCash).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div style={{ padding: "20px", background: "#e3f2fd", borderRadius: "10px", border: "1px solid #bbdefb" }}>
            <h3 style={{ margin: 0, color: "#1565c0", fontSize: "14px", textTransform: "uppercase" }}>Total Value</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold", margin: "10px 0 0 0", color: "#0d47a1" }}>
              ${Number(portfolio.currentPortfolioValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* --- HOLDINGS TABLE --- */}
        <h3 style={{ borderBottom: "2px solid #333", paddingBottom: "10px", color: "#333" }}>Current Holdings</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
          <thead>
            <tr style={{ textAlign: "left", backgroundColor: "#f8f9fa" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "#495057" }}>Symbol</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "#495057" }}>Shares</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "#495057" }}>Avg Price</th>
              {/* ✅ NEW COLUMN ADDED HERE */}
              <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "#495057" }}>AI Signal</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings && portfolio.holdings.length > 0 ? (
              portfolio.holdings.map((h: any) => (
                <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#000" }}>{h.symbol}</td>
                  <td style={{ padding: "12px", color: "#333" }}>{Number(h.quantity)}</td>
                  <td style={{ padding: "12px", color: "#333" }}>
                    ${Number(h.averagePrice).toFixed(2)}
                  </td>
                  
                  {/* ✅ NEW BADGE LOGIC ADDED HERE */}
                  <td style={{ padding: "12px" }}>
                    {h.sentimentScore !== undefined && h.sentimentScore !== null ? (
                      <span style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        // Logic: Green if > 0.05, Red if < -0.05, Grey if Neutral
                        backgroundColor: h.sentimentScore > 0.05 ? "#e8f5e9" : (h.sentimentScore < -0.05 ? "#ffebee" : "#f1f3f5"),
                        color: h.sentimentScore > 0.05 ? "#2e7d32" : (h.sentimentScore < -0.05 ? "#c62828" : "#495057")
                      }}>
                        {h.sentimentScore > 0.05 ? "BULLISH 🚀" : (h.sentimentScore < -0.05 ? "BEARISH 📉" : "NEUTRAL 😐")}
                        {" "}({Number(h.sentimentScore).toFixed(2)})
                      </span>
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px", fontStyle: "italic" }}>
                        Waiting for AI...
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: "30px", color: "#888", textAlign: "center", fontSize: "16px" }}>
                  No stocks owned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* --- QUICK TRADE --- */}
        <div style={{ background: "#f8f9fa", padding: "25px", borderRadius: "10px", border: "1px solid #eee" }}>
          <h3 style={{ marginTop: 0 }}>🚀 Quick Trade</h3>
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "5px", color: "#666" }}>Ticker</label>
              <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ width: "100px" }}>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "5px", color: "#666" }}>Amount</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button onClick={handleTrade} style={{ padding: "12px 30px", background: "#000", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", border: "none" }}>Execute Buy</button>
            </div>
          </div>
          {message && (
            <div style={{ marginTop: "15px", padding: "10px", borderRadius: "5px", background: message.includes("Success") ? "#e8f5e9" : "#ffebee", color: message.includes("Success") ? "#2e7d32" : "#c62828", fontSize: "14px" }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}