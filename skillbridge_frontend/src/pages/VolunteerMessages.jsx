import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
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
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Top Navigation Bar */}
                <header style={{
                    background: "white",
                    padding: "14px 32px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {[
                            { to: "/volunteer-dashboard", label: "Dashboard" },
                            { to: "/volunteer-opportunities", label: "Opportunities" },
                            { to: "/volunteer-applications", label: "Applications" },
                            { to: "/volunteer-messages", label: "Messages", active: true }
                        ].map(link => (
                            <Link key={link.label} to={link.to} style={{
                                textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                                color: link.active ? "#2563eb" : "#64748b",
                                background: link.active ? "#eff6ff" : "transparent",
                                transition: "all 0.2s"
                            }}>{link.label}</Link>
                        ))}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 12, paddingLeft: 16, borderLeft: "1.5px solid #e2e8f0" }}>
                            <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.03em" }}>Volunteer</span>
                            <NotificationBell />
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dbeafe, #ede9fe)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", border: "2px solid #e2e8f0"
                            }}>
                                {!profilePhoto && <User size={18} color="#94a3b8" />}
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
