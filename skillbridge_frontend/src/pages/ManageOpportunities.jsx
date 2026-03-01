import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const ManageOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "40px", fontFamily: "Arial, sans-serif" }}>
                <h2>Manage Opportunities</h2>

                {opportunities.length === 0 ? (
                    <p>You haven't posted any opportunities yet.</p>
                ) : (
                    <div style={{ display: "grid", gap: "20px" }}>
                        {opportunities.map((opp) => (
                            <div key={opp._id} style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h3>{opp.title}</h3>
                                    <p style={{ margin: "5px 0" }}>{opp.location} • {opp.duration}</p>
                                    <p style={{ margin: "5px 0" }}>Status: <strong style={{ color: opp.status === "Open" ? "green" : "red" }}>{opp.status}</strong></p>
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button onClick={() => toggleStatus(opp)} style={{ padding: "8px 12px", background: opp.status === "Open" ? "#f39c12" : "#2ecc71", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                                        Mark as {opp.status === "Open" ? "Closed" : "Open"}
                                    </button>
                                    <button onClick={() => handleDelete(opp._id)} style={{ padding: "8px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOpportunities;
