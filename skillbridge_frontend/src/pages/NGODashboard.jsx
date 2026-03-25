import { ArrowRight, Briefcase, Building2, Clock, FileCheck, Globe, Mail, MessageSquare, PlusCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const NGODashboard = () => {
    const [data, setData] = useState(null);
    const [appStats, setAppStats] = useState({ applications: 0, accepted: 0, pending: 0 });
    const [recentApps, setRecentApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [responseData, statsData, appsData] = await Promise.all([
                    apiFetch("/dashboard/ngo", { method: "GET" }),
                    apiFetch("/applications/ngo/stats", { method: "GET" }).catch(() => ({ applications: 0, accepted: 0, pending: 0 })),
                    apiFetch("/applications/ngo", { method: "GET" }).catch(() => [])
                ]);
                setData(responseData);
                setAppStats(statsData);
                if (Array.isArray(appsData)) setRecentApps(appsData.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                    <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading dashboard...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    if (!data) return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <p style={{ color: "#ef4444", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Error loading dashboard</p>
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>Please try refreshing the page.</p>
                </div>
            </div>
        </div>
    );

    const profilePhoto = data.photo_url ? `http://localhost:8000${data.photo_url}` : "";

    const overviewCards = [
        { label: "Active Opportunities", value: data.active_opportunities, icon: <Briefcase size={20} />, gradient: "linear-gradient(135deg, #f0fdf4, #dcfce7)", color: "#16a34a", iconBg: "#dcfce7" },
        { label: "Applications", value: appStats.applications, icon: <FileCheck size={20} />, gradient: "linear-gradient(135deg, #faf5ff, #ede9fe)", color: "#7c3aed", iconBg: "#ede9fe" },
        { label: "Active Volunteers", value: appStats.accepted, icon: <Users size={20} />, gradient: "linear-gradient(135deg, #fff7ed, #fed7aa)", color: "#ea580c", iconBg: "#ffedd5" },
        { label: "Pending", value: appStats.pending, icon: <Clock size={20} />, gradient: "linear-gradient(135deg, #fffbeb, #fef3c7)", color: "#d97706", iconBg: "#fef3c7" }
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
                            { to: "/ngo-dashboard", label: "Dashboard", active: true },
                            { to: "/manage-opportunities", label: "Opportunities" },
                            { to: "/ngo-applications", label: "Applications" },
                            { to: "/ngo-messages", label: "Messages" }
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
                    {/* Welcome Banner */}
                    <div style={{
                        background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
                        borderRadius: 16, padding: "28px 32px", marginBottom: 24,
                        display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                        <div style={{ position: "absolute", bottom: -40, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                                Welcome back, {data.organization_name || "Organization"}! 🏢
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: 0 }}>
                                Manage your opportunities and connect with talented volunteers.
                            </p>
                        </div>
                        <Link to="/create-opportunity" style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 24px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, color: "white",
                            textDecoration: "none", fontSize: 14, fontWeight: 600, position: "relative", zIndex: 1
                        }}>
                            <PlusCircle size={16} /> New Opportunity
                        </Link>
                    </div>

                    <div style={{ display: "flex", gap: 24 }}>
                        {/* Left Panel – Org Profile */}
                        <aside style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Profile Card */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 24,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{ textAlign: "center", marginBottom: 20 }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
                                        background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dcfce7, #d1fae5)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", border: "3px solid #e2e8f0"
                                    }}>
                                        {!profilePhoto && <Building2 size={28} color="#94a3b8" />}
                                    </div>
                                    <h3 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{data.organization_name}</h3>
                                    <span style={{ fontSize: 13, color: "#94a3b8" }}>NGO</span>
                                </div>
                                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Mail size={14} color="#94a3b8" />
                                        <span style={{ fontSize: 13, color: "#475569" }}>{data.email}</span>
                                    </div>
                                    {data.website_url && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Globe size={14} color="#94a3b8" />
                                            <a href={data.website_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}>{data.website_url}</a>
                                        </div>
                                    )}
                                    {data.organization_description && (
                                        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", lineHeight: 1.5,
                                            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {data.organization_description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 20,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontWeight: 700 }}>Quick Actions</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <Link to="/create-opportunity" style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                                        textDecoration: "none", color: "#334155", fontSize: 13, fontWeight: 500,
                                        background: "#f8fafc", transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#16a34a"; e.currentTarget.style.background = "#f0fdf4"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <PlusCircle size={16} color="#16a34a" />
                                        </div>
                                        Create Opportunity
                                    </Link>
                                    <Link to="/manage-opportunities" style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                                        textDecoration: "none", color: "#334155", fontSize: 13, fontWeight: 500,
                                        background: "#f8fafc", transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Briefcase size={16} color="#2563eb" />
                                        </div>
                                        Manage Opportunities
                                    </Link>
                                    <Link to="/ngo-messages" style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                                        textDecoration: "none", color: "#334155", fontSize: 13, fontWeight: 500,
                                        background: "#f8fafc", transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#faf5ff"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <MessageSquare size={16} color="#7c3aed" />
                                        </div>
                                        View Messages
                                    </Link>
                                </div>
                            </div>
                        </aside>

                        {/* Right Main Content */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                            {/* Overview Cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                                {overviewCards.map(card => (
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

                            {/* Recent Applications */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 28,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Recent Applications</h3>
                                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Track volunteer applications for your opportunities</p>
                                    </div>
                                    <Link to="/ngo-applications" style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8,
                                        color: "#475569", textDecoration: "none", fontSize: 13, fontWeight: 500,
                                        background: "#f8fafc"
                                    }}>View All <ArrowRight size={14} /></Link>
                                </div>
                                <div style={{ textAlign: "center", padding: "32px 0" }}>
                                    {recentApps.length === 0 ? (
                                        <>
                                            <FileCheck size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
                                            <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 4px" }}>No applications yet</p>
                                            <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0 }}>Applications will appear here when volunteers apply</p>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}>
                                            {recentApps.map(app => (
                                                <div key={app._id} style={{
                                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                                    padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc"
                                                }}>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{app.volunteer_name || "Volunteer"}</p>
                                                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span style={{
                                                        padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                        background: app.status === "accepted" ? "#dcfce7" : app.status === "rejected" ? "#fee2e2" : "#fef3c7",
                                                        color: app.status === "accepted" ? "#16a34a" : app.status === "rejected" ? "#dc2626" : "#d97706",
                                                        textTransform: "capitalize"
                                                    }}>{app.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NGODashboard;
