import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const VolunteerDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const responseData = await apiFetch("/dashboard/volunteer", { method: "GET" });
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
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "40px", fontFamily: "Arial, sans-serif" }}>
                <h1 style={{ color: "#333" }}>{data.name}'s Dashboard</h1>

                <div style={{ background: "#f0f8ff", padding: "20px", borderRadius: "10px", marginTop: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>Profile Summary</h3>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Location:</strong> {data.location || "Not specified"}</p>
                    <p><strong>Bio:</strong> {data.bio || "No bio added yet."}</p>

                    <h4>Skills</h4>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {data.skills && data.skills.length > 0 ? (
                            data.skills.map(skill => (
                                <span key={skill} style={{ background: "#007bff", color: "white", padding: "5px 10px", borderRadius: "15px", fontSize: "14px" }}>
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p>No skills added.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
