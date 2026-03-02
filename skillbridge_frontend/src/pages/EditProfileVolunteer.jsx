import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const EditProfileVolunteer = () => {
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        location: "",
        skills: "" // stored as comma separated string in form, sent as array
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");
    const [uploading, setUploading] = useState(false);
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

    const handlePhotoSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
        setUploading(true);
        try {
            const token = localStorage.getItem("access_token");
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("http://localhost:8000/api/profile/upload-photo", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Upload failed");
            setPhotoUrl(`http://localhost:8000${data.photo_url}`);
            setPhotoPreview("");
            setMessage("Photo uploaded successfully!");
        } catch (err) {
            setMessage("Photo upload failed: " + err.message);
            setPhotoPreview("");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const payload = {
                ...formData,
                skills: formData.skills.split(",").map(skill => skill.trim()).filter(Boolean)
            };

            await apiFetch("/profile/volunteer", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            setMessage("Profile Updated Successfully!");
        } catch (error) {
            setMessage("Failed to update profile: " + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "40px", fontFamily: "Arial, sans-serif" }}>
                <h2>Edit Volunteer Profile</h2>
                {message && <p style={{ color: message.includes("Failed") || message.includes("failed") ? "red" : "green", fontWeight: "bold" }}>{message}</p>}

                <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", maxWidth: "500px" }}>
                    {/* Profile Photo Upload */}
                    <div style={{ marginBottom: "20px", textAlign: "center" }}>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: "100px", height: "100px", borderRadius: "50%",
                                background: (photoPreview || photoUrl) ? `url(${photoPreview || photoUrl}) center/cover no-repeat` : "#e5e7eb",
                                margin: "0 auto 10px", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                border: "3px solid #2563eb", position: "relative"
                            }}
                        >
                            {!(photoPreview || photoUrl) && <span style={{ fontSize: "32px", color: "#9ca3af" }}>📷</span>}
                            {uploading && (
                                <div style={{
                                    position: "absolute", inset: 0, borderRadius: "50%",
                                    background: "rgba(0,0,0,0.4)", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    color: "white", fontSize: "12px"
                                }}>Uploading...</div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
                        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Click to upload photo</p>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}></textarea>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Skills (Comma separated)</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} placeholder="e.g. React, Python, Cooking" />
                    </div>

                    <button type="submit" style={{ padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileVolunteer;
