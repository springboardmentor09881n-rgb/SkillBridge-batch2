import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../services/api";

const OpportunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchOpp = async () => {
            try {
                const [data, apps] = await Promise.all([
                    apiFetch(`/opportunities/${id}`, { method: "GET" }),
                    user?.role === "Volunteer"
                        ? apiFetch("/applications/volunteer", { method: "GET" }).catch(() => [])
                        : Promise.resolve([])
                ]);
                setOpportunity(data);
                if (Array.isArray(apps) && apps.some(a => a.opportunity_id === id)) {
                    setApplied(true);
                }
            } catch (err) {
                console.error("Failed to fetch opportunity:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOpp();
    }, [id, user]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!user || user.role !== "Volunteer") {
            alert("Please log in as a volunteer to apply.");
            navigate("/login");
            return;
        }
        setApplying(true);
        try {
            await apiFetch("/applications", {
                method: "POST",
                body: JSON.stringify({ opportunity_id: id, message })
            });
            setApplied(true);
            alert("Application submitted successfully!");
        } catch (err) {
            alert(err.message || "Failed to apply.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
                <Sidebar />
                <div style={{ flex: 1, padding: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
                <Sidebar />
                <div style={{ flex: 1, padding: "40px" }}>
                    <p style={{ color: "#e74c3c" }}>Opportunity not found.</p>
                    <Link to={user?.role === "NGO" ? "/manage-opportunities" : "/volunteer-opportunities"}>Back to Opportunities</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", fontFamily: "system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "32px" }}>
                <Link to={user?.role === "NGO" ? "/manage-opportunities" : "/volunteer-opportunities"} style={{ display: "inline-block", marginBottom: "24px", color: "#2563eb", textDecoration: "none", fontWeight: "500" }}>
                    ← Back to Opportunities
                </Link>

                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "32px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    maxWidth: "700px"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>{opportunity.title}</h1>
                        <span style={{
                            background: opportunity.status === "Open" ? "#dcfce7" : "#fef3c7",
                            color: opportunity.status === "Open" ? "#16a34a" : "#d97706",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "500"
                        }}>{opportunity.status || "Open"}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>NGO ID: {opportunity.ngo_id || "—"}</p>
                    <p style={{ fontSize: "16px", color: "#4b5563", lineHeight: 1.7, marginBottom: "20px" }}>{opportunity.description}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                        {opportunity.required_skills?.map(skill => (
                            <span key={skill} style={{
                                background: "#eff6ff",
                                color: "#2563eb",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "14px"
                            }}>{skill}</span>
                        ))}
                    </div>
                    <div style={{ fontSize: "15px", color: "#6b7280", marginBottom: "24px" }}>
                        <p><strong>Location:</strong> {opportunity.location || "—"}</p>
                        <p><strong>Duration:</strong> {opportunity.duration || "—"}</p>
                    </div>

                    {user?.role === "Volunteer" && opportunity.status === "Open" && (
                        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
                            {applied ? (
                                <p style={{ color: "#16a34a", fontWeight: "600" }}>You have applied to this opportunity.</p>
                            ) : (
                                <form onSubmit={handleApply}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>Message (optional)</label>
                                        <textarea
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Why would you like to volunteer for this opportunity?"
                                            rows={4}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                borderRadius: "8px",
                                                border: "1px solid #d1d5db",
                                                fontSize: "14px",
                                                fontFamily: "inherit"
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={applying}
                                        style={{
                                            padding: "12px 24px",
                                            background: "#16a34a",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontWeight: "600",
                                            cursor: applying ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {applying ? "Applying..." : "Apply"}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpportunityDetail;
