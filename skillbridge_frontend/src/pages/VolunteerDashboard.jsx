import { ArrowRight, Briefcase, CheckCircle2, Clock, Eye, MapPin, MessageSquare, Search, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";
import "./VolunteerDashboard.css";

const VolunteerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [opportunities, setOpportunities] = useState([]);
    const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [impact, setImpact] = useState({ applications: 0, accepted: 0, pending: 0, skills: 0 });
    const [messageStats, setMessageStats] = useState({ conversations: 0, unread: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileData = await apiFetch("/dashboard/volunteer", { method: "GET" });
                setProfile(profileData);

                const [oppsData, applicationsData] = await Promise.all([
                    apiFetch("/opportunities/match", { method: "GET" })
                        .catch(() => apiFetch("/opportunities", { method: "GET" }))
                        .catch(() => []),
                    apiFetch("/applications/volunteer", { method: "GET" }).catch(() => []),
                ]);
                setOpportunities(Array.isArray(oppsData) ? oppsData.slice(0, 3) : []);
                setAppliedOpportunityIds(
                    Array.isArray(applicationsData)
                        ? applicationsData.map(app => app.opportunity_id).filter(Boolean)
                        : []
                );

                let appStats = { applications: 0, accepted: 0, pending: 0 };
                try {
                    appStats = await apiFetch("/applications/volunteer/stats", { method: "GET" });
                } catch {
                    appStats = { applications: 0, accepted: 0, pending: 0 };
                }

                try {
                    const convos = await apiFetch("/messages/conversations", { method: "GET" });
                    const list = Array.isArray(convos) ? convos : [];
                    setMessageStats({
                        conversations: list.length,
                        unread: list.reduce((sum, item) => sum + (item.unread_count || 0), 0),
                    });
                } catch {
                    setMessageStats({ conversations: 0, unread: 0 });
                }

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
            <div className="layout-wrapper">
                <Sidebar />
                <div className="main-container">
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                            <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading your dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="layout-wrapper">
                <Sidebar />
                <div className="main-container">
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="glass-card" style={{ textAlign: "center" }}>
                            <p style={{ color: "#ef4444", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Error loading your profile</p>
                            <p style={{ color: "#94a3b8", fontSize: 14 }}>Please try refreshing the page.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const volunteerName = profile.name || profile.full_name || "Volunteer";
    const profilePhoto = profile.photo_url ? `${PUBLIC_BASE_URL}${profile.photo_url}` : "";

    const impactCards = [
        { label: "Applications", value: impact.applications, icon: <Briefcase size={20} />, gradient: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#2563eb", iconBg: "#dbeafe" },
        { label: "Accepted", value: impact.accepted, icon: <CheckCircle2 size={20} />, gradient: "linear-gradient(135deg, #f0fdf4, #dcfce7)", color: "#16a34a", iconBg: "#dcfce7" },
        { label: "Pending", value: impact.pending, icon: <Clock size={20} />, gradient: "linear-gradient(135deg, #fffbeb, #fef3c7)", color: "#d97706", iconBg: "#fef3c7" },
        { label: "Skills", value: impact.skills, icon: <Sparkles size={20} />, gradient: "linear-gradient(135deg, #faf5ff, #ede9fe)", color: "#7c3aed", iconBg: "#ede9fe" }
    ];

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role="Volunteer" 
                    profilePhoto={profilePhoto} 
                    activePage="dashboard" 
                />

                <main className="content-inner">
                    <div className="welcome-banner-volunteer" style={{
                      background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)"
                    }}>
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, margin: "0 0 6px" }}>
                                Welcome back, {volunteerName}! 👋
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: 0 }}>
                                Ready to make an impact? Explore opportunities that match your skills.
                            </p>
                        </div>
                        <Link to="/volunteer-opportunities" className="action-btn-primary" style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 24px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, color: "white",
                            textDecoration: "none", fontSize: 14, fontWeight: 600, position: "relative", zIndex: 1,
                            transition: "background 0.2s"
                        }}>
                            <Search size={16} /> Find Opportunities
                        </Link>
                    </div>

                    <div className="volunteer-dashboard-container">
                        <aside className="profile-aside-sticky">
                            <div className="glass-card" style={{ textAlign: "center" }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
                                    background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dbeafe, #ede9fe)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", border: "3px solid #e2e8f0"
                                }}>
                                    {!profilePhoto && <User size={28} color="#94a3b8" />}
                                </div>
                                <h3 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{volunteerName}</h3>
                                <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 16, paddingTop: 16 }}>
                                    <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 700 }}>Skills</h4>
                                    {skills.length > 0 ? (
                                        <div className="skills-wrapper">
                                            {skills.map(skill => (
                                                <span key={skill} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <Link to="/edit-profile-volunteer" className="text-btn">+ Add Skills</Link>
                                    )}
                                </div>
                            </div>

                            <div className="glass-card" style={{ marginTop: 24 }}>
                                <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontWeight: 700 }}>Activity</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Sent Applications</span>
                                        <strong>{impact.applications}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Accepted Jobs</span>
                                        <strong style={{ color: "#16a34a" }}>{impact.accepted}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Unread Messages</span>
                                        <strong>{messageStats.unread}</strong>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <div className="dashboard-main-strip">
                            <div className="impact-grid">
                                {impactCards.map(card => (
                                    <div key={card.label} className="stats-card" style={{ background: card.gradient }}>
                                        <div style={{ color: card.color, marginBottom: 8 }}>{card.icon}</div>
                                        <div className="stats-card-value" style={{ color: card.color }}>{card.value}</div>
                                        <div className="stats-card-label">{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Recommended Opportunities</h2>
                                    <Link to="/volunteer-opportunities" className="link-btn">Browse All <ArrowRight size={14} /></Link>
                                </div>

                                {opportunities.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        {opportunities.map(opp => (
                                            <div key={opp._id} className="opportunity-card">
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                                            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{opp.title}</h4>
                                                            <span style={{
                                                                background: opp.status === "Closed" ? "#fef2f2" : "#f0fdf4",
                                                                color: opp.status === "Closed" ? "#dc2626" : "#16a34a",
                                                                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                                                                border: `1px solid ${opp.status === "Closed" ? "#fecaca" : "#bbf7d0"}`
                                                            }}>{opp.status || "Open"}</span>
                                                        </div>
                                                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 4 }}>
                                                            <MapPin size={12} /> {opp.location || "Remote"} &middot; {opp.ngo_name || opp.ngo_id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: 14, color: "#475569", margin: "0 0 12px", lineHeight: 1.6,
                                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                                }}>{opp.description}</p>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                        {opp.required_skills?.slice(0, 4).map(skill => (
                                                            <span key={skill} style={{
                                                                background: "#eff6ff", color: "#2563eb",
                                                                padding: "4px 10px", borderRadius: 16,
                                                                fontSize: 11, fontWeight: 500, border: "1px solid #bfdbfe"
                                                            }}>{skill}</span>
                                                        ))}
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        {appliedOpportunityIds.includes(opp._id) ? (
                                                            <span className="applied-badge">Applied</span>
                                                        ) : (
                                                            <Link to={`/opportunity/${opp._id}`} className="action-btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>View & Apply <Eye size={14} /></Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                                        <Briefcase size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
                                        <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>No opportunities available yet. Check back soon!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
