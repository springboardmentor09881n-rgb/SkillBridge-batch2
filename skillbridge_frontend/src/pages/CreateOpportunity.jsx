import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const CreateOpportunity = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        required_skills: "",
        duration: "",
        location: "",
        status: "Open"
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                required_skills: formData.required_skills.split(",").map(skill => skill.trim()).filter(Boolean)
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
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "40px", fontFamily: "Arial, sans-serif" }}>
                <h2>Create Opportunity</h2>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", maxWidth: "600px" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}></textarea>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Required Skills (Comma separated)</label>
                        <input type="text" name="required_skills" value={formData.required_skills} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} placeholder="e.g., React, Python, Teaching" />
                    </div>
                    <div style={{ marginBottom: "15px", display: "flex", gap: "20px" }}>
                        <div style={{ flex: 1 }}>
                            <label>Duration</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} placeholder="e.g., 3 months" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} placeholder="e.g., Remote or NY" />
                        </div>
                    </div>

                    <button type="submit" style={{ width: "100%", padding: "10px", background: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                        Create Opportunity
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateOpportunity;
