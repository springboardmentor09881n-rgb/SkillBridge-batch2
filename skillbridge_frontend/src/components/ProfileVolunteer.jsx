import React, { useState, useEffect } from "react";
import "./ProfileVolunteer.css";
import { useNavigate } from "react-router-dom";

const ProfileVolunteer = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
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
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://via.placeholder.com/120"
          alt="Volunteer"
          className="profile-img"
        />
        <h2>{userData.username}</h2>
        <span className="role-badge volunteer">{userData.role}</span>
      </div>

      <div className="profile-card">
        <h3>Personal Information</h3>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Location:</strong> {userData.location || "Not specified"}</p>
      </div>

      <div className="profile-card">
        <h3>Skills & Interests</h3>
        <div className="tags">
          {userData.skills ? userData.skills.split(",").map((skill, index) => (
            <span key={index}>{skill.trim()}</span>
          )) : <span>No skills listed</span>}
        </div>
      </div>

      <div className="profile-actions">
        <button>Edit Profile</button>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileVolunteer;
