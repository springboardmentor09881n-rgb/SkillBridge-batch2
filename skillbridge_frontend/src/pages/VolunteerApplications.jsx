import { Inbox, LayoutGrid, MessageSquare, Search, Sparkles, User, Briefcase, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";
import "./VolunteerApplications.css";

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
                if (profileData?.photo_url) setProfilePhoto(`${PUBLIC_BASE_URL}${profileData.photo_url}`);
            } catch (err) {
                console.error(err);
                setApplications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "var(--color-volunteer)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                        <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading applications...</p>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role="Volunteer" 
                    profilePhoto={profilePhoto} 
                    activePage="applications" 
                />

                <main className="content-inner">
                    <div className="page-header" style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px" }}>Your Applications</h2>
                        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Track and manage the opportunities you've applied for.</p>
                    </div>

                    {applications.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: "center", padding: "64px 32px" }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
                            }}>
                                <Briefcase size={28} color="var(--color-volunteer)" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", margin: "0 0 8px" }}>No applications yet</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                                You haven&apos;t applied to any opportunities yet. Explore volunteering roles matching your talent profile.
                            </p>
                            <Link to="/volunteer-opportunities" className="action-btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
                                <Search size={16} /> Browse Opportunities
                            </Link>
                        </div>
                    ) : (
                        <div className="apps-container">
                            {applications.map(app => {
                                const opp = opportunities[app.opportunity_id];
                                const sc = app.status === "accepted" ? { bg: "#dcfce7", color: "#16a34a" } : 
                                           app.status === "pending" ? { bg: "#fef3c7", color: "#d97706" } : 
                                           { bg: "#fee2e2", color: "#dc2626" };
                                return (
                                    <div key={app._id} className="volunteer-app-card">
                                        <div className="app-card-header">
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>
                                                    {app.opportunity_title || opp?.title || "SkillBridge Opportunity"}
                                                </h3>
                                                <div className="app-card-meta">
                                                    <span>{opp?.ngo_name || "SkillBridge Partner"}</span>
                                                    <span>&bull;</span>
                                                    <span>Applied on {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : ""}</span>
                                                </div>
                                            </div>
                                            <span style={{
                                                background: sc.bg, color: sc.color,
                                                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                                textTransform: "capitalize"
                                            }}>{app.status}</span>
                                        </div>

                                        {app.message && (
                                            <div className="app-card-message">
                                                &ldquo;{app.message}&rdquo;
                                            </div>
                                        )}

                                        <div className="app-card-links">
                                            <Link to={`/opportunity/${app.opportunity_id}`} className="link-btn">
                                                <LayoutGrid size={15} /> Opportunity Details
                                            </Link>
                                            {app.status === "accepted" && (
                                                <Link to={`/volunteer-messages?user=${encodeURIComponent(app.ngo_id || "")}`} className="link-btn green">
                                                    <MessageSquare size={15} /> Message NGO
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default VolunteerApplications;
