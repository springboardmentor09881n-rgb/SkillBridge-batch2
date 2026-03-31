import { Building2, Check, Inbox, MessageSquare, Search, X, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import "./NGOApplications.css";

const NGOApplications = () => {
    const [profilePhoto, setProfilePhoto] = useState("");
    const [applications, setApplications] = useState([]);
    const [opportunities, setOpportunities] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apps, oppsList, profileData] = await Promise.all([
                    apiFetch("/applications/ngo", { method: "GET" }).catch(() => []),
                    apiFetch("/opportunities/ngo", { method: "GET" }).catch(() => []),
                    apiFetch("/dashboard/ngo", { method: "GET" }).catch(() => null)
                ]);
                setApplications(Array.isArray(apps) ? apps : []);
                const oppMap = {};
                (Array.isArray(oppsList) ? oppsList : []).forEach(o => { oppMap[o._id] = o; });
                setOpportunities(oppMap);
                if (profileData?.photo_url) setProfilePhoto(`http://localhost:8000${profileData.photo_url}`);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStatus = async (appId, status) => {
        try {
            await apiFetch(`/applications/${appId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
            setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
            showToast(`Application ${status} successfully`);
        } catch (err) {
            showToast(err.message || "Failed to update status", "error");
        }
    };

    const filtered = applications.filter(app => {
        if (statusFilter !== "All" && app.status !== statusFilter.toLowerCase()) return false;
        if (searchQuery && !(app.volunteer_name || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const counts = {
        All: applications.length,
        Pending: applications.filter(a => a.status === "pending").length,
        Accepted: applications.filter(a => a.status === "accepted").length,
        Rejected: applications.filter(a => a.status === "rejected").length,
    };

    if (loading) return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "var(--color-ngo)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
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
                    role="NGO" 
                    profilePhoto={profilePhoto} 
                    activePage="applications" 
                />

                <main className="content-inner">
                    <div className="page-header" style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px" }}>Applications</h2>
                        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Manage volunteer applications for your opportunities.</p>
                    </div>

                    <div className="applications-filter-bar">
                        <div className="search-wrapper" style={{ position: "relative", flex: 1, minWidth: 200 }}>
                            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="text" placeholder="Search volunteers..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14 }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: "10px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14, background: "white" }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <button onClick={() => { setSearchQuery(""); setStatusFilter("All"); }} className="text-btn" style={{ whiteSpace: "nowrap" }}>
                                <RotateCcw size={14} /> Reset
                            </button>
                        </div>
                    </div>

                    <div className="status-tabs">
                        {["All", "Pending", "Accepted", "Rejected"].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setStatusFilter(tab)}
                                className={`status-tab ${statusFilter === tab ? "active" : ""}`}
                            >
                                {tab} ({counts[tab]})
                            </button>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {filtered.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: "center", padding: "64px 32px" }}>
                                <Inbox size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
                                <p style={{ color: "var(--text-muted)", fontSize: 16, fontWeight: 600 }}>No applications matched your filters.</p>
                            </div>
                        ) : (
                            filtered.map(app => {
                                const sc = app.status === "accepted" ? { bg: "var(--color-ngo-soft)", color: "var(--color-ngo)" } : 
                                           app.status === "rejected" ? { bg: "#fee2e2", color: "#dc2626" } : 
                                           { bg: "#fef3c7", color: "#d97706" };
                                return (
                                    <div key={app._id} className="glass-card" style={{ padding: 24 }}>
                                        <div className="app-card-header">
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>
                                                    {app.opportunity_title || "SkillBridge Opportunity"}
                                                </h3>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)" }}>
                                                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{app.volunteer_name || "Anonymous Volunteer"}</span>
                                                    <span>&bull;</span>
                                                    <span>Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Just now"}</span>
                                                </div>
                                            </div>
                                            <span style={{
                                                background: sc.bg, color: sc.color,
                                                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                                textTransform: "capitalize"
                                            }}>{app.status}</span>
                                        </div>

                                        {app.message && (
                                            <div style={{
                                                background: "var(--background-soft)", borderLeft: "3px solid var(--color-ngo)",
                                                padding: "16px", borderRadius: "0 10px 10px 0", margin: "16px 0", fontSize: 14, color: "#475569", lineHeight: 1.6
                                            }}>
                                                &ldquo;{app.message}&rdquo;
                                            </div>
                                        )}

                                        <div className="app-actions">
                                            {app.status === "pending" && (
                                                <>
                                                    <button onClick={() => handleStatus(app._id, "accepted")} className="action-btn-primary" style={{ background: "var(--color-ngo)" }}>
                                                        <Check size={16} /> Accept
                                                    </button>
                                                    <button onClick={() => handleStatus(app._id, "rejected")} className="text-btn danger">
                                                        <X size={16} /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {app.status === "accepted" && (
                                                <Link to="/ngo-messages" className="link-btn">
                                                    <MessageSquare size={16} /> Contact Volunteer
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>

                {toast && (
                    <div style={{
                        position: "fixed", bottom: 24, right: 24, padding: "14px 24px", borderRadius: 10,
                        background: toast.type === "error" ? "#fee2e2" : "var(--color-ngo-soft)",
                        color: toast.type === "error" ? "#dc2626" : "var(--color-ngo)",
                        fontWeight: 700, fontSize: 14, zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}>{toast.msg}</div>
                )}
            </div>
        </div>
    );
};

export default NGOApplications;
