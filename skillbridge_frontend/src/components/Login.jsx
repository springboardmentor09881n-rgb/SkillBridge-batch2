import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Volunteer");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    } // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:8000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          role
        })
      });

      const data = await response.json();

      if (response.ok) {
        // use context login
        login(data);

        // Role-based redirection
        if (data.role === "Volunteer") {
          navigate("/volunteer-dashboard");
        } else if (data.role === "NGO") {
          navigate("/ngo-dashboard");
        }
      } else {
        setError(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to the server. Please try again.");
    }
  };


  return (
    <div className="login-page-wrapper">
      <div className="login-card glass-card">
        <div className="login-header">
          <h1 className="brand-logo" style={{ fontSize: "28px", marginBottom: "8px", justifyContent: "center" }}>SkillBridge</h1>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 4px" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Sign in to continue your impact journey</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>I am a</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="filter-select" style={{ width: "100%" }}>
              <option value="Volunteer">Volunteer</option>
              <option value="NGO">NGO / Organization</option>
            </select>
          </div>

          {error && <p className="error-message" style={{ color: "#dc2626", fontSize: "13px", fontWeight: "500", margin: "4px 0" }}>{error}</p>}

          <button type="submit" className="action-btn-primary" style={{ width: "100%", marginTop: "10px" }}>
            Login to Account
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            Don’t have an account? <Link to="/register" style={{ color: "var(--color-volunteer)", fontWeight: "600" }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
