import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const CreateOpportunity = () => {
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
    const [profilePhoto, setProfilePhoto] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch("/dashboard/ngo", { method: "GET" })
            .then(d => { if (d?.photo_url) setProfilePhoto(`http://localhost:8000${d.photo_url}`); })
            .catch(() => {});
    }, []);

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
        try {
            const payload = {
                ...formData,
                required_skills: skills
            };

            await apiFetch("/opportunities/", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            alert("Opportunity Created Successfully!");
            navigate("/manage-opportunities");
        } catch (err) {
            setError(err.message);
        }
    };

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
                        <Link to="/ngo-dashboard" style={{ textDecoration: "none", color: "#6b7280", fontWeight: "500", fontSize: "15px" }}>Dashboard</Link>
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
                {/* Back link + title */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <Link to="/manage-opportunities" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>‹ Back</Link>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Create New Opportunity</h2>
                </div>

                {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "12px", border: "1px solid #e5e7eb", maxWidth: "650px" }}>
                    {/* Title */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#374151", marginBottom: "6px" }}>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required
                            placeholder="e.g. Website Redesign"
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }} />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#374151", marginBottom: "6px" }}>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                            placeholder="Provide details about the opportunity"
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
                    </div>

                    {/* Required Skills */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#374151", marginBottom: "6px" }}>Required Skills</label>
                        {skills.length > 0 && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                                {skills.map((skill, i) => (
                                    <span key={i} style={{
                                        background: "#dbeafe", color: "#2563eb", padding: "4px 10px",
                                        borderRadius: "9999px", fontSize: "13px", fontWeight: "500",
                                        display: "flex", alignItems: "center", gap: "6px"
                                    }}>
                                        {skill}
                                        <span onClick={() => removeSkill(skill)} style={{ cursor: "pointer", fontSize: "16px", lineHeight: "1" }}>&times;</span>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                placeholder="e.g. Web Development"
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }} />
                            <button type="button" onClick={addSkill} style={{
                                background: "#3b82f6", color: "white", border: "none", borderRadius: "8px",
                                padding: "10px 20px", fontWeight: "600", fontSize: "14px", cursor: "pointer"
                            }}>Add</button>
                        </div>
                    </div>

                    {/* Duration + Location */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#374151", marginBottom: "6px" }}>Duration</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} required
                                placeholder="e.g. 2-3 weeks, Ongoing"
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#374151", marginBottom: "6px" }}>Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                placeholder="e.g. New York, NY, Remote"
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }} />
                        </div>
                    </div>

                    {/* Status */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#374151", marginBottom: "6px" }}>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", background: "white", boxSizing: "border-box" }}>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <button type="button" onClick={() => navigate("/manage-opportunities")} style={{
                            padding: "10px 24px", border: "1px solid #d1d5db", borderRadius: "8px",
                            background: "white", color: "#374151", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                        }}>Cancel</button>
                        <button type="submit" style={{
                            padding: "10px 24px", border: "none", borderRadius: "8px",
                            background: "#3b82f6", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                        }}>Create</button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};

export default CreateOpportunity;
