import { Bell, Clock, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const ManageOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profilePhoto, setProfilePhoto] = useState("");
    const [activeTab, setActiveTab] = useState("All");

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

        try {
            await apiFetch(`/opportunities/${id}`, { method: "DELETE" });
            alert("Opportunity deleted successfully");
            fetchOpportunities(); // refresh list
        } catch (error) {
            alert("Failed to delete opportunity: " + error.message);
        }
    };

    const toggleStatus = async (opp) => {
        try {
            const newStatus = opp.status === "Open" ? "Closed" : "Open";
            await apiFetch(`/opportunities/${opp._id}`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus })
            });
            alert(`Status changed to ${newStatus}`);
            fetchOpportunities();
        } catch (error) {
            alert("Failed to update status: " + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", fontFamily: "system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Top Navigation Bar */}
                <header style={{
                    background: "white",
                    padding: "16px 32px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#000", margin: 0 }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                        <Link to="/ngo-dashboard" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Dashboard</Link>
                        <Link to="/manage-opportunities" style={{ textDecoration: "none", color: "#374151", fontWeight: "600", fontSize: "15px", borderBottom: "2px solid #374151", paddingBottom: "2px" }}>Opportunities</Link>
                        <Link to="#" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Applications</Link>
                        <Link to="#" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Messages</Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "8px", paddingLeft: "20px", borderLeft: "1.5px solid #e5e7eb" }}>
                            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "9999px", letterSpacing: "0.025em", lineHeight: "1" }}>Ngo</span>
                            <Bell size={20} color="#9ca3af" style={{ cursor: "pointer" }} />
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "#e5e7eb",
                                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                            }}>
                                {!profilePhoto && <User size={18} color="#9ca3af" />}
                            </div>
                        </div>
                    </nav>
                </header>

                <div style={{ padding: "32px" }}>
                    {/* Title section */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                        <div>
                            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>Your Opportunities</h2>
                            <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Manage your volunteering opportunities</p>
                        </div>
                        <Link to="/create-opportunity" style={{
                            background: "#16a34a", color: "white", padding: "10px 20px", borderRadius: "8px",
                            textDecoration: "none", display: "flex", alignItems: "center", gap: "8px",
                            fontWeight: "600", fontSize: "14px"
                        }}>
                            + Create New Opportunity
                        </Link>
                    </div>

                    {/* Tabs + filter */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {["All", "Open", "Closed"].map(tab => {
                                const count = tab === "All" ? opportunities.length
                                    : opportunities.filter(o => o.status === tab).length;
                                return (
                                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                        padding: "6px 16px", borderRadius: "20px",
                                        border: activeTab === tab ? "2px solid #3b82f6" : "1px solid #d1d5db",
                                        background: activeTab === tab ? "#eff6ff" : "white",
                                        color: activeTab === tab ? "#3b82f6" : "#374151",
                                        cursor: "pointer", fontWeight: "500", fontSize: "14px"
                                    }}>
                                        {tab} ({count})
                                    </button>
                                );
                            })}
                        </div>
                        <select style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", color: "#374151", fontSize: "14px", background: "white" }}>
                            <option>All Opportunities</option>
                        </select>
                    </div>

                    {/* Opportunity Cards */}
                    {(activeTab === "All" ? opportunities : opportunities.filter(o => o.status === activeTab)).length === 0 ? (
                        <p style={{ color: "#6b7280" }}>No opportunities found.</p>
                    ) : (
                        (activeTab === "All" ? opportunities : opportunities.filter(o => o.status === activeTab)).map((opp) => (
                            <div key={opp._id} style={{
                                background: "white", border: "1px solid #e5e7eb", borderRadius: "12px",
                                padding: "24px", marginBottom: "16px"
                            }}>
                                {/* Card header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                    <div>
                                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>{opp.title}</h3>
                                        <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>NGO ID: {opp.ngo_id}</p>
                                    </div>
                                    <span
                                        onClick={() => toggleStatus(opp)}
                                        title={`Click to mark as ${opp.status === "Open" ? "Closed" : "Open"}`}
                                        style={{
                                            background: opp.status === "Open" ? "#f0fdf4" : "#fef2f2",
                                            color: opp.status === "Open" ? "#16a34a" : "#dc2626",
                                            border: `1px solid ${opp.status === "Open" ? "#bbf7d0" : "#fecaca"}`,
                                            padding: "4px 14px", borderRadius: "9999px", fontSize: "13px",
                                            fontWeight: "500", cursor: "pointer"
                                        }}>
                                        {opp.status}
                                    </span>
                                </div>

                                {/* Description */}
                                {opp.description && (
                                    <p style={{ color: "#4b5563", margin: "12px 0", lineHeight: "1.5", fontSize: "14px" }}>{opp.description}</p>
                                )}

                                {/* Skill tags */}
                                {opp.required_skills?.length > 0 && (
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                                        {opp.required_skills.map((skill, i) => (
                                            <span key={i} style={{
                                                background: "#dbeafe", color: "#2563eb",
                                                padding: "4px 12px", borderRadius: "9999px",
                                                fontSize: "13px", fontWeight: "500"
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Location + Duration */}
                                <div style={{ display: "flex", gap: "20px", color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>
                                    {opp.location && (
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <MapPin size={14} /> {opp.location}
                                        </span>
                                    )}
                                    {opp.duration && (
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Clock size={14} /> {opp.duration}
                                        </span>
                                    )}
                                </div>

                                {/* Footer actions */}
                                <div style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    borderTop: "1px solid #f3f4f6", paddingTop: "12px"
                                }}>
                                    <Link to={`/opportunity/${opp._id}`} style={{
                                        color: "#374151", textDecoration: "none", fontSize: "14px", fontWeight: "500"
                                    }}>
                                        View details &gt;
                                    </Link>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <Link to={`/opportunity/${opp._id}`} style={{
                                            border: "1px solid #e5e7eb", padding: "6px 20px", borderRadius: "6px",
                                            background: "white", fontSize: "14px", color: "#374151", textDecoration: "none"
                                        }}>
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(opp._id)} style={{
                                            border: "1px solid #fecaca", padding: "6px 16px", borderRadius: "6px",
                                            background: "#fef2f2", cursor: "pointer", fontSize: "14px", color: "#dc2626"
                                        }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageOpportunities;
