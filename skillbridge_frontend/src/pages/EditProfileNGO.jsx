import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const EditProfileNGO = () => {
    const [formData, setFormData] = useState({
        organization_name: "",
        organization_description: "",
        website_url: ""
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiFetch("/dashboard/ngo", { method: "GET" });
                setFormData({
                    organization_name: data.organization_name || "",
                    organization_description: data.organization_description || "",
                    website_url: data.website_url || ""
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            await apiFetch("/profile/ngo", {
                method: "PUT",
                body: JSON.stringify(formData)
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
                <h2>Edit NGO Profile</h2>
                {message && <p style={{ color: message.includes("Failed") ? "red" : "green", fontWeight: "bold" }}>{message}</p>}

                <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", maxWidth: "500px" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Organization Name</label>
                        <input type="text" name="organization_name" value={formData.organization_name} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Organization Description</label>
                        <textarea name="organization_description" value={formData.organization_description} onChange={handleChange} rows="4" style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}></textarea>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Website URL</label>
                        <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>

                    <button type="submit" style={{ padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileNGO;
