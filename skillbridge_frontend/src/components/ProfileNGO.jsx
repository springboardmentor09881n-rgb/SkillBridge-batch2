import "./ProfileNGO.css";
import { useNavigate } from "react-router-dom";

const ProfileNGO = () => {

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
          alt="NGO"
          className="profile-img"
        />
        <h2>Helping Hands Foundation</h2>
        <span className="role-badge ngo">NGO</span>
      </div>

      <div className="profile-card">
        <h3>Organization Details</h3>
        <p><strong>Email:</strong> helpinghands@gmail.com</p>
        <p><strong>Phone:</strong> 9123456780</p>
        <p><strong>Address:</strong> Cuttack, Odisha</p>
      </div>

      <div className="profile-card">
        <h3>About NGO</h3>
        <p>
          We work towards education and empowerment of underprivileged
          communities through volunteer-driven programs.
        </p>
      </div>

      <div className="profile-card">
        <h3>Volunteer Requirements</h3>
        <ul>
          <li>Teaching Volunteers</li>
          <li>Event Coordinators</li>
          <li>Social Media Volunteers</li>
        </ul>
      </div>

      <div className="profile-actions">
        <button>Edit Profile</button>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileNGO;
