import { Building2, Check, Inbox, MessageSquare, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

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

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <header style={{
                    background: "white", padding: "14px 32px", borderBottom: "1px solid #e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {[
                            { to: "/ngo-dashboard", label: "Dashboard" },
                            { to: "/manage-opportunities", label: "Opportunities" },
                            { to: "/ngo-applications", label: "Applications", active: true },
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
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Applications</h2>
                        <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Manage volunteer applications for your opportunities</p>
                    </div>

                    {/* Search & Filter */}
                    <div style={{
                        background: "white", borderRadius: 12, padding: "16px 20px", marginBottom: 20,
                        border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
                    }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                            <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 10, top: 10 }} />
                            <input
                                type="text" placeholder="Search volunteers..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: "100%", padding: "8px 8px 8px 32px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
                            />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, background: "white" }}>
                            <option value="All">All Applications</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <button onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
                            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#374151" }}>
                            🔄 Reset
                        </button>
                    </div>

                    {/* Status Tabs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                        {["All", "Pending", "Accepted", "Rejected"].map(tab => (
                            <button key={tab} onClick={() => setStatusFilter(tab)} style={{
                                padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer",
                                background: statusFilter === tab ? "#eff6ff" : "white",
                                color: statusFilter === tab ? "#2563eb" : "#64748b",
                                border: `1px solid ${statusFilter === tab ? "#bfdbfe" : "#e5e7eb"}`
                            }}>{tab} ({counts[tab]})</button>
                        ))}
                    </div>

                    {/* Applications List */}
                    {loading ? (
                        <div style={{ textAlign: "center", padding: 48 }}>
                            <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                            <p style={{ color: "#64748b", fontSize: 14 }}>Loading applications...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: "64px 32px",
                            textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #faf5ff, #ede9fe)",
                                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
                            }}>
                                <Inbox size={28} color="#7c3aed" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>No applications yet</h3>
                            <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 24px", maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                                When volunteers apply to your opportunities, their applications will appear here for you to review and manage.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {filtered.map(app => {
                                const opp = opportunities[app.opportunity_id];
                                const statusColors = {
                                    pending: { bg: "#fef3c7", color: "#d97706" },
                                    accepted: { bg: "#dcfce7", color: "#16a34a" },
                                    rejected: { bg: "#fee2e2", color: "#dc2626" }
                                };
                                const sc = statusColors[app.status] || statusColors.pending;
                                return (
                                    <div key={app._id} style={{
                                        background: "white", borderRadius: 12, padding: 24,
                                        border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px" }}>
                                                    {app.opportunity_title || opp?.title || "Opportunity"}
                                                </h3>
                                                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                                                    {app.volunteer_name || "Volunteer"} · Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                                                </p>
                                            </div>
                                            <span style={{
                                                background: sc.bg, color: sc.color,
                                                padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                                                textTransform: "capitalize"
                                            }}>{app.status}</span>
                                        </div>

                                        {app.message && (
                                            <div style={{
                                                background: "#f8fafc", borderLeft: "3px solid #2563eb", padding: "12px 16px",
                                                borderRadius: "0 8px 8px 0", margin: "12px 0", fontSize: 14, color: "#4b5563", lineHeight: 1.6
                                            }}>
                                                {app.message}
                                            </div>
                                        )}

                                        {opp?.required_skills && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                                                {opp.required_skills.map(skill => (
                                                    <span key={skill} style={{
                                                        background: "#eff6ff", color: "#2563eb", padding: "4px 10px",
                                                        borderRadius: 16, fontSize: 12, border: "1px solid #bfdbfe"
                                                    }}>{skill}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            {app.status === "pending" && (
                                                <>
                                                    <button onClick={() => handleStatus(app._id, "accepted")} style={{
                                                        padding: "6px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
                                                        background: "white", fontSize: 13, fontWeight: 500, cursor: "pointer",
                                                        display: "flex", alignItems: "center", gap: 4, color: "#374151"
                                                    }}><Check size={14} /> Accept</button>
                                                    <button onClick={() => handleStatus(app._id, "rejected")} style={{
                                                        padding: "6px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
                                                        background: "white", fontSize: 13, fontWeight: 500, cursor: "pointer",
                                                        display: "flex", alignItems: "center", gap: 4, color: "#374151"
                                                    }}><X size={14} /> Reject</button>
                                                </>
                                            )}
                                            <Link to="/ngo-messages" style={{
                                                padding: "6px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
                                                background: "white", fontSize: 13, fontWeight: 500, textDecoration: "none",
                                                display: "flex", alignItems: "center", gap: 4, color: "#374151"
                                            }}><MessageSquare size={14} /> Message</Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* Toast */}
                {toast && (
                    <div style={{
                        position: "fixed", bottom: 24, right: 24, padding: "14px 24px", borderRadius: 10,
                        background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
                        color: toast.type === "error" ? "#dc2626" : "#16a34a",
                        fontWeight: 600, fontSize: 14, zIndex: 2000, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}>{toast.msg}</div>
                )}
            </div>
        </div>
    );
};

export default NGOApplications;
