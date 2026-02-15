import React, { useState } from "react";
import "./Login.css";
import { Navigate, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate =useNavigate ();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false; } // Simple email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { setError("Invalid email format");
      return false;
    }
    return true;
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  // Save logged-in user
  localStorage.setItem(
    "user",
    JSON.stringify({
      email,
      role
    })
  );

  // Role-based redirection
  if (role === "volunteer") {
    navigate("/profile-volunteer");
  } else if (role === "ngo") {
    navigate("/profile-ngo");
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
          <option value="volunteer">Volunteer</option>
          <option value="ngo">NGO</option>
        </select>

        <button type="submit" className="login-btn" >Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p className="register-link">
        Don’t have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;
