import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const VolunteerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [opportunities, setOpportunities] = useState({});
    const [loading, setLoading] = useState(true);
    const [profilePhoto, setProfilePhoto] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apps, oppsList, profileData] = await Promise.all([
                    apiFetch("/applications/volunteer", { method: "GET" }).catch(() => []),
                    apiFetch("/opportunities", { method: "GET" }).catch(() => []),
                    apiFetch("/dashboard/volunteer", { method: "GET" }).catch(() => null)
                ]);
                setApplications(Array.isArray(apps) ? apps : []);
                const oppMap = {};
                (Array.isArray(oppsList) ? oppsList : []).forEach(o => { oppMap[o._id] = o; });
                setOpportunities(oppMap);
                if (profileData?.photo_url) setProfilePhoto(`http://localhost:8000${profileData.photo_url}`);
            } catch (err) {
                console.error(err);
                setApplications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                            { to: "/volunteer-applications", label: "Applications", active: true },
                            { to: "/volunteer-messages", label: "Messages" }
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
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>Your Applications</h2>
                <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>Track the status of your volunteering applications.</p>

                {loading ? (
                    <p>Loading...</p>
                ) : applications.length === 0 ? (
                    <div style={{ background: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                        <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "16px" }}>You haven't applied to any opportunities yet.</p>
                        <Link to="/volunteer-opportunities" style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            background: "#2563eb",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: "600",
                            textDecoration: "none"
                        }}>Browse Opportunities</Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {applications.map(app => {
                            const opp = opportunities[app.opportunity_id];
                            return (
                                <div key={app._id} style={{
                                    background: "white",
                                    borderRadius: "12px",
                                    padding: "24px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    border: "1px solid #e2e8f0"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", margin: "0 0 4px" }}>
                                                {app.opportunity_title || opp?.title || "Opportunity"}
                                            </h3>
                                            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                                                Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                                            </p>
                                        </div>
                                        <span style={{
                                            background: app.status === "accepted" ? "#dcfce7" : app.status === "pending" ? "#fef3c7" : "#fee2e2",
                                            color: app.status === "accepted" ? "#16a34a" : app.status === "pending" ? "#d97706" : "#dc2626",
                                            padding: "6px 12px",
                                            borderRadius: "20px",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            textTransform: "capitalize"
                                        }}>{app.status}</span>
                                    </div>
                                    {app.message && (
                                        <div style={{
                                            background: "#f8fafc", borderLeft: "3px solid #2563eb", padding: "10px 14px",
                                            borderRadius: "0 8px 8px 0", margin: "12px 0", fontSize: 14, color: "#4b5563", lineHeight: 1.5
                                        }}>{app.message}</div>
                                    )}
                                    {opp && (
                                        <Link to={`/opportunity/${app.opportunity_id}`} style={{ color: "#2563eb", fontSize: "14px", marginTop: "8px", display: "inline-block" }}>
                                            View opportunity details
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerApplications;
