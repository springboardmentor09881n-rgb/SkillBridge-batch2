import { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";




const Register = () => {
  const [role, setRole] = useState("Volunteer");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    location: "",
    skills: "",
    organizationName: "",
    organizationDescription: "",
    website: ""
  });
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      role: role,
      location: formData.location || null,
      skills: formData.skills || null,
      organization_name: formData.organizationName || null,
      organization_description: formData.organizationDescription || null,
      website_url: formData.website || null
    };

    try {
      const response = await fetch("http://localhost:8000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        alert(`Registration failed: ${data.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-card glass-card">
        <Link to="/" className="back-to-home" style={{ 
          position: "absolute", top: "24px", left: "24px", display: "flex", alignItems: "center", 
          gap: "4px", fontSize: "14px", fontWeight: "600", color: "var(--text-muted)", textDecoration: "none" 
        }}>
          <ChevronLeft size={16} /> Back to Home
        </Link>
        <div className="register-header">
          <h1 className="brand-logo" style={{ fontSize: "28px", marginBottom: "8px", justifyContent: "center" }}>SkillBridge</h1>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 4px" }}>Create An Account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Join SkillBridge to connect with NGOs and volunteering opportunities</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Choose a username"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a strong password"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Enter your legal full name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="role">I am a</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="filter-select"
                style={{ width: "100%" }}
              >
                <option value="Volunteer">Volunteer</option>
                <option value="NGO">NGO / Organization</option>
              </select>
            </div>

            {role === "Volunteer" && (
              <>
                <div className="form-group">
                  <label htmlFor="location">Location (Optional)</label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    placeholder="E.g. New York, NY"
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="skills">Skills (Optional)</label>
                  <input
                    id="skills"
                    type="text"
                    name="skills"
                    placeholder="E.g. web development, teaching"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {role === "NGO" && (
              <>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="organizationName">NGO / Organization Name</label>
                  <input
                    id="organizationName"
                    type="text"
                    name="organizationName"
                    placeholder="Your organization's official name"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="organizationDescription">Organization Description</label>
                  <textarea
                    id="organizationDescription"
                    name="organizationDescription"
                    placeholder="Briefly describe your mission and goals"
                    onChange={handleChange}
                    style={{ minHeight: "100px", padding: "12px" }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="website">Website URL (Optional)</label>
                  <input
                    id="website"
                    type="url"
                    name="website"
                    placeholder="https://yourorganization.org"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <button type="submit" className="action-btn-primary" style={{ width: "100%", marginTop: "24px", padding: "14px" }}>
            Create Your Account
          </button>
        </form>

        <div className="register-footer">
          <p className="login-text">
            Already have an account? <Link to="/login" style={{ color: "var(--color-volunteer)", fontWeight: "600" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
