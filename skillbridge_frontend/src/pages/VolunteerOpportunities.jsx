import { Clock, MapPin, Search, User, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import apiFetch, { PUBLIC_BASE_URL }  from "../services/api";
import "./VolunteerOpportunities.css";

const VolunteerOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [matchedOpps, setMatchedOpps] = useState([]);
    const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all"); // "all" or "matches"
    
    // Filters for "Browse All" tab
    const [skillSearch, setSkillSearch] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [locationSearch, setLocationSearch] = useState("");
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [statusFilter, setStatusFilter] = useState("Open");

    const toggleSkill = (skill) => {
        setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    };

    const toggleLocation = (loc) => {
        setSelectedLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
    };
    
    const [profile, setProfile] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [oppsData, profileData, matchData, applicationsData] = await Promise.all([
                    apiFetch("/opportunities", { method: "GET" }).catch(() => []),
                    apiFetch("/dashboard/volunteer", { method: "GET" }).catch(() => null),
                    apiFetch("/opportunities/match", { method: "GET" }).catch(() => []),
                    apiFetch("/applications/volunteer", { method: "GET" }).catch(() => []),
                ]);
                
                setOpportunities(Array.isArray(oppsData) ? oppsData : []);
                setMatchedOpps(Array.isArray(matchData) ? matchData : []);
                setProfile(profileData);
                
                setAppliedOpportunityIds(
                    Array.isArray(applicationsData)
                        ? applicationsData.map(app => app.opportunity_id).filter(Boolean)
                        : []
                );
                
                if (profileData?.photo_url) {
                    setProfilePhoto(`${PUBLIC_BASE_URL}${profileData.photo_url}`);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /* ── Matching Logic (Consolidated) ── */
    const userSkills = profile?.skills
        ? Array.isArray(profile.skills)
            ? profile.skills
            : String(profile.skills).split(",").map(s => s.trim()).filter(Boolean)
        : [];

    const getMatchScore = (requiredSkills = [], oppLocation = "") => {
        const vSkills = userSkills.map(s => s.toLowerCase());
        const rSkills = requiredSkills.map(s => s.toLowerCase());
        const skillMatches = rSkills.filter(r => vSkills.some(v => v.includes(r) || r.includes(v)));
        
        const locMatch = profile?.location && oppLocation && 
                        profile.location.toLowerCase().trim() === oppLocation.toLowerCase().trim();

        if (!requiredSkills.length) return locMatch ? 100 : 0;
        
        let score = (skillMatches.length / rSkills.length) * 100;
        if (locMatch) score = Math.min(100, score + 20); // Add 20% bonus for location match
        
        return Math.round(score);
    };

    const getMatchedSkills = (requiredSkills = []) => {
        const vSkills = userSkills.map(s => s.toLowerCase());
        return requiredSkills.filter(r =>
            vSkills.some(v => v.includes(r.toLowerCase()) || r.toLowerCase().includes(v))
        );
    };

    const scoreBadge = (score) => {
        if (score >= 80) return { bg: "#dcfce7", color: "#16a34a", label: "Excellent" };
        if (score >= 50) return { bg: "#dbeafe", color: "#2563eb", label: "Good" };
        return { bg: "#fef3c7", color: "#d97706", label: "Partial" };
    };

    /* ── Filters & Formatting ── */
    const getDistinctList = (list) => {
        const seen = new Set();
        return list
            .map(s => (s || "").trim())
            .filter(s => {
                if (!s || seen.has(s.toLowerCase())) return false;
                seen.add(s.toLowerCase());
                return true;
            });
    };

    const allSkills = getDistinctList(opportunities.flatMap(o => o.required_skills || [])).slice(0, 6);
    const allLocations = getDistinctList(opportunities.map(o => o.location)).slice(0, 6);

    const filteredOpps = opportunities.filter(opp => {
        if (statusFilter === "Open" && opp.status !== "Open") return false;
        if (statusFilter === "Closed" && opp.status !== "Closed") return false;
        
        const oppSkills = (opp.required_skills || []).map(s => s.toLowerCase().trim());
        const oppLoc = (opp.location || "").toLowerCase().trim();

        if (selectedSkills.length > 0) {
            const selSkills = selectedSkills.map(s => s.toLowerCase().trim());
            if (!selSkills.some(skill => oppSkills.some(os => os.includes(skill) || skill.includes(os)))) return false;
        }

        if (selectedLocations.length > 0) {
            const selLocs = selectedLocations.map(s => s.toLowerCase().trim());
            if (!selLocs.includes(oppLoc)) return false;
        }

        if (skillSearch) {
            const sQuery = skillSearch.toLowerCase().trim();
            if (!oppSkills.some(s => s.includes(sQuery))) return false;
        }

        if (locationSearch) {
            const lQuery = locationSearch.toLowerCase().trim();
            if (!oppLoc.includes(lQuery)) return false;
        }
        return true;
    });

    const handleApply = async (oppId) => {
        try {
            await apiFetch("/applications", {
                method: "POST",
                body: JSON.stringify({ opportunity_id: oppId, message: "" })
            });
            setAppliedOpportunityIds(prev => prev.includes(oppId) ? prev : [...prev, oppId]);
            alert("Application submitted successfully!");
        } catch (err) {
            alert(err.message || "Failed to apply.");
        }
    };

    const resetFilters = () => {
        setSkillSearch("");
        setSelectedSkills([]);
        setLocationSearch("");
        setSelectedLocations([]);
        setStatusFilter("Open");
    };

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role="Volunteer" 
                    profilePhoto={profilePhoto} 
                    activePage="opportunities" 
                />

                <main className="content-inner">
                    <div className="page-header" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Volunteering Opportunities</h2>
                            <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>Discover high-impact roles matching your talent profile.</p>
                        </div>
                        
                        {/* Tab Switcher */}
                        <div className="tab-switcher">
                            <button 
                                className={`tab-btn-main ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTab("all")}
                            >Explore All</button>
                            <button 
                                className={`tab-btn-main ${activeTab === "matches" ? "active" : ""}`}
                                onClick={() => setActiveTab("matches")}
                                style={{ display: "flex", alignItems: "center", gap: 6 }}
                            >
                                <RotateCcw size={14} style={{ transform: activeTab === "matches" ? "rotate(0deg)" : "rotate(-45deg)", transition: "0.3s" }} /> 
                                Matched For You
                            </button>
                        </div>
                    </div>

                    {activeTab === "all" ? (
                        <>
                            <div className="glass-card" style={{ marginBottom: 24 }}>
                                <div className="search-filters-container">
                                    <div className="filter-group">
                                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Skills</label>
                                        <div className="filter-input-wrapper">
                                            <Search size={16} className="filter-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Search skills..." 
                                                value={skillSearch}
                                                onChange={e => setSkillSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="quick-filter-tags">
                                            {allSkills.map(s => (
                                                <button 
                                                    key={s} 
                                                    className={`tag-btn ${selectedSkills.includes(s) ? "active" : ""}`}
                                                    onClick={() => toggleSkill(s)}
                                                >{s}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="filter-group">
                                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Location</label>
                                        <div className="filter-input-wrapper">
                                            <Search size={16} className="filter-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Search location..." 
                                                value={locationSearch}
                                                onChange={e => setLocationSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="quick-filter-tags">
                                            {allLocations.map(l => (
                                                <button 
                                                    key={l} 
                                                    className={`tag-btn ${selectedLocations.includes(l) ? "active" : ""}`}
                                                    onClick={() => toggleLocation(l)}
                                                >{l}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="filter-group">
                                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Status</label>
                                        <select 
                                            className="filter-select"
                                            value={statusFilter} 
                                            onChange={e => setStatusFilter(e.target.value)}
                                            style={{ padding: "10px", borderRadius: 10, border: "1px solid var(--border-common)", fontSize: 14 }}
                                        >
                                            <option value="All">All</option>
                                            <option value="Open">Open</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                                    <button className="text-btn" onClick={resetFilters} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <RotateCcw size={14} /> Reset Filters
                                    </button>
                                </div>
                            </div>

                            <div className="opportunities-list">
                                {loading ? (
                                    <div className="glass-card" style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                                        <div className="spinner" style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "var(--color-volunteer)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                                        <p>Loading opportunities...</p>
                                    </div>
                                ) : filteredOpps.length === 0 ? (
                                    <div className="glass-card" style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                                        <Search size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                                        <p>No matching opportunities found.</p>
                                    </div>
                                ) : (
                                    filteredOpps.map(opp => (
                                        <div key={opp._id || opp.id} className="glass-card card-hover" style={{ padding: 24, transition: "0.2s" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                                <div>
                                                    <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>{opp.title}</h3>
                                                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>{opp.ngo_name || "SkillBridge Partner"}</p>
                                                </div>
                                                <span className={`badge ${opp.status}`} style={{
                                                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                    background: opp.status === "Open" ? "#dcfce7" : "#fee2e2",
                                                    color: opp.status === "Open" ? "#16a34a" : "#dc2626"
                                                }}>{opp.status}</span>
                                            </div>

                                            <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 16 }}>{opp.description}</p>

                                            <div className="skills-wrapper" style={{ marginBottom: 20 }}>
                                                {(opp.required_skills || []).map(s => (
                                                    <span key={s} className="skill-tag">{s}</span>
                                                ))}
                                            </div>

                                            <div className="opp-card-footer">
                                                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748b" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <MapPin size={14} /> {opp.location || "Remote"}
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <Clock size={14} /> {opp.duration || "Self-paced"}
                                                    </div>
                                                </div>
                                                <div className="opp-card-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <Link to={`/opportunity/${opp._id}`} className="link-btn">View full details</Link>
                                                    {opp.status === "Open" && (
                                                        appliedOpportunityIds.includes(opp._id) ? (
                                                            <span className="applied-badge">Applied</span>
                                                        ) : (
                                                            <button onClick={() => handleApply(opp._id)} className="action-btn-primary">Apply Now</button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        /* Matches Tab Rendering */
                        <div className="matches-tab-content">
                            <div className="match-stats-banner">
                                <div className="stat-item">
                                    <span className="stat-label">Your Top Skills</span>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                                        {userSkills.slice(0, 6).map(s => <span key={s} className="skill-tag-matched">{s}</span>)}
                                    </div>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <span className="stat-label">Total Matches</span>
                                    <span className="stat-value">{matchedOpps.length}</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <span className="stat-label">Suggested for You</span>
                                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Based on your expertise and preferences.</p>
                                </div>
                            </div>

                            <div className="opportunities-list" style={{ marginTop: 24 }}>
                                {loading ? (
                                    <div className="glass-card" style={{ textAlign: "center", padding: 60 }}>
                                        <div className="spinner" style={{ margin: "0 auto 12px" }} />
                                        <p>Searching for best fits...</p>
                                    </div>
                                ) : matchedOpps.length === 0 ? (
                                    <div className="glass-card" style={{ textAlign: "center", padding: 60 }}>
                                        <p style={{ color: "#64748b" }}>No matches found. Try updating your skills in profile!</p>
                                        <Link to="/edit-profile-volunteer" className="action-btn-primary" style={{ display: "inline-block", marginTop: 16, textDecoration: "none" }}>Edit Profile</Link>
                                    </div>
                                ) : (
                                    matchedOpps
                                        .sort((a, b) => getMatchScore(b.required_skills, b.location) - getMatchScore(a.required_skills, a.location))
                                        .map(opp => {
                                            const score = getMatchScore(opp.required_skills, opp.location);
                                            const badge = scoreBadge(score);
                                            const matched = getMatchedSkills(opp.required_skills);
                                            const others = (opp.required_skills || []).filter(s => !matched.includes(s));

                                            return (
                                                <div key={opp._id} className="glass-card card-hover" style={{ padding: 24, borderLeft: `4px solid ${badge.color}` }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                                        <div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{opp.title}</h3>
                                                                <span style={{ 
                                                                    fontSize: 12, fontWeight: 700, padding: "3px 10px", 
                                                                    borderRadius: 20, background: badge.bg, color: badge.color 
                                                                }}>{badge.label} · {score}% Match</span>
                                                            </div>
                                                            <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>{opp.ngo_name || "SkillBridge Partner"}</p>
                                                        </div>
                                                        <span className={`badge ${opp.status}`} style={{
                                                            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                            background: opp.status === "Open" ? "#dcfce7" : "#fee2e2",
                                                            color: opp.status === "Open" ? "#16a34a" : "#dc2626"
                                                        }}>{opp.status}</span>
                                                    </div>

                                                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 16 }}>{opp.description}</p>

                                                    <div className="skills-wrapper" style={{ marginBottom: 20 }}>
                                                        {matched.map(s => (
                                                            <span key={s} className="skill-tag" style={{ background: "#dcfce7", color: "#16a34a", borderColor: "#bbf7d0" }}>✓ {s}</span>
                                                        ))}
                                                        {others.map(s => (
                                                            <span key={s} className="skill-tag">{s}</span>
                                                        ))}
                                                    </div>

                                                    <div className="opp-card-footer">
                                                        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748b" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                <MapPin size={14} /> {opp.location || "Remote"}
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                <Clock size={14} /> {opp.duration || "Self-paced"}
                                                            </div>
                                                        </div>
                                                        <div className="opp-card-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            <Link to={`/opportunity/${opp._id}`} className="link-btn">View full details</Link>
                                                            {opp.status === "Open" && (
                                                                appliedOpportunityIds.includes(opp._id) ? (
                                                                    <span className="applied-badge">Applied</span>
                                                                ) : (
                                                                    <button onClick={() => handleApply(opp._id)} className="action-btn-primary">Apply Now</button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default VolunteerOpportunities;
