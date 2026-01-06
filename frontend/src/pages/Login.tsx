import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // 1. Send the login request to your Backend
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      // 2. If successful, save the "ID Card" (Token)
      localStorage.setItem("token", response.data.token);
      
      // 3. Go to the Dashboard
      alert("Login Successful!");
      navigate("/dashboard");

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login to Trading System</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button type="submit" style={{ padding: "10px", background: "blue", color: "white", border: "none", cursor: "pointer" }}>
          Login
        </button>
      </form>
    </div>
  );
}