import { ArrowLeft, Building2, Camera, FileText, Globe, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import apiFetch from "../services/api";
import { getStoredToken } from "../utils/authStorage";
import "./EditProfile.css";

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
            setMessage("Failed: " + error.message);
            setMessageType("error");
        } finally {
            setUploading(false);
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

    const displayPhoto = photoPreview || (photoUrl && !pendingPhotoRemove ? photoUrl : "");

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role="NGO" 
                    profilePhoto={displayPhoto} 
                    activePage="profile" 
                />

                <main className="content-inner">
                    <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                        <button onClick={() => navigate(-1)} className="text-btn" style={{ padding: "8px", border: "1px solid var(--border-common)", borderRadius: 10 }}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>NGO Profile</h2>
                            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Update your organization&apos;s public information.</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`toast ${messageType}`} style={{ padding: "12px 20px", borderRadius: 10, background: messageType === "success" ? "var(--color-ngo-soft)" : "#fee2e2", color: messageType === "success" ? "var(--color-ngo)" : "#dc2626", marginBottom: 20, fontWeight: 700, border: `1px solid ${messageType === "success" ? "#bbf7d0" : "#fecaca"}` }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="edit-profile-container">
                        <section className="glass-card" style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                                <Camera size={18} color="var(--color-ngo)" />
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Organization Logo</h3>
                            </div>
                            <div className="photo-upload-section">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: 100, height: 100, borderRadius: "50%",
                                        background: displayPhoto ? `url(${displayPhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dcfce7, #d1fae5)",
                                        cursor: "pointer", border: "4px solid #f1f5f9", position: "relative", overflow: "hidden"
                                    }}
                                >
                                    {!displayPhoto && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={30} color="#cbd5e1" /></div>}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="action-btn-primary" style={{ padding: "8px 16px", fontSize: 13, background: "var(--color-ngo)" }}>Change Logo</button>
                                        {(photoPreview || photoUrl) && !pendingPhotoRemove && (
                                            <button type="button" onClick={() => { setPendingPhotoRemove(true); setPendingPhotoFile(null); setPhotoPreview(""); }} className="text-btn danger" style={{ fontSize: 13 }}>Remove</button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Square logos work best. JPG or PNG allowed.</p>
                                </div>
                            </div>
                        </section>

                        <section className="glass-card" style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                                <Building2 size={18} color="var(--color-ngo)" />
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Organization Details</h3>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Name</label>
                                <div className="input-with-icon">
                                    <Building2 size={16} className="input-icon" />
                                    <input type="text" name="organization_name" value={formData.organization_name} onChange={handleChange} placeholder="Organization Name" />
                                </div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Website URL</label>
                                <div className="input-with-icon">
                                    <Globe size={16} className="input-icon" />
                                    <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://example.org" />
                                </div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Mission Description</label>
                                <textarea name="organization_description" value={formData.organization_description} onChange={handleChange} rows="5" placeholder="Tell us about your mission..." style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14, background: "#f8fafc", resize: "none" }} />
                                <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>{formData.organization_description.length}/1000</p>
                            </div>
                        </section>

                        <div className="action-footer">
                            <button type="button" onClick={() => navigate(-1)} className="text-btn" style={{ padding: "11px 24px" }}>Cancel</button>
                            <button type="submit" disabled={uploading} className="action-btn-primary" style={{ padding: "11px 32px", background: "var(--color-ngo)", display: "flex", alignItems: "center", gap: 8 }}>
                                <Save size={18} /> {uploading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default EditProfileNGO;
