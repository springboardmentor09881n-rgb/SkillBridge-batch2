import { AlertCircle, ArrowLeft, Briefcase, Building2, CheckCircle, Clock, FileText, MapPin, Plus, Save, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";
import "./OpportunityForm.css";

const EditOpportunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: "",
        location: "",
        status: "Open"
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [profilePhoto, setProfilePhoto] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        apiFetch(`/opportunities/${id}`, { method: "GET" })
            .then(data => {
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    duration: data.duration || "",
                    location: data.location || "",
                    status: data.status || "Open"
                });
                setSkills(data.required_skills || []);
            })
            .catch(err => setError("Failed to load opportunity: " + err.message))
            .finally(() => setLoading(false));

        apiFetch("/dashboard/ngo", { method: "GET" })
            .then(d => { if (d?.photo_url) setProfilePhoto(`${PUBLIC_BASE_URL}${d.photo_url}`); })
            .catch(() => {});
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setSkillInput("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const payload = { ...formData, required_skills: skills };
            await apiFetch(`/opportunities/${id}`, { method: "PUT", body: JSON.stringify(payload) });
            setSuccess("Opportunity updated successfully!");
            setTimeout(() => navigate("/manage-opportunities"), 1500);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="layout-wrapper">
             <Sidebar />
             <div className="main-container">
                 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <div className="spinner" style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "var(--color-ngo)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                 </div>
             </div>
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
                    <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                        <button onClick={() => navigate("/manage-opportunities")} className="text-btn" style={{ padding: "8px", border: "1px solid var(--border-common)", borderRadius: 10 }}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Edit Opportunity</h2>
                            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Update the details of your volunteering role.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="toast error" style={{ padding: "12px 20px", borderRadius: 10, background: "#fee2e2", color: "#dc2626", marginBottom: 20, fontWeight: 700, border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="toast success" style={{ padding: "12px 20px", borderRadius: 10, background: "var(--color-ngo-soft)", color: "var(--color-ngo)", marginBottom: 20, fontWeight: 700, border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 8 }}>
                            <CheckCircle size={18} /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="opp-form-container">
                        <section className="form-section">
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                                <Briefcase size={18} color="var(--color-ngo)" />
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Role Details</h3>
                            </div>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Opportunity Title</label>
                                <div className="input-with-icon">
                                    <Sparkles size={16} style={{ position: "absolute", left: 12, color: "var(--text-muted)" }} />
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14, background: "#f8fafc" }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14, background: "#f8fafc", resize: "none" }} />
                            </div>

                            <div className="opp-grid">
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Estimated Duration</label>
                                    <div className="input-with-icon">
                                        <Clock size={16} style={{ position: "absolute", left: 12, color: "var(--text-muted)" }} />
                                        <input type="text" name="duration" value={formData.duration} onChange={handleChange} required style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14, background: "#f8fafc" }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Location</label>
                                    <div className="input-with-icon">
                                        <MapPin size={16} style={{ position: "absolute", left: 12, color: "var(--text-muted)" }} />
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} required style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14, background: "#f8fafc" }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 20 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14, background: "white" }}>
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </section>

                        <section className="form-section">
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                                <Sparkles size={18} color="var(--color-ngo)" />
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Required Skills</h3>
                            </div>
                            
                            <div className="skill-input-row" style={{ marginBottom: 16 }}>
                                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add another skill..." style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14 }} />
                                <button type="button" onClick={addSkill} className="action-btn-primary" style={{ background: "var(--color-ngo)", padding: "10px 24px" }}>Add</button>
                            </div>

                            <div className="skills-wrapper">
                                {skills.map(skill => (
                                    <span key={skill} className="skill-tag" style={{ background: "var(--color-ngo-soft)", color: "var(--color-ngo)", border: "1px solid #bbf7d0", padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
                                        {skill}
                                        <X size={14} onClick={() => removeSkill(skill)} style={{ cursor: "pointer", opacity: 0.7 }} />
                                    </span>
                                ))}
                            </div>
                        </section>

                        <div className="form-actions">
                            <Link to="/manage-opportunities" className="text-btn" style={{ padding: "11px 24px", textDecoration: "none", display: "flex", alignItems: "center" }}>Cancel</Link>
                            <button type="submit" disabled={submitting} className="action-btn-primary" style={{ background: "var(--color-ngo)", padding: "11px 32px", display: "flex", alignItems: "center", gap: 8 }}>
                                <Save size={18} /> {submitting ? "Updating..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default EditOpportunity;
