import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import { Bell, User } from "lucide-react";

const VolunteerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [impact, setImpact] = useState({ applications: 0, accepted: 0, pending: 0, skills: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileData = await apiFetch("/dashboard/volunteer", { method: "GET" });
                setProfile(profileData);

                const oppsData = await apiFetch("/opportunities", { method: "GET" }).catch(() => []);
                setOpportunities(Array.isArray(oppsData) ? oppsData.slice(0, 3) : []);

                let appStats = { applications: 0, accepted: 0, pending: 0 };
                try {
                    appStats = await apiFetch("/applications/volunteer/stats", { method: "GET" });
                } catch (_) {}

                const skillsCount = Array.isArray(profileData?.skills)
                    ? profileData.skills.length
                    : profileData?.skills
                        ? String(profileData.skills).split(",").filter(Boolean).length
                        : 0;
                setImpact({ ...appStats, skills: skillsCount });
            } catch (err) {
                console.error("Error fetching dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const skills = profile?.skills
        ? Array.isArray(profile.skills)
            ? profile.skills
            : String(profile.skills).split(",").map(s => s.trim()).filter(Boolean)
        : [];

    if (loading) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
                <Sidebar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: "18px", color: "#666" }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
                <Sidebar />
                <div style={{ flex: 1, padding: "40px" }}>
                    <p style={{ color: "#e74c3c" }}>Error loading your profile.</p>
                </div>
            </div>
        );
    }

    const volunteerName = profile.name || profile.full_name || "Volunteer";
    const profilePhoto = profile.photo_url ? `http://localhost:8000${profile.photo_url}` : "";

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
                        <Link to="/volunteer-dashboard" style={{ textDecoration: "none", color: "#374151", fontWeight: "600", fontSize: "15px" }}>Dashboard</Link>
                        <Link to="/volunteer-opportunities" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Opportunities</Link>
                        <Link to="/volunteer-messages" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Messages</Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ color: "#9ca3af", fontSize: "14px", fontWeight: "500" }}>Volunteer</span>
                            <Bell size={20} color="#9ca3af" style={{ cursor: "pointer" }} />
                            <div style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden"
                            }}>
                                {!profilePhoto && <User size={18} color="#9ca3af" />}
                            </div>
                        </div>
                    </nav>
                </header>

                <main style={{ flex: 1, padding: "24px 32px", display: "flex", gap: "24px" }}>
                    {/* Left Sidebar - Profile (light grey background) */}
                    <aside style={{
                        width: "260px",
                        flexShrink: 0,
                        background: "#f3f4f6",
                        borderRadius: "12px",
                        padding: "24px",
                        height: "fit-content"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                            <div style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "#e5e7eb",
                                flexShrink: 0,
                                overflow: "hidden"
                            }} />
                            <div>
                                <h3 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "600", color: "#374151" }}>{volunteerName}</h3>
                                <span style={{ fontSize: "13px", color: "#9ca3af" }}>Volunteer</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", fontWeight: "600" }}>Your Skills</h4>
                            {skills.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {skills.map(skill => (
                                        <span key={skill} style={{
                                            background: "#eff6ff",
                                            color: "#2563eb",
                                            padding: "5px 12px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            border: "1px solid #bfdbfe"
                                        }}>{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 10px 0" }}>
                                        No skills added yet
                                    </p>
                                    <Link to="/edit-profile-volunteer" style={{
                                        display: "inline-block",
                                        padding: "8px 16px",
                                        background: "#2563eb",
                                        color: "white",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        textDecoration: "none"
                                    }}>+ Add Skills</Link>
                                </>
                            )}
                        </div>
                        <div>
                            <h4 style={{ fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", fontWeight: "600" }}>Activity</h4>
                            <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>No recent activity</p>
                        </div>
                    </aside>

                    {/* Main Content - Right Panel */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                        {/* Find Opportunities - First Section */}
                        <section style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "28px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                        }}>
                            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>Find Opportunities</h2>
                            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "20px" }}>
                                Discover volunteering opportunities that match your skills and interests.
                            </p>
                            <Link to="/volunteer-opportunities" style={{
                                display: "inline-block",
                                padding: "12px 24px",
                                background: "#2563eb",
                                color: "white",
                                borderRadius: "8px",
                                fontWeight: "600",
                                textDecoration: "none",
                                marginBottom: "24px"
                            }}>Browse All Opportunities</Link>

                            {opportunities.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    {opportunities.map(opp => (
                                        <div key={opp._id} style={{
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "10px",
                                            padding: "20px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: "16px"
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#374151" }}>{opp.title}</h4>
                                                    <span style={{
                                                        background: "#16a34a",
                                                        color: "white",
                                                        padding: "5px 14px",
                                                        borderRadius: "20px",
                                                        fontSize: "12px",
                                                        fontWeight: "500",
                                                        flexShrink: 0
                                                    }}>{opp.status || "Open"}</span>
                                                </div>
                                                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px" }}>NGO ID: {opp.ngo_id && !String(opp.ngo_id).includes("@") ? opp.ngo_id : "2"}</p>
                                                <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "12px", lineHeight: 1.6 }}>{opp.description}</p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                                                    {opp.required_skills?.map(skill => (
                                                        <span key={skill} style={{
                                                            background: "#eff6ff",
                                                            color: "#2563eb",
                                                            padding: "5px 12px",
                                                            borderRadius: "20px",
                                                            fontSize: "12px",
                                                            border: "1px solid #bfdbfe"
                                                        }}>{skill}</span>
                                                    ))}
                                                </div>
                                                <Link to={`/opportunity/${opp._id}`} style={{ fontSize: "14px", color: "#2563eb", textDecoration: "none", fontWeight: "500" }}>
                                                    View details &gt;
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "#6b7280", fontSize: "14px" }}>No opportunities available at the moment.</p>
                            )}
                        </section>

                        {/* Your Impact - Bottom Section (light grey box) */}
                        <section style={{
                            background: "#f3f4f6",
                            borderRadius: "12px",
                            padding: "28px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#374151", marginBottom: "16px" }}>Your Impact</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                                {[
                                    { label: "Applications", value: impact.applications, bg: "#ffffff", color: "#374151", border: "1px solid #e5e7eb" },
                                    { label: "Accepted", value: impact.accepted, bg: "#dcfce7", color: "#16a34a" },
                                    { label: "Pending", value: impact.pending, bg: "#fef3c7", color: "#d97706" },
                                    { label: "Skills", value: impact.skills, bg: "#eff6ff", color: "#2563eb" }
                                ].map(card => (
                                    <div key={card.label} style={{
                                        background: card.bg,
                                        borderRadius: "10px",
                                        padding: "20px",
                                        textAlign: "center",
                                        border: card.border || "none"
                                    }}>
                                        <div style={{ fontSize: "24px", fontWeight: "700", color: card.color }}>{card.value}</div>
                                        <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#374151", marginBottom: "12px" }}>Recent Messages</h2>
                                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>No recent messages</p>
                                <Link to="/volunteer-messages" style={{
                                    display: "inline-block",
                                    padding: "10px 20px",
                                    background: "#2563eb",
                                    color: "white",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    textDecoration: "none"
                                }}>
                                    View All Messages
                                </Link>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
