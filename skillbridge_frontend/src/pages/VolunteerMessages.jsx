import React from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

const VolunteerMessages = () => {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", fontFamily: "system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "32px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>Messages</h2>
                <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>View and manage your messages with NGOs.</p>
                <div style={{ background: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <p style={{ color: "#6b7280", fontSize: "16px" }}>No recent messages</p>
                    <Link to="/volunteer-dashboard" style={{ color: "#2563eb", fontSize: "14px", marginTop: "12px", display: "inline-block" }}>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VolunteerMessages;
