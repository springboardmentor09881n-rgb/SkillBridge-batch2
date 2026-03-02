import { Bell, MessageSquare, PlusCircle, User } from "lucide-react";
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

                <main style={{ flex: 1, padding: "24px 32px", display: "flex", gap: "24px" }}>
                    {/* Left Sidebar - Org Profile */}
                    <aside style={{
                        width: "260px",
                        flexShrink: 0,
                        background: "#f3f4f6",
                        borderRadius: "12px",
                        padding: "24px",
                        height: "fit-content"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                            <div style={{
                                width: "56px", height: "56px", borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "#e5e7eb",
                                flexShrink: 0, overflow: "hidden",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                {!profilePhoto && <User size={24} color="#9ca3af" />}
                            </div>
                            <div>
                                <h3 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "600", color: "#374151" }}>{data.organization_name}</h3>
                                <span style={{ fontSize: "13px", color: "#9ca3af" }}>NGO</span>
                            </div>
                        </div>

                        {/* Organization Info */}
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", fontWeight: "600" }}>Organization Info</h4>
                            <p style={{ fontSize: "13px", color: "#374151", margin: "0 0 6px 0" }}><strong>Email:</strong> {data.email}</p>
                            {data.organization_description && (
                                <p style={{ fontSize: "13px", color: "#374151", margin: "0 0 6px 0" }}><strong>About:</strong> {data.organization_description}</p>
                            )}
                            {data.website_url && (
                                <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}><strong>Web:</strong> <a href={data.website_url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>{data.website_url}</a></p>
                            )}
                        </div>

                        {/* Activity */}
                        <div>
                            <h4 style={{ fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", fontWeight: "600" }}>Activity</h4>
                            <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>No recent activity</p>
                        </div>
                    </aside>

                    {/* Right Content */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Overview */}
                        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
                            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700", color: "#111827" }}>Overview</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                                    <p style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a", margin: "0 0 4px 0" }}>{data.active_opportunities}</p>
                                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Active Opportunities</p>
                                </div>
                                <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                                    <p style={{ fontSize: "28px", fontWeight: "700", color: "#9333ea", margin: "0 0 4px 0" }}>0</p>
                                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Applications</p>
                                </div>
                                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                                    <p style={{ fontSize: "28px", fontWeight: "700", color: "#ea580c", margin: "0 0 4px 0" }}>0</p>
                                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Active Volunteers</p>
                                </div>
                                <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                                    <p style={{ fontSize: "28px", fontWeight: "700", color: "#ca8a04", margin: "0 0 4px 0" }}>0</p>
                                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Pending Applications</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Applications */}
                        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }}>Recent Applications</h3>
                                <Link to="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: "13px", fontWeight: "500", border: "1px solid #e5e7eb", padding: "4px 12px", borderRadius: "6px" }}>View All</Link>
                            </div>
                            <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>No recent applications yet.</p>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
                            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700", color: "#111827" }}>Quick Actions</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <Link to="/create-opportunity" style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    padding: "24px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white",
                                    textDecoration: "none", color: "#374151", gap: "10px", cursor: "pointer",
                                    transition: "box-shadow 0.2s"
                                }}>
                                    <PlusCircle size={28} color="#6b7280" />
                                    <span style={{ fontWeight: "600", fontSize: "14px" }}>Create New Opportunity</span>
                                </Link>
                                <Link to="#" style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    padding: "24px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white",
                                    textDecoration: "none", color: "#374151", gap: "10px", cursor: "pointer",
                                    transition: "box-shadow 0.2s"
                                }}>
                                    <MessageSquare size={28} color="#6b7280" />
                                    <span style={{ fontWeight: "600", fontSize: "14px" }}>View Messages</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NGODashboard;
