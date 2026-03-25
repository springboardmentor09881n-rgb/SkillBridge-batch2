import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChatWorkspace from "../components/ChatWorkspace";
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
                            <Link to="/edit-profile-ngo" title="Open profile" style={{ textDecoration: "none" }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dcfce7, #d1fae5)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", border: "2px solid #e2e8f0", cursor: "pointer"
                                }}>
                                    {!profilePhoto && <Building2 size={18} color="#94a3b8" />}
                                </div>
                            </Link>
                        </div>
                    </nav>
                </header>

                <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Messages</h2>
                        <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Communicate with volunteers and get smart match suggestions</p>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <Link to="/ngo-dashboard" style={{ color: "#2563eb", fontSize: "14px", textDecoration: "none", fontWeight: 600 }}>
                            Back to Dashboard
                        </Link>
                    </div>
                    <ChatWorkspace role="ngo" />
                </main>
            </div>
        </div>
    );
};

export default NGOMessages;
