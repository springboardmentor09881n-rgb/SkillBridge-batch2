import React, { useState, useEffect } from "react";
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
                {message && <p style={{ color: message.includes("Failed") ? "red" : "green", fontWeight: "bold" }}>{message}</p>}

                <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", maxWidth: "500px" }}>
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
