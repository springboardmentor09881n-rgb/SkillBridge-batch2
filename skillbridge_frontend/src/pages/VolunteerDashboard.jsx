import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import { Search, MessageCircle, Bell, User } from "lucide-react";

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

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", fontFamily: "system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <header style={{
                    background: "white",
                    padding: "16px 32px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <Link to="/volunteer-dashboard" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "600" }}>Dashboard</Link>
                        <Link to="/volunteer-opportunities" style={{ textDecoration: "none", color: "#4b5563", fontWeight: "500" }}>Opportunities</Link>
                        <Link to="/volunteer-applications" style={{ textDecoration: "none", color: "#4b5563", fontWeight: "500" }}>Applications</Link>
                        <Link to="/volunteer-messages" style={{ textDecoration: "none", color: "#4b5563", fontWeight: "500" }}>Messages</Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Bell size={20} color="#6b7280" style={{ cursor: "pointer" }} />
                            <span style={{ color: "#6b7280", fontSize: "14px" }}>0</span>
                            <User size={20} color="#6b7280" style={{ cursor: "pointer" }} />
                        </div>
                    </nav>
                </header>

                <main style={{ flex: 1, padding: "32px", display: "flex", gap: "32px" }}>
                    {/* Left Panel - Profile */}
                    <aside style={{
                        width: "280px",
                        flexShrink: 0,
                        background: "white",
                        borderRadius: "12px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        height: "fit-content"
                    }}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                                margin: "0 auto 12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "28px",
                                fontWeight: "700"
                            }}>
                                {volunteerName.charAt(0).toUpperCase()}
                            </div>
                            <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>{volunteerName}</h3>
                            <span style={{ fontSize: "14px", color: "#6b7280" }}>Volunteer</span>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <h4 style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Your Skills</h4>
                            {skills.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {skills.map(skill => (
                                        <span key={skill} style={{
                                            background: "#eff6ff",
                                            color: "#2563eb",
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "500"
                                        }}>{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
                                    No skills added yet{" "}
                                    <Link to="/edit-profile-volunteer" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "500" }}>+ Add Skills</Link>
                                </p>
                            )}
                        </div>
                        <div>
                            <h4 style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Activity</h4>
                            <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>No recent activity</p>
                        </div>
                    </aside>

                    {/* Right Panel - Content */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                        {/* Find Opportunities */}
                        <section style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "24px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                        }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>Find Opportunities</h2>
                            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
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
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {opportunities.map(opp => (
                                        <div key={opp._id} style={{
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: "16px"
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>{opp.title}</h4>
                                                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>NGO ID {opp.ngo_id?.slice(-1) || "—"}</p>
                                                <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "12px", lineHeight: 1.5 }}>{opp.description}</p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                                                    {opp.required_skills?.map(skill => (
                                                        <span key={skill} style={{
                                                            background: "#eff6ff",
                                                            color: "#2563eb",
                                                            padding: "4px 10px",
                                                            borderRadius: "20px",
                                                            fontSize: "12px"
                                                        }}>{skill}</span>
                                                    ))}
                                                </div>
                                                <Link to={`/opportunity/${opp._id}`} style={{ fontSize: "14px", color: "#2563eb", textDecoration: "none", fontWeight: "500" }}>
                                                    View details &gt;
                                                </Link>
                                            </div>
                                            <span style={{
                                                background: "#dcfce7",
                                                color: "#16a34a",
                                                padding: "4px 12px",
                                                borderRadius: "20px",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                flexShrink: 0
                                            }}>{opp.status || "Open"}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "#6b7280", fontSize: "14px" }}>No opportunities available at the moment.</p>
                            )}
                        </section>

                        {/* Your Impact */}
                        <section>
                            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "16px" }}>Your Impact</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                                {[
                                    { label: "Applications", value: impact.applications, bg: "#f9fafb", color: "#374151" },
                                    { label: "Accepted", value: impact.accepted, bg: "#dcfce7", color: "#16a34a" },
                                    { label: "Pending", value: impact.pending, bg: "#fef3c7", color: "#d97706" },
                                    { label: "Skills", value: impact.skills, bg: "#eff6ff", color: "#2563eb" }
                                ].map(card => (
                                    <div key={card.label} style={{
                                        background: card.bg,
                                        borderRadius: "10px",
                                        padding: "20px",
                                        textAlign: "center"
                                    }}>
                                        <div style={{ fontSize: "24px", fontWeight: "700", color: card.color }}>{card.value}</div>
                                        <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
