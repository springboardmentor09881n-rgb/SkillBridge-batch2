import { ArrowLeft, Building2, Camera, FileText, Globe, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";
import { getStoredToken } from "../utils/authStorage";

const EditProfileNGO = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        organization_name: "",
        organization_description: "",
        website_url: ""
    });
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
                const data = await apiFetch("/dashboard/ngo", { method: "GET" });
                setFormData({
                    organization_name: data.organization_name || "",
                    organization_description: data.organization_description || "",
                    website_url: data.website_url || ""
                });
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

            await apiFetch("/profile/ngo", {
                method: "PUT",
                body: JSON.stringify(formData)
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
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Edit NGO Profile</h1>
                            <p style={{ fontSize: 14, color: "#64748b", margin: "2px 0 0" }}>Update your organization information</p>
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
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Organization Logo</h3>
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
                                        <Building2 size={36} color="#93a3b8" />
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
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#334155", margin: "0 0 4px" }}>Upload a logo</p>
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

                    {/* Organization Info Card */}
                    <div style={{
                        background: "white", borderRadius: 16, padding: 32,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                        border: "1px solid #e2e8f0", marginBottom: 20
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                            <Building2 size={18} color="#2563eb" />
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Organization Details</h3>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                Organization Name
                            </label>
                            <div style={{ position: "relative" }}>
                                <Building2 size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                                <input type="text" name="organization_name" value={formData.organization_name} onChange={handleChange}
                                    placeholder="Your organization name"
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

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={14} /> Description</span>
                            </label>
                            <textarea name="organization_description" value={formData.organization_description} onChange={handleChange} rows="5"
                                placeholder="Tell volunteers about your organization, mission, and impact..."
                                style={{
                                    width: "100%", padding: "10px 14px", fontSize: 14, lineHeight: 1.6,
                                    borderRadius: 10, border: "1px solid #e2e8f0", outline: "none", resize: "vertical",
                                    transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc",
                                    boxSizing: "border-box", fontFamily: "inherit"
                                }}
                                onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; e.target.style.background = "white"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                            />
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0", textAlign: "right" }}>{formData.organization_description.length}/1000</p>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                Website URL
                            </label>
                            <div style={{ position: "relative" }}>
                                <Globe size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                                <input type="text" name="website_url" value={formData.website_url} onChange={handleChange}
                                    placeholder="https://www.example.org"
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

export default EditProfileNGO;
