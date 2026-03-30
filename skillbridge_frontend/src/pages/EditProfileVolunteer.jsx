import { ArrowLeft, Camera, FileText, MapPin, Save, Sparkles, Trash2, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import { getStoredToken } from "../utils/authStorage";

const EditProfileVolunteer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        location: "",
        skills: ""
    });
    const [skillTags, setSkillTags] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");
    const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
    const [pendingPhotoRemove, setPendingPhotoRemove] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [hoverPhoto, setHoverPhoto] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiFetch("/dashboard/volunteer", { method: "GET" });
                setFormData({
                    name: data.name || "",
                    bio: data.bio || "",
                    location: data.location || "",
                    skills: data.skills ? data.skills.join(", ") : ""
                });
                setSkillTags(data.skills || []);
                if (data.photo_url) {
                    setPhotoUrl(`http://localhost:8000${data.photo_url}`);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
        setPendingPhotoFile(file);
        setPendingPhotoRemove(false);
    };

    const addSkill = () => {
        const skill = skillInput.trim();
        if (skill && !skillTags.includes(skill)) {
            const updated = [...skillTags, skill];
            setSkillTags(updated);
            setFormData({ ...formData, skills: updated.join(", ") });
        }
        setSkillInput("");
    };

    const removeSkill = (skillToRemove) => {
        const updated = skillTags.filter(s => s !== skillToRemove);
        setSkillTags(updated);
        setFormData({ ...formData, skills: updated.join(", ") });
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setUploading(true);
        try {
            const token = getStoredToken();

            if (pendingPhotoFile) {
                const fd = new FormData();
                fd.append("file", pendingPhotoFile);
                const res = await fetch("http://localhost:8000/api/profile/upload-photo", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || "Photo upload failed");
                setPhotoUrl(`http://localhost:8000${data.photo_url}`);
                setPhotoPreview("");
                setPendingPhotoFile(null);
            }

            if (pendingPhotoRemove) {
                const res = await fetch("http://localhost:8000/api/profile/remove-photo", {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to remove photo");
                setPhotoUrl("");
                setPendingPhotoRemove(false);
            }

            const payload = {
                ...formData,
                skills: skillTags
            };

            await apiFetch("/profile/volunteer", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            setMessage("Profile updated successfully!");
            setMessageType("success");
            setTimeout(() => setMessage(""), 4000);
        } catch (error) {
            setMessage("Failed to update profile: " + error.message);
            setMessageType("error");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                    <p style={{ color: "#6b7280", fontSize: 14 }}>Loading profile...</p>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const displayPhoto = photoPreview || (photoUrl && !pendingPhotoRemove ? photoUrl : "");

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", transition: "all 0.2s" }}>
                            <ArrowLeft size={18} color="#475569" />
                        </button>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Edit Profile</h1>
                            <p style={{ fontSize: 14, color: "#64748b", margin: "2px 0 0" }}>Update your volunteer information</p>
                        </div>
                    </div>
                </div>

                {/* Toast message */}
                {message && (
                    <div style={{
                        padding: "12px 20px", borderRadius: 12, marginBottom: 20,
                        display: "flex", alignItems: "center", gap: 10,
                        background: messageType === "success" ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${messageType === "success" ? "#bbf7d0" : "#fecaca"}`,
                        color: messageType === "success" ? "#166534" : "#991b1b",
                        fontSize: 14, fontWeight: 500
                    }}>
                        {messageType === "success" ? "✓" : "✕"} {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
                    {/* Photo Card */}
                    <div style={{
                        background: "white", borderRadius: 16, padding: 32,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                        border: "1px solid #e2e8f0", marginBottom: 20
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                            <Camera size={18} color="#2563eb" />
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Profile Photo</h3>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onMouseEnter={() => setHoverPhoto(true)}
                                onMouseLeave={() => setHoverPhoto(false)}
                                style={{
                                    width: 110, height: 110, borderRadius: "50%", flexShrink: 0,
                                    background: displayPhoto ? `url(${displayPhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)",
                                    cursor: "pointer", position: "relative", overflow: "hidden",
                                    border: "4px solid #e2e8f0", transition: "border-color 0.2s",
                                    borderColor: hoverPhoto ? "#2563eb" : "#e2e8f0"
                                }}
                            >
                                {!displayPhoto && (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <User size={36} color="#93a3b8" />
                                    </div>
                                )}
                                <div style={{
                                    position: "absolute", inset: 0, borderRadius: "50%",
                                    background: "rgba(0,0,0,0.45)", display: "flex",
                                    flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    opacity: hoverPhoto ? 1 : 0, transition: "opacity 0.2s"
                                }}>
                                    <Camera size={20} color="white" />
                                    <span style={{ color: "white", fontSize: 11, marginTop: 4, fontWeight: 500 }}>Change</span>
                                </div>
                                {uploading && (
                                    <div style={{
                                        position: "absolute", inset: 0, borderRadius: "50%",
                                        background: "rgba(0,0,0,0.5)", display: "flex",
                                        alignItems: "center", justifyContent: "center"
                                    }}>
                                        <div style={{ width: 24, height: 24, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#334155", margin: "0 0 4px" }}>Upload a photo</p>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>JPG, PNG or GIF. Max 5MB.</p>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                                        padding: "7px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8,
                                        border: "1px solid #2563eb", background: "white", color: "#2563eb",
                                        cursor: "pointer", transition: "all 0.2s"
                                    }}>Upload New</button>
                                    {(photoPreview || photoUrl) && !pendingPhotoRemove && (
                                        <button type="button" onClick={() => { setPendingPhotoRemove(true); setPendingPhotoFile(null); setPhotoPreview(""); }}
                                            style={{
                                                padding: "7px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8,
                                                border: "1px solid #fca5a5", background: "white", color: "#dc2626",
                                                cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                                            }}>
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info Card */}
                    <div style={{
                        background: "white", borderRadius: 16, padding: 32,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                        border: "1px solid #e2e8f0", marginBottom: 20
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                            <User size={18} color="#2563eb" />
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Personal Information</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                    Full Name
                                </label>
                                <div style={{ position: "relative" }}>
                                    <User size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                                        placeholder="Your full name"
                                        style={{
                                            width: "100%", padding: "10px 12px 10px 36px", fontSize: 14,
                                            borderRadius: 10, border: "1px solid #e2e8f0", outline: "none",
                                            transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc",
                                            boxSizing: "border-box"
                                        }}
                                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "white"; }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                    Location
                                </label>
                                <div style={{ position: "relative" }}>
                                    <MapPin size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                                    <input type="text" name="location" value={formData.location} onChange={handleChange}
                                        placeholder="City, Country"
                                        style={{
                                            width: "100%", padding: "10px 12px 10px 36px", fontSize: 14,
                                            borderRadius: 10, border: "1px solid #e2e8f0", outline: "none",
                                            transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc",
                                            boxSizing: "border-box"
                                        }}
                                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "white"; }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={14} /> Bio</span>
                            </label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4"
                                placeholder="Tell us about yourself, your interests and experience..."
                                style={{
                                    width: "100%", padding: "10px 14px", fontSize: 14, lineHeight: 1.6,
                                    borderRadius: 10, border: "1px solid #e2e8f0", outline: "none", resize: "vertical",
                                    transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc",
                                    boxSizing: "border-box", fontFamily: "inherit"
                                }}
                                onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "white"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                            />
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0", textAlign: "right" }}>{formData.bio.length}/500</p>
                        </div>
                    </div>

                    {/* Skills Card */}
                    <div style={{
                        background: "white", borderRadius: 16, padding: 32,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                        border: "1px solid #e2e8f0", marginBottom: 28
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                            <Sparkles size={18} color="#2563eb" />
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Skills & Expertise</h3>
                        </div>

                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                            Add your skills
                        </label>
                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                placeholder="Type a skill and press Enter"
                                style={{
                                    flex: 1, padding: "10px 14px", fontSize: 14,
                                    borderRadius: 10, border: "1px solid #e2e8f0", outline: "none",
                                    transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc",
                                    boxSizing: "border-box"
                                }}
                                onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "white"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                            />
                            <button type="button" onClick={addSkill} style={{
                                padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 10,
                                border: "none", background: "#2563eb", color: "white", cursor: "pointer",
                                transition: "background 0.2s", whiteSpace: "nowrap"
                            }}>+ Add</button>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {skillTags.length === 0 && (
                                <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>No skills added yet. Start typing above to add your skills.</p>
                            )}
                            {skillTags.map((skill, i) => (
                                <span key={i} style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                                    background: "linear-gradient(135deg, #eff6ff, #ede9fe)", color: "#3730a3",
                                    border: "1px solid #c7d2fe"
                                }}>
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: 18, height: 18, borderRadius: "50%", border: "none",
                                        background: "rgba(67,56,202,0.15)", cursor: "pointer", padding: 0
                                    }}>
                                        <X size={12} color="#4338ca" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => navigate(-1)} style={{
                            padding: "11px 28px", fontSize: 14, fontWeight: 600, borderRadius: 10,
                            border: "1px solid #e2e8f0", background: "white", color: "#475569",
                            cursor: "pointer", transition: "all 0.2s"
                        }}>Cancel</button>
                        <button type="submit" disabled={uploading} style={{
                            padding: "11px 32px", fontSize: 14, fontWeight: 600, borderRadius: 10,
                            border: "none", color: "white", cursor: uploading ? "not-allowed" : "pointer",
                            background: uploading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #4f46e5)",
                            boxShadow: uploading ? "none" : "0 4px 12px rgba(37,99,235,0.3)",
                            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
                        }}>
                            <Save size={16} />
                            {uploading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default EditProfileVolunteer;
