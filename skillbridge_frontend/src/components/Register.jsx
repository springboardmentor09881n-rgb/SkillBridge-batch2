import { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";




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
    <div className="register-container">
      <div className="register-card">
        <h2>Create an Account</h2>
        <p>Join SkillBridge to connect with NGOs and volunteering opportunities</p>

        <form onSubmit={handleSubmit}>
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
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
              placeholder="Create a password"
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
              placeholder="Enter your full name or organization name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Volunteer">Volunteer</option>
              <option value="NGO">NGO / Organization</option>
            </select>
          </div>

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

          {role === "Volunteer" && (
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
          )}

          {role === "NGO" && (
            <>
              <div className="form-group">
                <label htmlFor="organizationName">NGO / Organization</label>
                <input
                  id="organizationName"
                  type="text"
                  name="organizationName"
                  placeholder="Your organization name"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizationDescription">Organization Description</label>
                <textarea
                  id="organizationDescription"
                  name="organizationDescription"
                  placeholder="Briefly describe your organization and mission"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website URL (Optional)</label>
                <input
                  id="website"
                  type="url"
                  name="website"
                  placeholder="E.g. https://yourorganization.org"
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button type="submit">Create Account</button>
        </form>

        <div className="login-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
