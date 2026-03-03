import { AlertCircle, ArrowLeft, Briefcase, Building2, CheckCircle, ChevronDown, Clock, FileText, MapPin, Plus, Save, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

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
    const [focusField, setFocusField] = useState("");
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
            .then(d => { if (d?.photo_url) setProfilePhoto(`http://localhost:8000${d.photo_url}`); })
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
            const payload = {
                ...formData,
                required_skills: skills
            };

            await apiFetch(`/opportunities/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            setSuccess("Opportunity updated successfully!");
            setTimeout(() => navigate("/manage-opportunities"), 1500);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    const inputStyle = (field) => ({
        width: "100%", padding: "11px 14px 11px 42px", borderRadius: 10, fontSize: 14, boxSizing: "border-box",
        border: `1.5px solid ${focusField === field ? "#2563eb" : "#e2e8f0"}`,
        outline: "none", transition: "all 0.2s",
        boxShadow: focusField === field ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
        background: "#fafbfc", color: "#0f172a"
    });

    const labelStyle = {
        display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 8
    };

    if (loading) return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                    <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Loading opportunity...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <header style={{
                    background: "white", padding: "14px 32px", borderBottom: "1px solid #e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {[
                            { to: "/ngo-dashboard", label: "Dashboard" },
                            { to: "/manage-opportunities", label: "Opportunities", active: true },
                            { to: "/ngo-applications", label: "Applications" },
                            { to: "/ngo-messages", label: "Messages" }
                        ].map(link => (
                            <Link key={link.label} to={link.to} style={{
                                textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                                color: link.active ? "#2563eb" : "#64748b",
                                background: link.active ? "#eff6ff" : "transparent",
                                transition: "all 0.2s"
                            }}>{link.label}</Link>
                        ))}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 12, paddingLeft: 16, borderLeft: "1.5px solid #e2e8f0" }}>
                            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.03em" }}>NGO</span>
                            <NotificationBell />
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dcfce7, #d1fae5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", border: "2px solid #e2e8f0"
                            }}>
                                {!profilePhoto && <Building2 size={18} color="#94a3b8" />}
                            </div>
                        </div>
                    </nav>
                </header>

                <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                    {/* Page Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                        <button onClick={() => navigate("/manage-opportunities")} style={{
                            width: 38, height: 38, borderRadius: 10, border: "1px solid #e2e8f0", background: "white",
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                            transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                        >
                            <ArrowLeft size={18} color="#475569" />
                        </button>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Edit Opportunity</h2>
                            <p style={{ fontSize: 14, color: "#94a3b8", margin: "2px 0 0" }}>Update the details of your volunteer opportunity</p>
                        </div>
                    </div>

                    {/* Toast messages */}
                    {error && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", marginBottom: 20,
                            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, maxWidth: 720
                        }}>
                            <AlertCircle size={18} color="#ef4444" />
                            <span style={{ fontSize: 14, color: "#dc2626", fontWeight: 500 }}>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", marginBottom: 20,
                            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, maxWidth: 720
                        }}>
                            <CheckCircle size={18} color="#16a34a" />
                            <span style={{ fontSize: 14, color: "#16a34a", fontWeight: 500 }}>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Basic Info Card */}
                        <div style={{
                            background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Briefcase size={16} color="#2563eb" />
                                </div>
                                Basic Information
                            </h3>

                            {/* Title */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>
                                    <FileText size={14} color="#64748b" /> Title
                                </label>
                                <div style={{ position: "relative" }}>
                                    <Briefcase size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                        placeholder="e.g. Website Redesign for Community Center"
                                        onFocus={() => setFocusField("title")} onBlur={() => setFocusField("")}
                                        style={inputStyle("title")} />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label style={labelStyle}>
                                    <FileText size={14} color="#64748b" /> Description
                                </label>
                                <div style={{ position: "relative" }}>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="5"
                                        placeholder="Describe the opportunity — goals, responsibilities, and impact..."
                                        onFocus={() => setFocusField("desc")} onBlur={() => setFocusField("")}
                                        style={{
                                            ...inputStyle("desc"), paddingLeft: 14, resize: "vertical", minHeight: 120,
                                            lineHeight: 1.6
                                        }} />
                                </div>
                                <div style={{ textAlign: "right", fontSize: 12, color: formData.description.length > 1000 ? "#ef4444" : "#94a3b8", marginTop: 4 }}>
                                    {formData.description.length}/1000
                                </div>
                            </div>
                        </div>

                        {/* Skills Card */}
                        <div style={{
                            background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Sparkles size={16} color="#7c3aed" />
                                </div>
                                Required Skills
                            </h3>

                            {skills.length > 0 && (
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                                    {skills.map((skill, i) => (
                                        <span key={i} style={{
                                            background: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#2563eb",
                                            padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                                            display: "flex", alignItems: "center", gap: 8,
                                            border: "1px solid #bfdbfe", transition: "all 0.2s"
                                        }}>
                                            {skill}
                                            <X size={14} onClick={() => removeSkill(skill)} style={{
                                                cursor: "pointer", background: "rgba(37,99,235,0.15)", borderRadius: "50%", padding: 2
                                            }} />
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 10 }}>
                                <div style={{ flex: 1, position: "relative" }}>
                                    <Sparkles size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                                    <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                        placeholder="Type a skill and press Enter"
                                        onFocus={() => setFocusField("skill")} onBlur={() => setFocusField("")}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                        style={inputStyle("skill")} />
                                </div>
                                <button type="button" onClick={addSkill} style={{
                                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
                                    border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 600, fontSize: 14,
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                                    boxShadow: "0 2px 8px rgba(124,58,237,0.25)"
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            {skills.length === 0 && (
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "10px 0 0", fontStyle: "italic" }}>
                                    Add skills that volunteers need for this opportunity
                                </p>
                            )}
                        </div>

                        {/* Details Card */}
                        <div style={{
                            background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MapPin size={16} color="#ea580c" />
                                </div>
                                Details & Location
                            </h3>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                                {/* Duration */}
                                <div>
                                    <label style={labelStyle}>
                                        <Clock size={14} color="#64748b" /> Duration
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <Clock size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                                        <input type="text" name="duration" value={formData.duration} onChange={handleChange} required
                                            placeholder="e.g. 2-3 weeks, Ongoing"
                                            onFocus={() => setFocusField("duration")} onBlur={() => setFocusField("")}
                                            style={inputStyle("duration")} />
                                    </div>
                                </div>
                                {/* Location */}
                                <div>
                                    <label style={labelStyle}>
                                        <MapPin size={14} color="#64748b" /> Location
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <MapPin size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                            placeholder="e.g. New York, NY or Remote"
                                            onFocus={() => setFocusField("location")} onBlur={() => setFocusField("")}
                                            style={inputStyle("location")} />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label style={labelStyle}>
                                    <ChevronDown size={14} color="#64748b" /> Status
                                </label>
                                <div style={{ position: "relative" }}>
                                    <select name="status" value={formData.status} onChange={handleChange}
                                        onFocus={() => setFocusField("status")} onBlur={() => setFocusField("")}
                                        style={{
                                            ...inputStyle("status"), paddingLeft: 14, appearance: "none",
                                            cursor: "pointer"
                                        }}>
                                        <option value="Open">Open</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                    <ChevronDown size={16} color="#94a3b8" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingBottom: 20 }}>
                            <button type="button" onClick={() => navigate("/manage-opportunities")} style={{
                                padding: "12px 28px", border: "1px solid #e2e8f0", borderRadius: 10,
                                background: "white", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                            >Cancel</button>
                            <button type="submit" disabled={submitting} style={{
                                padding: "12px 32px", border: "none", borderRadius: 10,
                                background: submitting ? "#86efac" : "linear-gradient(135deg, #16a34a, #15803d)",
                                color: "white", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                                boxShadow: "0 2px 10px rgba(22,163,74,0.3)"
                            }}
                            onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                {submitting ? (
                                    <>
                                        <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </main>
            </div>
        </div>
    );
};

export default EditOpportunity;
