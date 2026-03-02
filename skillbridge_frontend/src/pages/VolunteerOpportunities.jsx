import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import { Search, Bell, User } from "lucide-react";

const VolunteerOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        const fetchOpps = async () => {
            try {
                const data = await apiFetch("/opportunities", { method: "GET" });
                setOpportunities(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch opportunities:", err);
                setOpportunities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOpps();
    }, []);

    const openCount = opportunities.filter(o => o.status === "Open").length;
    const closedCount = opportunities.filter(o => o.status === "Closed").length;
    const filteredOpps = filter === "All" ? opportunities
        : filter === "Open" ? opportunities.filter(o => o.status === "Open")
        : opportunities.filter(o => o.status === "Closed");

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", fontFamily: "system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <header style={{
                    background: "white",
                    padding: "16px 32px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <Link to="/volunteer-dashboard" style={{ textDecoration: "none", color: "#4b5563", fontWeight: "500" }}>Dashboard</Link>
                        <Link to="/volunteer-opportunities" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "600" }}>Opportunities</Link>
                        <Link to="/volunteer-applications" style={{ textDecoration: "none", color: "#4b5563", fontWeight: "500" }}>Applications</Link>
                        <Link to="/volunteer-messages" style={{ textDecoration: "none", color: "#4b5563", fontWeight: "500" }}>Messages</Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Bell size={20} color="#6b7280" />
                            <User size={20} color="#6b7280" />
                        </div>
                    </nav>
                </header>

                <main style={{ padding: "32px" }}>
                    <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>Find Opportunities</h2>
                    <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "20px" }}>Discover volunteering opportunities that match your skills and interests.</p>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        {["All", "Open", "Closed"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: filter === f ? "2px solid #2563eb" : "1px solid #e5e7eb",
                                    background: filter === f ? "#eff6ff" : "white",
                                    color: filter === f ? "#2563eb" : "#4b5563",
                                    fontWeight: "500",
                                    cursor: "pointer"
                                }}
                            >
                                {f} ({f === "All" ? opportunities.length : f === "Open" ? openCount : closedCount})
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p>Loading opportunities...</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {filteredOpps.map(opp => (
                                <div key={opp._id} style={{
                                    background: "white",
                                    borderRadius: "12px",
                                    padding: "24px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    border: "1px solid #e5e7eb"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", margin: 0 }}>{opp.title}</h3>
                                        <span style={{
                                            background: opp.status === "Open" ? "#dcfce7" : "#fef3c7",
                                            color: opp.status === "Open" ? "#16a34a" : "#d97706",
                                            padding: "6px 12px",
                                            borderRadius: "20px",
                                            fontSize: "13px",
                                            fontWeight: "500"
                                        }}>{opp.status || "Open"}</span>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>NGO ID {opp.ngo_id || "—"}</p>
                                    <p style={{ fontSize: "15px", color: "#4b5563", marginBottom: "16px", lineHeight: 1.6 }}>{opp.description}</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                                        {opp.required_skills?.map(skill => (
                                            <span key={skill} style={{
                                                background: "#eff6ff",
                                                color: "#2563eb",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "13px"
                                            }}>{skill}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                            <span>{opp.location || "—"}</span>
                                            <span style={{ margin: "0 8px" }}>•</span>
                                            <span>{opp.duration || "—"}</span>
                                        </div>
                                        <Link to={`/opportunity/${opp._id}`} style={{
                                            color: "#2563eb",
                                            fontWeight: "600",
                                            textDecoration: "none",
                                            fontSize: "14px"
                                        }}>View details &gt;</Link>
                                    </div>
                                </div>
                            ))}
                            {filteredOpps.length === 0 && (
                                <p style={{ color: "#6b7280", fontSize: "16px" }}>No opportunities found.</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default VolunteerOpportunities;
