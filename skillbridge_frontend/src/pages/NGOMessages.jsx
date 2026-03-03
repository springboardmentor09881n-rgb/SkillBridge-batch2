import { Building2, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const NGOMessages = () => {
    const [profilePhoto, setProfilePhoto] = useState("");

    useEffect(() => {
        apiFetch("/dashboard/ngo", { method: "GET" })
            .then(d => { if (d?.photo_url) setProfilePhoto(`http://localhost:8000${d.photo_url}`); })
            .catch(() => {});
    }, []);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <header style={{
                    background: "white", padding: "14px 32px", borderBottom: "1px solid #e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {[
                            { to: "/ngo-dashboard", label: "Dashboard" },
                            { to: "/manage-opportunities", label: "Opportunities" },
                            { to: "/ngo-applications", label: "Applications" },
                            { to: "/ngo-messages", label: "Messages", active: true }
                        ].map(link => (
                            <Link key={link.label} to={link.to} style={{
                                textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                                color: link.active ? "#2563eb" : "#64748b",
                                background: link.active ? "#eff6ff" : "transparent",
                                transition: "all 0.2s"
                            }}>{link.label}</Link>
                        ))}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 12, paddingLeft: 16, borderLeft: "1.5px solid #e2e8f0" }}>
                            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.03em" }}>NGO</span>
                            <NotificationBell />
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dcfce7, #d1fae5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", border: "2px solid #e2e8f0"
                            }}>
                                {!profilePhoto && <Building2 size={18} color="#94a3b8" />}
                            </div>
                        </div>
                    </nav>
                </header>

                <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Messages</h2>
                        <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Communicate with volunteers and team members</p>
                    </div>

                    {/* Empty State */}
                    <div style={{
                        background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: "64px 32px",
                        textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 20px"
                        }}>
                            <MessageSquare size={28} color="#2563eb" />
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>No messages yet</h3>
                        <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 24px", maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                            Your conversations with volunteers will appear here. Messages will be available once volunteers start applying to your opportunities.
                        </p>
                        <Link to="/ngo-dashboard" style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "#2563eb", color: "white", padding: "10px 24px", borderRadius: 10,
                            textDecoration: "none", fontSize: 14, fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(37,99,235,0.25)"
                        }}>
                            <Send size={16} /> Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NGOMessages;
