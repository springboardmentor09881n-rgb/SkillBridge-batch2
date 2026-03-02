import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
                        <Link to="/volunteer-applications" style={{ textDecoration: "none", color: "#374151", fontWeight: "600", fontSize: "15px" }}>Applications</Link>
                        <Link to="/volunteer-messages" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Messages</Link>
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
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", margin: 0 }}>
                                            {opp?.title || "Opportunity"}
                                        </h3>
                                        <span style={{
                                            background: app.status === "accepted" ? "#dcfce7" : app.status === "pending" ? "#fef3c7" : "#fee2e2",
                                            color: app.status === "accepted" ? "#16a34a" : app.status === "pending" ? "#d97706" : "#dc2626",
                                            padding: "6px 12px",
                                            borderRadius: "20px",
                                            fontSize: "13px",
                                            fontWeight: "500"
                                        }}>{app.status}</span>
                                    </div>
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
