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
    <div className="login-container">
      <h2>Sign in to SkillBridge</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Volunteer">Volunteer</option>
          <option value="NGO">NGO / Organization</option>
        </select>

        <button type="submit" className="login-btn" >Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p className="register-link">
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
