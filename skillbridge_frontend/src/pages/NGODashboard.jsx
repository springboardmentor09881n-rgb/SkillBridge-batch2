import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

    const profilePhoto = data.photo_url ? `http://localhost:8000${data.photo_url}` : "";

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
                        <Link to="/ngo-dashboard" style={{ textDecoration: "none", color: "#374151", fontWeight: "600", fontSize: "15px", borderBottom: "2px solid #374151", paddingBottom: "2px" }}>Dashboard</Link>
                        <Link to="/manage-opportunities" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Opportunities</Link>
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
        </div>
    );
};

export default NGODashboard;
