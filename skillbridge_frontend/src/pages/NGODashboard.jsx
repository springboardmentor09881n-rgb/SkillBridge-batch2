import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const NGODashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const responseData = await apiFetch("/dashboard/ngo", { method: "GET" });
                setData(responseData);
            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (!data) return <div>Error loading data.</div>;

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "40px", fontFamily: "Arial, sans-serif", background: "#f5f7fa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
                    {data.photo_url ? (
                        <img src={`http://localhost:8000${data.photo_url}`} alt="Profile" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#9ca3af" }}>🏢</div>
                    )}
                    <h1 style={{ margin: 0 }}>Welcome, {data.organization_name}</h1>
                </div>

                <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
                    <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" }}>
                        <h3 style={{ color: "#666" }}>Total Opportunities Posted</h3>
                        <h1 style={{ color: "#2c3e50" }}>{data.total_opportunities_posted}</h1>
                    </div>
                    <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" }}>
                        <h3 style={{ color: "#666" }}>Active Opportunities</h3>
                        <h1 style={{ color: "#27ae60" }}>{data.active_opportunities}</h1>
                    </div>
                </div>

                <div style={{ background: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginTop: "30px" }}>
                    <h3>Organization Profile Info</h3>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Description:</strong> {data.organization_description || "No description provided."}</p>
                    <p><strong>Website:</strong> {data.website_url ? <a href={data.website_url} target="_blank" rel="noreferrer">{data.website_url}</a> : "Not specified"}</p>

                    <div style={{ marginTop: "20px" }}>
                        <button
                            onClick={() => navigate("/create-opportunity")}
                            style={{ padding: "10px 20px", background: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                            ➕ Create New Opportunity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;
