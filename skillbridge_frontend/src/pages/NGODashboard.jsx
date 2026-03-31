import { ArrowRight, Briefcase, Building2, Clock, FileCheck, Globe, Mail, MessageSquare, PlusCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import "./NGODashboard.css";

const NGODashboard = () => {
    const [data, setData] = useState(null);
    const [appStats, setAppStats] = useState({ applications: 0, accepted: 0, pending: 0 });
    const [recentApps, setRecentApps] = useState([]);
    const [messageStats, setMessageStats] = useState({ conversations: 0, unread: 0 });
    const [loading, setLoading] = useState(true);

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
            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                        <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!data) return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="glass-card" style={{ textAlign: "center" }}>
                        <p style={{ color: "#ef4444", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Error loading dashboard</p>
                        <p style={{ color: "#94a3b8", fontSize: 14 }}>Please try refreshing the page.</p>
                    </div>
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
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role="NGO" 
                    profilePhoto={profilePhoto} 
                    activePage="dashboard" 
                />
                
                <main className="content-inner">
                    <div className="welcome-banner" style={{
                      background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)"
                    }}>
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, margin: "0 0 6px" }}>
                                Welcome back, {data.organization_name || "Organization"}! 🏢
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: 0 }}>
                                Manage your opportunities and connect with talented volunteers.
                            </p>
                        </div>
                        <Link to="/create-opportunity" className="action-btn-primary" style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 24px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, color: "white",
                            textDecoration: "none", fontSize: 14, fontWeight: 600, position: "relative", zIndex: 1
                        }}>
                            <PlusCircle size={16} /> New Opportunity
                        </Link>
                    </div>

                    <div className="ngo-dashboard-container">
                        <aside className="profile-aside-sticky">
                            <div className="glass-card" style={{ textAlign: "center" }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
                                    background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dcfce7, #d1fae5)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", border: "3px solid #e2e8f0"
                                }}>
                                    {!profilePhoto && <Building2 size={28} color="#94a3b8" />}
                                </div>
                                <h3 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{data.organization_name}</h3>
                                <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 16, paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                        <Mail size={14} color="#94a3b8" />
                                        <span>{data.email}</span>
                                    </div>
                                    {data.website_url && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                            <Globe size={14} color="#94a3b8" />
                                            <a href={data.website_url} target="_blank" rel="noreferrer">{data.website_url}</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="glass-card" style={{ marginTop: 24 }}>
                                <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontWeight: 700 }}>Overview</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Conversations</span>
                                        <strong>{messageStats.conversations}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Unread Notifications</span>
                                        <strong>{messageStats.unread}</strong>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <div className="dashboard-main-strip">
                            <div className="overview-grid">
                                {overviewCards.map(card => (
                                    <div key={card.label} className="stats-card" style={{ background: card.gradient }}>
                                        <div style={{ color: card.color, marginBottom: 8 }}>{card.icon}</div>
                                        <div className="stats-card-value" style={{ color: card.color }}>{card.value}</div>
                                        <div className="stats-card-label">{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Recent Applications</h3>
                                    <Link to="/ngo-applications" className="link-btn green">View All <ArrowRight size={14} /></Link>
                                </div>
                                
                                {recentApps.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                                        <FileCheck size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                                        <p>No applications yet</p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {recentApps.map(app => (
                                            <div key={app._id} style={{
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc"
                                            }}>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{app.volunteer_name || "Volunteer"}</p>
                                                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`badge ${app.status}`} style={{
                                                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                    background: app.status === "accepted" ? "#dcfce7" : app.status === "rejected" ? "#fee2e2" : "#fef3c7",
                                                    color: app.status === "accepted" ? "#16a34a" : app.status === "rejected" ? "#dc2626" : "#d97706"
                                                }}>{app.status}</span>
                                            </div>
                                        ))}
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

export default NGODashboard;
