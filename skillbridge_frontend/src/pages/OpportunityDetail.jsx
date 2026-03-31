import { AlertCircle, ArrowLeft, CheckCircle, Clock, MapPin, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";
import "./OpportunityDetail.css";

const OpportunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [message, setMessage] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");

    useEffect(() => {
        const fetchOpp = async () => {
            try {
                const [data, apps, profileData] = await Promise.all([
                    apiFetch(`/opportunities/${id}`, { method: "GET" }),
                    user?.role === "Volunteer" ? apiFetch("/applications/volunteer", { method: "GET" }).catch(() => []) : Promise.resolve([]),
                    user ? apiFetch(`/dashboard/${user.role === "NGO" ? "ngo" : "volunteer"}`, { method: "GET" }).catch(() => null) : Promise.resolve(null)
                ]);
                setOpportunity(data);
                if (Array.isArray(apps) && apps.some(a => a.opportunity_id === id)) setApplied(true);
                if (profileData?.photo_url) setProfilePhoto(`${PUBLIC_BASE_URL}${profileData.photo_url}`);
            } catch (err) {
                console.error("Failed to fetch:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOpp();
    }, [id, user]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!user || user.role !== "Volunteer") return navigate("/login");
        setApplying(true);
        try {
            await apiFetch("/applications", { method: "POST", body: JSON.stringify({ opportunity_id: id, message }) });
            setApplied(true);
            alert("Application submitted!");
        } catch (err) {
            alert(err.message || "Failed to apply.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="layout-wrapper">
             <Sidebar />
             <div className="main-container">
                 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <div className="spinner" style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "var(--color-volunteer)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                 </div>
             </div>
        </div>
    );

    if (!opportunity) return <div className="layout-wrapper"><Sidebar /><div className="main-container"><div className="content-inner"><p>Not found.</p></div></div></div>;

    const roleColor = user?.role === "NGO" ? "var(--color-ngo)" : "var(--color-volunteer)";

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role={user?.role || "Guest"} 
                    profilePhoto={profilePhoto} 
                    activePage="opportunities" 
                />

                <main className="content-inner">
                    <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                        <button onClick={() => navigate(-1)} className="text-btn" style={{ padding: "8px", border: "1px solid var(--border-common)", borderRadius: 10 }}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Opportunity Details</h2>
                            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Review all information before applying.</p>
                        </div>
                    </div>

                    <div className="detail-container">
                        <article className="detail-card">
                            <header className="detail-header">
                                <div>
                                    <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{opportunity.title}</h1>
                                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Posted by NGO ID: {opportunity.ngo_id || "—"}</p>
                                </div>
                                <span className={`badge ${opportunity.status}`} style={{
                                    background: opportunity.status === "Open" ? "var(--color-ngo-soft)" : "#fef3c7",
                                    color: opportunity.status === "Open" ? "var(--color-ngo)" : "#d97706",
                                    padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700
                                }}>{opportunity.status || "Open"}</span>
                            </header>

                            <div className="detail-meta-grid">
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <MapPin size={18} color={roleColor} />
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Location</div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{opportunity.location || "Remote"}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Clock size={18} color={roleColor} />
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Duration</div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{opportunity.duration || "Ongoing"}</div>
                                    </div>
                                </div>
                            </div>

                            <section style={{ marginBottom: 32 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Role Description</h3>
                                <div style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                                    {opportunity.description}
                                </div>
                            </section>

                            <section style={{ marginBottom: 32 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Required Skills</h3>
                                <div className="skills-wrapper">
                                    {opportunity.required_skills?.map(skill => (
                                        <span key={skill} className="skill-tag" style={{ background: "var(--background-soft)", color: "var(--text-main)", border: "1px solid var(--border-common)" }}>
                                            <Sparkles size={12} color={roleColor} /> {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {user?.role === "Volunteer" && opportunity.status === "Open" && (
                                <section className="apply-form">
                                    {applied ? (
                                        <div style={{ background: "var(--color-ngo-soft)", padding: "16px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, color: "var(--color-ngo)", fontWeight: 700 }}>
                                            <CheckCircle size={20} /> You have successfully applied for this role.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleApply}>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Apply for this Role</h3>
                                            <div style={{ marginBottom: 20 }}>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Introduce yourself (optional)</label>
                                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows="4" placeholder="Tell the NGO why you are interested..." style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1.5px solid var(--border-common)", fontSize: 14, background: "#f8fafc", outline: "none" }} />
                                            </div>
                                            <button type="submit" disabled={applying} className="action-btn-primary" style={{ background: "var(--color-volunteer)", padding: "12px 32px", display: "flex", alignItems: "center", gap: 8 }}>
                                                <Send size={18} /> {applying ? "Submitting..." : "Submit Application"}
                                            </button>
                                        </form>
                                    )}
                                </section>
                            )}
                        </article>
                    </div>
                </main>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default OpportunityDetail;
