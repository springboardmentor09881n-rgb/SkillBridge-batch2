import { ArrowRight, Briefcase, CheckCircle2, Clock, Eye, MapPin, MessageSquare, Search, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";

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
            <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
                <Sidebar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                        <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading your dashboard...</p>
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
                <Sidebar />
                <div style={{ flex: 1, padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                        <p style={{ color: "#ef4444", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Error loading your profile</p>
                        <p style={{ color: "#94a3b8", fontSize: 14 }}>Please try refreshing the page.</p>
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
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Top Navigation */}
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
                            { to: "/volunteer-dashboard", label: "Dashboard", active: true },
                            { to: "/volunteer-opportunities", label: "Opportunities" },
                            { to: "/volunteer-applications", label: "Applications" },
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
                            <Link to="/edit-profile-volunteer" title="Open profile" style={{ textDecoration: "none" }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dbeafe, #ede9fe)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", border: "2px solid #e2e8f0", cursor: "pointer"
                                }}>
                                    {!profilePhoto && <User size={18} color="#94a3b8" />}
                                </div>
                            </Link>
                        </div>
                    </nav>
                </header>

                <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                    {/* Welcome Banner */}
                    <div style={{
                        background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)",
                        borderRadius: 16, padding: "28px 32px", marginBottom: 24,
                        display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                        <div style={{ position: "absolute", bottom: -40, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                                Welcome back, {volunteerName}! 👋
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: 0 }}>
                                Ready to make an impact? Explore opportunities that match your skills.
                            </p>
                        </div>
                        <Link to="/volunteer-opportunities" style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 24px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, color: "white",
                            textDecoration: "none", fontSize: 14, fontWeight: 600, position: "relative", zIndex: 1,
                            transition: "background 0.2s"
                        }}>
                            <Search size={16} /> Find Opportunities
                        </Link>
                    </div>

                    <div style={{ display: "flex", gap: 24 }}>
                        {/* Left Panel — Profile */}
                        <aside style={{
                            width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16
                        }}>
                            {/* Profile Card */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 24,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{ textAlign: "center", marginBottom: 20 }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
                                        background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dbeafe, #ede9fe)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", border: "3px solid #e2e8f0"
                                    }}>
                                        {!profilePhoto && <User size={28} color="#94a3b8" />}
                                    </div>
                                    <h3 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{volunteerName}</h3>
                                    <span style={{ fontSize: 13, color: "#94a3b8" }}>Volunteer</span>
                                </div>
                                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                                    <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 700 }}>Skills</h4>
                                    {skills.length > 0 ? (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {skills.map(skill => (
                                                <span key={skill} style={{
                                                    background: "linear-gradient(135deg, #eff6ff, #ede9fe)",
                                                    color: "#3730a3", padding: "5px 12px", borderRadius: 20,
                                                    fontSize: 12, fontWeight: 500, border: "1px solid #c7d2fe"
                                                }}>{skill}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 10px" }}>No skills added yet</p>
                                            <Link to="/edit-profile-volunteer" style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                padding: "6px 14px", background: "#2563eb", color: "white",
                                                borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none"
                                            }}>+ Add Skills</Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats Mini */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 20,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontWeight: 700 }}>Activity</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: 13, color: "#475569" }}>Applications sent</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: "#2563eb" }}>{impact.applications}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: 13, color: "#475569" }}>Accepted</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>{impact.accepted}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: 13, color: "#475569" }}>Pending</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: "#d97706" }}>{impact.pending}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 20,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                    <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, fontWeight: 700 }}>Messages</h4>
                                    <MessageSquare size={14} color="#94a3b8" />
                                </div>
                                <p style={{ fontSize: 13, color: "#475569", margin: "0 0 6px" }}>
                                    Conversations: <strong>{messageStats.conversations}</strong>
                                </p>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>
                                    Unread messages: {messageStats.unread}
                                </p>
                                <Link to="/volunteer-messages" style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    padding: "8px 0", background: "#f8fafc", border: "1px solid #e2e8f0",
                                    borderRadius: 8, color: "#475569", textDecoration: "none", fontSize: 13, fontWeight: 500
                                }}>View All <ArrowRight size={14} /></Link>
                            </div>
                        </aside>

                        {/* Right Main Content */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                            {/* Impact Cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                                {impactCards.map(card => (
                                    <div key={card.label} style={{
                                        background: card.gradient, borderRadius: 14, padding: "20px 18px",
                                        border: "1px solid #e2e8f0", position: "relative", overflow: "hidden"
                                    }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 10, background: card.iconBg,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            marginBottom: 12, color: card.color
                                        }}>{card.icon}</div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Opportunities Section */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 28,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                    <div>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Recommended Opportunities</h2>
                                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Opportunities matching your profile</p>
                                    </div>
                                    <Link to="/volunteer-opportunities" style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8,
                                        color: "#475569", textDecoration: "none", fontSize: 13, fontWeight: 500,
                                        background: "#f8fafc", transition: "all 0.2s"
                                    }}>Browse All <ArrowRight size={14} /></Link>
                                </div>

                                {opportunities.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        {opportunities.map(opp => (
                                            <div key={opp._id} style={{
                                                border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px",
                                                transition: "border-color 0.2s, box-shadow 0.2s",
                                                background: "#fafbfc"
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.08)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                                            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{opp.title}</h4>
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
                                                        {opp.required_skills?.length > 4 && (
                                                            <span style={{ fontSize: 11, color: "#94a3b8", padding: "4px 6px" }}>+{opp.required_skills.length - 4} more</span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        {opp.match_meta?.relevance_score > 0 && (
                                                            <span style={{
                                                                background: "#f0fdf4",
                                                                color: "#15803d",
                                                                border: "1px solid #bbf7d0",
                                                                borderRadius: 999,
                                                                padding: "4px 10px",
                                                                fontSize: 11,
                                                                fontWeight: 700
                                                            }}>
                                                                Match score {opp.match_meta.relevance_score}
                                                            </span>
                                                        )}
                                                        {appliedOpportunityIds.includes(opp._id) ? (
                                                            <span style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                                padding: "8px 12px",
                                                                borderRadius: 8,
                                                                background: "#16a34a",
                                                                color: "white",
                                                                fontSize: 13,
                                                                fontWeight: 600
                                                            }}>
                                                                Applied <Eye size={14} />
                                                            </span>
                                                        ) : (
                                                            <Link to={`/opportunity/${opp._id}`} style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                                padding: "8px 12px",
                                                                borderRadius: 8,
                                                                background: "#2563eb",
                                                                color: "white",
                                                                textDecoration: "none",
                                                                fontSize: 13,
                                                                fontWeight: 600
                                                            }}>
                                                                Apply <Eye size={14} />
                                                            </Link>
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
