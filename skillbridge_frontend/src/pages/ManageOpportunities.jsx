import { Briefcase, Building2, Clock, Eye, MapPin, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import "./ManageOpportunities.css";

const ManageOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profilePhoto, setProfilePhoto] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleting, setDeleting] = useState(null);

    const fetchOpportunities = async () => {
        try {
            const data = await apiFetch("/opportunities/ngo", { method: "GET" });
            setOpportunities(Array.isArray(data) ? data : []);
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
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "var(--color-ngo)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                        <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading opportunities...</p>
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
                    activePage="opportunities" 
                />

                <main className="content-inner">
                    <div className="manage-opps-header">
                        <div>
                            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Your Opportunities</h2>
                            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Manage and track your volunteering opportunities.</p>
                        </div>
                        <div className="create-btn-wrapper">
                            <Link to="/create-opportunity" className="action-btn-primary" style={{ background: "var(--color-ngo)" }}>
                                <PlusCircle size={16} /> New Opportunity
                            </Link>
                        </div>
                    </div>

                    <div className="filters-bar">
                        <div className="tabs-wrapper" style={{ display: "flex", gap: 6 }}>
                            {["All", "Open", "Closed"].map(tab => {
                                const count = tab === "All" ? opportunities.length : opportunities.filter(o => o.status === tab).length;
                                const isActive = activeTab === tab;
                                return (
                                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                        padding: "8px 18px", borderRadius: 8, border: "none",
                                        background: isActive ? "var(--color-ngo)" : "#f1f5f9",
                                        color: isActive ? "white" : "var(--text-muted)",
                                        cursor: "pointer", fontWeight: 600, fontSize: 13,
                                        transition: "all 0.2s"
                                    }}>
                                        {tab} ({count})
                                    </button>
                                );
                            })}
                        </div>
                        <div className="search-wrapper" style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="text" placeholder="Search..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    padding: "9px 14px 9px 38px", borderRadius: 10, border: "1px solid var(--border-common)",
                                    fontSize: 13, outline: "none", width: "100%", background: "#fafbfc"
                                }}
                            />
                        </div>
                    </div>

                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, fontWeight: 500 }}>
                        Showing {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
                    </p>

                    {filtered.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: "center", padding: "48px 32px" }}>
                            <Briefcase size={36} color="#cbd5e1" style={{ marginBottom: 12 }} />
                            <p style={{ color: "var(--text-muted)", fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>No opportunities found.</p>
                            <Link to="/create-opportunity" className="link-btn green">+ Create your first one</Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {filtered.map((opp) => (
                                <div key={opp._id} className="glass-card" style={{ padding: "24px 28px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 12,
                                                background: opp.status === "Open" ? "var(--color-ngo-soft)" : "#fee2e2",
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                            }}>
                                                <Briefcase size={20} color={opp.status === "Open" ? "var(--color-ngo)" : "#dc2626"} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 3px" }}>{opp.title}</h3>
                                                <div style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {opp.location || "Remote"}</span>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {opp.duration || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`badge ${opp.status}`} style={{
                                            padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                            background: opp.status === "Open" ? "var(--color-ngo-soft)" : "#fee2e2",
                                            color: opp.status === "Open" ? "var(--color-ngo)" : "#dc2626"
                                        }}>{opp.status}</span>
                                    </div>

                                    <p style={{ color: "#475569", margin: "0 0 16px", fontSize: 14, lineHeight: 1.6 }}>{opp.description}</p>

                                    <div className="opp-card-actions-row">
                                        <Link to={`/opportunity/${opp._id}`} className="link-btn green">
                                            <Eye size={15} /> Preview Public Page
                                        </Link>
                                        <div className="action-group" style={{ display: "flex", gap: 8 }}>
                                            <Link to={`/edit-opportunity/${opp._id}`} className="text-btn">
                                                <Pencil size={14} /> Edit
                                            </Link>
                                            <button onClick={() => handleDelete(opp._id)} disabled={deleting === opp._id} className="text-btn danger">
                                                <Trash2 size={14} /> {deleting === opp._id ? "..." : "Delete"}
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
