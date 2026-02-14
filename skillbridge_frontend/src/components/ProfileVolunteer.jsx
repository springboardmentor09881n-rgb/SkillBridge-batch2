import "./ProfileVolunteer.css";
import { useNavigate } from "react-router-dom";

const ProfileVolunteer = () => {
    const navigate=useNavigate()
      const handleLogout = () => {
    // Remove stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Optional: clear everything (use only if you store nothing else)
    // localStorage.clear();

    // Redirect to login page
    navigate("/login");
  };
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://via.placeholder.com/120"
          alt="Volunteer"
          className="profile-img"
        />
        <h2>Anisha Pattanayak</h2>
        <span className="role-badge volunteer">Volunteer</span>
      </div>

      <div className="profile-card">
        <h3>Personal Information</h3>
        <p><strong>Email:</strong> anisha@gmail.com</p>
        <p><strong>Phone:</strong> 9876543210</p>
        <p><strong>Location:</strong> Bhubaneswar</p>
      </div>

      <div className="profile-card">
        <h3>Skills & Interests</h3>
        <div className="tags">
          <span>Teaching</span>
          <span>Event Management</span>
          <span>Social Work</span>
        </div>
      </div>

      <div className="profile-card">
        <h3>Availability</h3>
        <p>Weekends</p>
        <p>10:00 AM – 4:00 PM</p>
      </div>

      <div className="profile-actions">
        <button>Edit Profile</button>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileVolunteer;
