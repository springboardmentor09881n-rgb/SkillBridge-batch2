import { Clock, MapPin, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import apiFetch from "../services/api";

const VolunteerOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [skillSearchText, setSkillSearchText] = useState("");
    const [locationSearch, setLocationSearch] = useState("");
    const [durationSearch, setDurationSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Open");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [applyModal, setApplyModal] = useState(null);
    const [applyMessage, setApplyMessage] = useState("");
    const [applyLoading, setApplyLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [appliedIds, setAppliedIds] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [oppsData, profileData, appsData] = await Promise.all([
                    apiFetch("/opportunities", { method: "GET" }).catch(() => []),
                    apiFetch("/dashboard/volunteer", { method: "GET" }).catch(() => null),
                    apiFetch("/applications/volunteer", { method: "GET" }).catch(() => [])
                ]);
                setOpportunities(Array.isArray(oppsData) ? oppsData : []);
                if (profileData?.photo_url) {
                    setProfilePhoto(`http://localhost:8000${profileData.photo_url}`);
                }
                if (Array.isArray(appsData)) {
                    setAppliedIds(new Set(appsData.map(a => a.opportunity_id)));
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setOpportunities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Collect unique skills, locations, durations for quick-filter chips
    const allSkills = [...new Set(opportunities.flatMap(o => o.required_skills || []))].slice(0, 6);
    const allLocations = [...new Set(opportunities.map(o => o.location).filter(Boolean))].slice(0, 6);
    const allDurations = [...new Set(opportunities.map(o => o.duration).filter(Boolean))].slice(0, 6);

    // Filter logic
    const filteredOpps = opportunities.filter(opp => {
        if (statusFilter === "Open" && opp.status !== "Open") return false;
        if (statusFilter === "Closed" && opp.status !== "Closed") return false;
        if (selectedSkills.length > 0 && !selectedSkills.every(sk => (opp.required_skills || []).some(s => s.toLowerCase().includes(sk.toLowerCase())))) return false;
        if (locationSearch && !(opp.location || "").toLowerCase().includes(locationSearch.toLowerCase())) return false;
        if (durationSearch && !(opp.duration || "").toLowerCase().includes(durationSearch.toLowerCase())) return false;
        return true;
    });

    const openCount = opportunities.filter(o => o.status === "Open").length;
    const closedCount = opportunities.filter(o => o.status === "Closed").length;

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleApply = async () => {
        if (!applyModal) return;
        setApplyLoading(true);
        try {
            await apiFetch("/applications", {
                method: "POST",
                body: JSON.stringify({ opportunity_id: applyModal._id, message: applyMessage })
            });
            showToast("Application submitted successfully!");
            setAppliedIds(prev => new Set([...prev, applyModal._id]));
            setApplyModal(null);
            setApplyMessage("");
        } catch (err) {
            showToast(err.message || "Failed to apply.", "error");
        } finally {
            setApplyLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <header style={{
                    background: "white",
                    padding: "14px 32px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>SkillBridge</h1>
                    <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {[
                            { to: "/volunteer-dashboard", label: "Dashboard" },
                            { to: "/volunteer-opportunities", label: "Opportunities", active: true },
                            { to: "/volunteer-applications", label: "Applications" },
                            { to: "/volunteer-messages", label: "Messages" }
                        ].map(link => (
                            <Link key={link.label} to={link.to} style={{
                                textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                                color: link.active ? "#2563eb" : "#64748b",
                                background: link.active ? "#eff6ff" : "transparent",
                                transition: "all 0.2s"
                            }}>{link.label}</Link>
                        ))}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 12, paddingLeft: 16, borderLeft: "1.5px solid #e2e8f0" }}>
                            <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.03em" }}>Volunteer</span>
                            <NotificationBell />
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dbeafe, #ede9fe)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", border: "2px solid #e2e8f0"
                            }}>
                                {!profilePhoto && <User size={18} color="#94a3b8" />}
                            </div>
                        </div>
                    </nav>
                </header>

                <main style={{ padding: "32px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>Volunteering Opportunities</h2>
                    <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>Find opportunities that match your skills and interests</p>

                    {/* Search & Filters */}
                    <div style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "24px",
                        marginBottom: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        border: "1px solid #e5e7eb"
                    }}>
                        <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "200px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Skills</label>
                                <div style={{ position: "relative" }}>
                                    <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "10px" }} />
                                    <input
                                        type="text"
                                        placeholder="Search skills..."
                                        value={skillSearchText}
                                        onChange={e => setSkillSearchText(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" && skillSearchText.trim()) {
                                                e.preventDefault();
                                                const val = skillSearchText.trim();
                                                if (!selectedSkills.includes(val)) setSelectedSkills(prev => [...prev, val]);
                                                setSkillSearchText("");
                                            }
                                        }}
                                        style={{ width: "100%", padding: "8px 8px 8px 32px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                                    {allSkills.map(skill => {
                                        const active = selectedSkills.includes(skill);
                                        return (
                                            <button key={skill} onClick={() => setSelectedSkills(prev => active ? prev.filter(s => s !== skill) : [...prev, skill])}
                                                style={{
                                                    padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                                                    background: active ? "#2563eb" : "white",
                                                    color: active ? "white" : "#374151",
                                                    border: "1px solid #e5e7eb"
                                                }}>{skill}{active ? " ✕" : ""}</button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: "200px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Location</label>
                                <div style={{ position: "relative" }}>
                                    <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "10px" }} />
                                    <input
                                        type="text"
                                        placeholder="Search locations..."
                                        value={locationSearch}
                                        onChange={e => setLocationSearch(e.target.value)}
                                        style={{ width: "100%", padding: "8px 8px 8px 32px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                                    {allLocations.map(loc => (
                                        <button key={loc} onClick={() => setLocationSearch(loc)}
                                            style={{
                                                padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                                                background: locationSearch === loc ? "#2563eb" : "white",
                                                color: locationSearch === loc ? "white" : "#374151",
                                                border: "1px solid #e5e7eb"
                                            }}>{loc}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: "200px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Duration</label>
                                <div style={{ position: "relative" }}>
                                    <Clock size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "10px" }} />
                                    <input
                                        type="text"
                                        placeholder="Search duration..."
                                        value={durationSearch}
                                        onChange={e => setDurationSearch(e.target.value)}
                                        style={{ width: "100%", padding: "8px 8px 8px 32px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                                    {allDurations.map(dur => (
                                        <button key={dur} onClick={() => setDurationSearch(dur)}
                                            style={{
                                                padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                                                background: durationSearch === dur ? "#2563eb" : "white",
                                                color: durationSearch === dur ? "white" : "#374151",
                                                border: "1px solid #e5e7eb"
                                            }}>{dur}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ minWidth: "140px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Status</label>
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", background: "white" }}>
                                    <option value="All">All</option>
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button onClick={() => { setSelectedSkills([]); setSkillSearchText(""); setLocationSearch(""); setDurationSearch(""); setStatusFilter("Open"); }}
                                style={{ padding: "6px 16px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "white", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "#374151" }}>
                                🔄 Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Opportunity Cards */}
                    {loading ? (
                        <p style={{ textAlign: "center", color: "#6b7280" }}>Loading opportunities...</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {filteredOpps.map(opp => (
                                <div key={opp._id} style={{
                                    background: "white",
                                    borderRadius: "12px",
                                    padding: "24px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    border: "1px solid #e5e7eb"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <div>
                                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", margin: "0 0 4px" }}>{opp.title}</h3>
                                            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>NGO ID: {opp.ngo_id || "—"}</p>
                                        </div>
                                        <span style={{
                                            background: opp.status === "Open" ? "#dcfce7" : "#fef3c7",
                                            color: opp.status === "Open" ? "#16a34a" : "#d97706",
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            fontSize: "13px",
                                            fontWeight: "500"
                                        }}>{opp.status || "Open"}</span>
                                    </div>

                                    <p style={{ fontSize: "15px", color: "#4b5563", marginBottom: "14px", lineHeight: 1.6 }}>{opp.description}</p>

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                                        {opp.required_skills?.map(skill => (
                                            <span key={skill} style={{
                                                background: "#eff6ff",
                                                color: "#2563eb",
                                                padding: "5px 12px",
                                                borderRadius: "20px",
                                                fontSize: "12px",
                                                border: "1px solid #bfdbfe"
                                            }}>{skill}</span>
                                        ))}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#6b7280" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <MapPin size={14} /> {opp.location || "—"}
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Clock size={14} /> {opp.duration || "—"}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <Link to={`/opportunity/${opp._id}`} style={{
                                                color: "#2563eb", fontWeight: "500", textDecoration: "none", fontSize: "14px"
                                            }}>View details &gt;</Link>
                                            {opp.status === "Open" && (
                                                appliedIds.has(opp._id) ? (
                                                    <span style={{
                                                        padding: "8px 20px", background: "#dcfce7", color: "#16a34a",
                                                        borderRadius: "8px", fontSize: "14px",
                                                        fontWeight: "600", border: "1px solid #bbf7d0"
                                                    }}>Applied</span>
                                                ) : (
                                                    <button onClick={() => { setApplyModal(opp); setApplyMessage(""); }} style={{
                                                        padding: "8px 20px", background: "#2563eb", color: "white",
                                                        border: "none", borderRadius: "8px", fontSize: "14px",
                                                        fontWeight: "600", cursor: "pointer"
                                                    }}>Apply</button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredOpps.length === 0 && (
                                <p style={{ color: "#6b7280", fontSize: "16px", textAlign: "center", padding: "40px 0" }}>No opportunities found.</p>
                            )}
                        </div>
                    )}
                </main>

                {/* Application Modal */}
                {applyModal && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                    }} onClick={() => setApplyModal(null)}>
                        <div style={{
                            background: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "500px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
                        }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 4px" }}>Apply to Opportunity</h3>
                            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px" }}>{applyModal.title}</p>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                Cover Message (optional)
                            </label>
                            <textarea
                                value={applyMessage}
                                onChange={e => setApplyMessage(e.target.value)}
                                placeholder="Tell the NGO why you're a great fit..."
                                rows={4}
                                style={{
                                    width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb",
                                    fontSize: "14px", resize: "vertical", fontFamily: "inherit"
                                }}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                                <button onClick={() => setApplyModal(null)} style={{
                                    padding: "10px 20px", borderRadius: "8px", border: "1px solid #e5e7eb",
                                    background: "white", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#374151"
                                }}>Cancel</button>
                                <button onClick={handleApply} disabled={applyLoading} style={{
                                    padding: "10px 24px", borderRadius: "8px", border: "none",
                                    background: "#2563eb", color: "white", fontSize: "14px", fontWeight: "600",
                                    cursor: applyLoading ? "not-allowed" : "pointer", opacity: applyLoading ? 0.7 : 1
                                }}>{applyLoading ? "Submitting..." : "Submit Application"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast */}
                {toast && (
                    <div style={{
                        position: "fixed", bottom: 24, right: 24, padding: "14px 24px", borderRadius: "10px",
                        background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
                        color: toast.type === "error" ? "#dc2626" : "#16a34a",
                        fontWeight: 600, fontSize: 14, zIndex: 2000, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}>{toast.msg}</div>
                )}
            </div>
        </div>
    );
};

export default VolunteerOpportunities;
