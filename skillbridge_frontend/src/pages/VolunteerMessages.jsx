import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const VolunteerMessages = () => {
    const [profilePhoto, setProfilePhoto] = useState("");

    useEffect(() => {
        apiFetch("/dashboard/volunteer", { method: "GET" })
            .then(data => { if (data?.photo_url) setProfilePhoto(`http://localhost:8000${data.photo_url}`); })
            .catch(() => {});
    }, []);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", fontFamily: "system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Top Navigation Bar */}
                <header style={{
                    background: "white",
                    padding: "16px 32px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#000", margin: 0 }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                        <Link to="/volunteer-dashboard" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Dashboard</Link>
                        <Link to="/volunteer-opportunities" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Opportunities</Link>
                        <Link to="/volunteer-applications" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Applications</Link>
                        <Link to="/volunteer-messages" style={{ textDecoration: "none", color: "#374151", fontWeight: "600", fontSize: "15px" }}>Messages</Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "8px", paddingLeft: "20px", borderLeft: "1.5px solid #e5e7eb" }}>
                            <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "9999px", letterSpacing: "0.025em", lineHeight: "1" }}>Volunteer</span>
                            <Bell size={20} color="#9ca3af" style={{ cursor: "pointer" }} />
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "#e5e7eb",
                                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                            }}>
                                {!profilePhoto && <User size={18} color="#9ca3af" />}
                            </div>
                        </div>
                    </nav>
                </header>

                <div style={{ padding: "32px" }}>
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
        </div>
    );
};

export default VolunteerMessages;
