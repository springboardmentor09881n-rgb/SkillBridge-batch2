import { Briefcase, Building2, Clock, Eye, MapPin, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const ManageOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profilePhoto, setProfilePhoto] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [hovered, setHovered] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fetchOpportunities = async () => {
        try {
            const data = await apiFetch("/opportunities/ngo", { method: "GET" });
            setOpportunities(data);
        } catch (error) {
            console.error("Failed to fetch opportunities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
        apiFetch("/dashboard/ngo", { method: "GET" })
            .then(d => { if (d?.photo_url) setProfilePhoto(`http://localhost:8000${d.photo_url}`); })
            .catch(() => {});
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
        setDeleting(id);
        try {
            await apiFetch(`/opportunities/${id}`, { method: "DELETE" });
            fetchOpportunities();
        } catch (error) {
            alert("Failed to delete opportunity: " + error.message);
        } finally {
            setDeleting(null);
        }
    };

    const filtered = (activeTab === "All" ? opportunities : opportunities.filter(o => o.status === activeTab))
        .filter(o => !searchQuery || o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.description?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                    <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading opportunities...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

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
                            { to: "/manage-opportunities", label: "Opportunities", active: true },
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
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dcfce7, #d1fae5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", border: "2px solid #e2e8f0"
                            }}>
                                {!profilePhoto && <Building2 size={18} color="#94a3b8" />}
                            </div>
                        </div>
                    </nav>
                </header>

                <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                    {/* Page Title */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <div>
                            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Your Opportunities</h2>
                            <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Manage and track your volunteering opportunities</p>
                        </div>
                        <Link to="/create-opportunity" style={{
                            background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white",
                            padding: "11px 24px", borderRadius: 10, textDecoration: "none",
                            display: "flex", alignItems: "center", gap: 8,
                            fontWeight: 600, fontSize: 14, boxShadow: "0 2px 10px rgba(22,163,74,0.3)",
                            transition: "all 0.2s"
                        }}>
                            <PlusCircle size={16} /> Create New Opportunity
                        </Link>
                    </div>

                    {/* Filters Row */}
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20,
                        background: "white", padding: "14px 20px", borderRadius: 14, border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                    }}>
                        {/* Tabs */}
                        <div style={{ display: "flex", gap: 6 }}>
                            {["All", "Open", "Closed"].map(tab => {
                                const count = tab === "All" ? opportunities.length
                                    : opportunities.filter(o => o.status === tab).length;
                                const isActive = activeTab === tab;
                                return (
                                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                        padding: "8px 18px", borderRadius: 8, border: "none",
                                        background: isActive ? "#2563eb" : "#f1f5f9",
                                        color: isActive ? "white" : "#64748b",
                                        cursor: "pointer", fontWeight: 600, fontSize: 13,
                                        transition: "all 0.2s"
                                    }}>
                                        {tab} ({count})
                                    </button>
                                );
                            })}
                        </div>
                        {/* Search */}
                        <div style={{ position: "relative" }}>
                            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="text" placeholder="Search opportunities..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    padding: "9px 14px 9px 38px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                                    fontSize: 13, outline: "none", width: 240, background: "#fafbfc",
                                    transition: "all 0.2s"
                                }}
                                onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>
                    </div>

                    {/* Opportunity Count */}
                    <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14, fontWeight: 500 }}>
                        Showing {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
                    </p>

                    {/* Cards */}
                    {filtered.length === 0 ? (
                        <div style={{
                            background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: "48px 32px",
                            textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}>
                            <Briefcase size={36} color="#cbd5e1" style={{ marginBottom: 12 }} />
                            <p style={{ color: "#64748b", fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>No opportunities found</p>
                            <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 20px" }}>
                                {searchQuery ? "Try a different search term" : "Create your first opportunity to get started"}
                            </p>
                            {!searchQuery && (
                                <Link to="/create-opportunity" style={{
                                    display: "inline-flex", alignItems: "center", gap: 8,
                                    background: "#2563eb", color: "white", padding: "10px 24px", borderRadius: 10,
                                    textDecoration: "none", fontSize: 14, fontWeight: 600
                                }}>
                                    <PlusCircle size={16} /> Create Opportunity
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {filtered.map((opp) => (
                                <div key={opp._id}
                                    onMouseEnter={() => setHovered(opp._id)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        background: "white", border: `1.5px solid ${hovered === opp._id ? "#bfdbfe" : "#e2e8f0"}`,
                                        borderRadius: 16, padding: "24px 28px",
                                        boxShadow: hovered === opp._id ? "0 4px 16px rgba(37,99,235,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                                        transition: "all 0.25s ease"
                                    }}
                                >
                                    {/* Card Header */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 12,
                                                background: opp.status === "Open" ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "linear-gradient(135deg, #fef2f2, #fecaca)",
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                            }}>
                                                <Briefcase size={20} color={opp.status === "Open" ? "#16a34a" : "#dc2626"} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 3px", letterSpacing: "-0.01em" }}>{opp.title}</h3>
                                                <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>NGO: {opp.ngo_id}</p>
                                            </div>
                                        </div>
                                        <span style={{
                                            background: opp.status === "Open" ? "#f0fdf4" : "#fef2f2",
                                            color: opp.status === "Open" ? "#16a34a" : "#dc2626",
                                            border: `1px solid ${opp.status === "Open" ? "#bbf7d0" : "#fecaca"}`,
                                            padding: "5px 16px", borderRadius: 20, fontSize: 12,
                                            fontWeight: 600, letterSpacing: "0.02em"
                                        }}>
                                            {opp.status}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {opp.description && (
                                        <p style={{
                                            color: "#475569", margin: "8px 0 14px", lineHeight: 1.6, fontSize: 14,
                                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                        }}>{opp.description}</p>
                                    )}

                                    {/* Skills */}
                                    {opp.required_skills?.length > 0 && (
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                                            {opp.required_skills.map((skill, i) => (
                                                <span key={i} style={{
                                                    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                                                    color: "#2563eb", padding: "5px 14px", borderRadius: 20,
                                                    fontSize: 12, fontWeight: 600, border: "1px solid #bfdbfe"
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Location + Duration */}
                                    <div style={{ display: "flex", gap: 20, color: "#64748b", fontSize: 13, marginBottom: 16 }}>
                                        {opp.location && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <MapPin size={14} color="#94a3b8" /> {opp.location}
                                            </span>
                                        )}
                                        {opp.duration && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <Clock size={14} color="#94a3b8" /> {opp.duration}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        borderTop: "1px solid #f1f5f9", paddingTop: 14
                                    }}>
                                        <Link to={`/opportunity/${opp._id}`} style={{
                                            display: "flex", alignItems: "center", gap: 6,
                                            color: "#2563eb", textDecoration: "none", fontSize: 13, fontWeight: 600,
                                            transition: "all 0.2s"
                                        }}>
                                            <Eye size={15} /> View details
                                        </Link>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <Link to={`/edit-opportunity/${opp._id}`} style={{
                                                display: "flex", alignItems: "center", gap: 6,
                                                border: "1px solid #e2e8f0", padding: "7px 18px", borderRadius: 8,
                                                background: "white", fontSize: 13, fontWeight: 600, color: "#475569",
                                                textDecoration: "none", transition: "all 0.2s"
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "white"; }}
                                            >
                                                <Pencil size={14} /> Edit
                                            </Link>
                                            <button onClick={() => handleDelete(opp._id)} disabled={deleting === opp._id}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 6,
                                                    border: "1px solid #fecaca", padding: "7px 18px", borderRadius: 8,
                                                    background: deleting === opp._id ? "#fecaca" : "#fef2f2",
                                                    cursor: deleting === opp._id ? "not-allowed" : "pointer",
                                                    fontSize: 13, fontWeight: 600, color: "#dc2626",
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseEnter={e => { if (deleting !== opp._id) { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#f87171"; } }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }}
                                            >
                                                <Trash2 size={14} /> {deleting === opp._id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ManageOpportunities;
