import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div style={{ width: "250px", height: "100vh", background: "#f8f9fa", padding: "20px", borderRight: "1px solid #ddd" }}>
            <h2>SkillBridge</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {user?.role === "Volunteer" && (
                    <>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/volunteer-dashboard" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Dashboard</Link>
                        </li>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/volunteer-opportunities" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Opportunities</Link>
                        </li>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/volunteer-applications" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Applications</Link>
                        </li>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/volunteer-messages" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Messages</Link>
                        </li>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/edit-profile-volunteer" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Edit Profile</Link>
                        </li>
                    </>
                )}
                {user?.role === "NGO" && (
                    <>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/ngo-dashboard" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Dashboard</Link>
                        </li>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/manage-opportunities" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Manage Opportunities</Link>
                        </li>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/create-opportunity" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Create Opportunity</Link>
                        </li>
                        <li style={{ marginBottom: "15px" }}>
                            <Link to="/edit-profile-ngo" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Edit Profile</Link>
                        </li>
                    </>
                )}
            </ul>
            <button onClick={handleLogout} style={{ marginTop: "auto", width: "100%", padding: "10px", background: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
