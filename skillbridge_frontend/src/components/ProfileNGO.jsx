import React, { useState, useEffect } from "react";
import "./ProfileNGO.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfileNGO = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/user/me", {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          logout();
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, user, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://via.placeholder.com/120"
          alt="NGO"
          className="profile-img"
        />
        <h2>{userData.username}</h2>
        <span className="role-badge ngo">{userData.role}</span>
      </div>

      <div className="profile-card">
        <h3>Organization Details</h3>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Location:</strong> {userData.location || "Not specified"}</p>
      </div>

      <div className="profile-card">
        <h3>About NGO</h3>
        <p>
          {userData.organization_description || "No description available."}
        </p>
      </div>

      <div className="profile-actions">
        <button>Edit Profile</button>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileNGO;
