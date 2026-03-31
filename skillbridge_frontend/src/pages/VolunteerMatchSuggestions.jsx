import {
    ArrowRight,
    BookOpen,
    Briefcase,
    CheckCircle2,
    Clock,
    Eye,
    MapPin,
    Search,
    Sparkles,
    User,
    X,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";

const VolunteerMatchSuggestions = () => {
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterScore, setFilterScore] = useState("all");
    const [applySuccess, setApplySuccess] = useState(null);
    const [applyingId, setApplyingId] = useState(null);
    const navigate = useNavigate();

    /* ── Fetch volunteer profile + matched opportunities ── */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileData = await apiFetch("/dashboard/volunteer", { method: "GET" });
                setProfile(profileData);

                setLoadingMatches(true);
                const matchData = await apiFetch("/opportunities/match", { method: "GET" }).catch(() => []);
                setMatches(Array.isArray(matchData) ? matchData : []);
            } catch (err) {
                console.error("Error fetching matches:", err);
            } finally {
                setLoading(false);
                setLoadingMatches(false);
            }
        };
        fetchData();
    }, []);

    /* ── Skills helper ── */
    const skills = profile?.skills
        ? Array.isArray(profile.skills)
            ? profile.skills
            : String(profile.skills).split(",").map(s => s.trim()).filter(Boolean)
        : [];

    /* ── Match score ── */
    const getMatchScore = (requiredSkills = []) => {
        if (!requiredSkills.length || !skills.length) return 0;
        const vSkills = skills.map(s => s.toLowerCase());
        const rSkills = requiredSkills.map(s => s.toLowerCase());
        const matched = rSkills.filter(r => vSkills.some(v => v.includes(r) || r.includes(v)));
        return Math.round((matched.length / rSkills.length) * 100);
    };

    /* ── Matched skills list ── */
    const getMatchedSkills = (requiredSkills = []) => {
        const vSkills = skills.map(s => s.toLowerCase());
        return requiredSkills.filter(r =>
            vSkills.some(v => v.includes(r.toLowerCase()) || r.toLowerCase().includes(v))
        );
    };

    /* ── Score badge ── */
    const scoreBadge = (score) => {
        if (score >= 80) return { bg: "#dcfce7", color: "#16a34a", label: "Excellent" };
        if (score >= 50) return { bg: "#dbeafe", color: "#2563eb", label: "Good" };
        return { bg: "#fef3c7", color: "#d97706", label: "Partial" };
    };

    /* ── Apply to opportunity ── */
    const handleApply = async (oppId, oppTitle) => {
        setApplyingId(oppId);
        try {
            await apiFetch("/applications/apply", {
                method: "POST",
                body: JSON.stringify({ opportunity_id: oppId })
            });
            setApplySuccess(oppId);
            setTimeout(() => setApplySuccess(null), 3000);
        } catch (err) {
            console.error("Apply error:", err);
        } finally {
            setApplyingId(null);
        }
    };

    /* ── Filter + search ── */
    const filteredMatches = matches.filter(opp => {
        const score = getMatchScore(opp.required_skills);
        const matchesScore =
            filterScore === "all" ? true :
            filterScore === "excellent" ? score >= 80 :
            filterScore === "good" ? score >= 50 && score < 80 :
            score < 50;

        if (!matchesScore) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (opp.title || "").toLowerCase().includes(q) ||
            (opp.location || "").toLowerCase().includes(q) ||
            (opp.required_skills || []).some(s => s.toLowerCase().includes(q))
        );
    });

    const profilePhoto = profile?.photo_url ? `http://localhost:8000${profile.photo_url}` : "";
    const volunteerName = profile?.name || profile?.full_name || "Volunteer";

    /* ────────────────────────────────────────────
       LOADING STATE
    ──────────────────────────────────────────── */
    if (loading) return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                        <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Finding your matches...</p>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    /* ────────────────────────────────────────────
       MAIN RENDER
    ──────────────────────────────────────────── */
    return (
        <div className="layout-wrapper">
            <Sidebar />

            <div className="main-container">
                <Header 
                    role="Volunteer" 
                    profilePhoto={profilePhoto} 
                    activePage="matches" 
                />

                <main className="content-inner">

                    {/* ── Welcome Banner ── */}
                    <div style={{
                        background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)",
                        borderRadius: 16, padding: "28px 32px", marginBottom: 24,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        position: "relative", overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                        <div style={{ position: "absolute", bottom: -40, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                                Your Matches, {volunteerName}! ✨
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: 0 }}>
                                Opportunities handpicked based on your skills and location.
                            </p>
                        </div>
                        <Link to="/volunteer-opportunities" style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 24px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, color: "white",
                            textDecoration: "none", fontSize: 14, fontWeight: 600, position: "relative", zIndex: 1
                        }}>
                            <Search size={16} /> Browse All
                        </Link>
                    </div>

                    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

                        {/* ── LEFT SIDEBAR PANEL ── */}
                        <aside style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* Profile card */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 24,
                                border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{ textAlign: "center", marginBottom: 20 }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
                                        background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : "linear-gradient(135deg, #dbeafe, #ede9fe)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", border: "3px solid #e2e8f0"
                                    }}>
                                        {!profilePhoto && <User size={28} color="#94a3b8" />}
                                    </div>
                                    <h3 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{volunteerName}</h3>
                                    <span style={{ fontSize: 13, color: "#94a3b8" }}>Volunteer</span>
                                </div>
                                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                                    <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 700 }}>Your Skills</h4>
                                    {skills.length > 0 ? (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {skills.map(skill => (
                                                <span key={skill} style={{
                                                    background: "linear-gradient(135deg, #eff6ff, #ede9fe)",
                                                    color: "#3730a3", padding: "5px 12px", borderRadius: 20,
                                                    fontSize: 12, fontWeight: 500, border: "1px solid #c7d2fe"
                                                }}>{skill}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 10px" }}>No skills added yet</p>
                                            <Link to="/edit-profile-volunteer" style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                padding: "6px 14px", background: "#7c3aed", color: "white",
                                                borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none"
                                            }}>+ Add Skills</Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Match stats card */}
                            <div style={{
                                background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                                borderRadius: 16, padding: 20, color: "white"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <Zap size={16} color="#a5b4fc" />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.06em" }}>Match Stats</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    {[
                                        { label: "Total Matches", value: matches.length, icon: <Sparkles size={14} /> },
                                        { label: "Excellent", value: matches.filter(m => getMatchScore(m.required_skills) >= 80).length, icon: <CheckCircle2 size={14} /> },
                                        { label: "Good Fits", value: matches.filter(m => getMatchScore(m.required_skills) >= 50).length, icon: <Zap size={14} /> },
                                        { label: "Your Skills", value: skills.length, icon: <BookOpen size={14} /> },
                                    ].map(stat => (
                                        <div key={stat.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "#a5b4fc" }}>
                                                {stat.icon}
                                                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</span>
                                            </div>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Filter by score */}
                            <div style={{
                                background: "white", borderRadius: 16, padding: 20,
                                border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <h4 style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", fontWeight: 700 }}>Filter by Match</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {[
                                        { value: "all",       label: "All Matches",       color: "#64748b", bg: "#f1f5f9" },
                                        { value: "excellent", label: "Excellent (80%+)",  color: "#16a34a", bg: "#dcfce7" },
                                        { value: "good",      label: "Good (50–79%)",     color: "#2563eb", bg: "#dbeafe" },
                                        { value: "partial",   label: "Partial (< 50%)",   color: "#d97706", bg: "#fef3c7" },
                                    ].map(f => (
                                        <button
                                            key={f.value}
                                            onClick={() => setFilterScore(f.value)}
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "9px 12px", borderRadius: 8, cursor: "pointer", width: "100%",
                                                border: filterScore === f.value ? `1.5px solid ${f.color}` : "1px solid #e2e8f0",
                                                background: filterScore === f.value ? f.bg : "#f8fafc",
                                                color: filterScore === f.value ? f.color : "#64748b",
                                                fontSize: 13, fontWeight: filterScore === f.value ? 600 : 500,
                                                transition: "all 0.15s"
                                            }}
                                        >
                                            <span>{f.label}</span>
                                            <span style={{
                                                fontSize: 12, fontWeight: 700,
                                                background: filterScore === f.value ? f.bg : "#e2e8f0",
                                                color: filterScore === f.value ? f.color : "#94a3b8",
                                                padding: "1px 8px", borderRadius: 20
                                            }}>
                                                {f.value === "all" ? matches.length
                                                    : f.value === "excellent" ? matches.filter(m => getMatchScore(m.required_skills) >= 80).length
                                                    : f.value === "good" ? matches.filter(m => { const s = getMatchScore(m.required_skills); return s >= 50 && s < 80; }).length
                                                    : matches.filter(m => getMatchScore(m.required_skills) < 50).length}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* ── RIGHT MAIN CONTENT ── */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* Search bar */}
                            <div style={{
                                background: "white", borderRadius: 14, padding: "12px 16px",
                                border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                            }}>
                                <Search size={16} color="#94a3b8" />
                                <input
                                    type="text"
                                    placeholder="Search by title, location or skill..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{
                                        flex: 1, border: "none", outline: "none",
                                        fontSize: 14, color: "#0f172a", background: "transparent",
                                        fontFamily: "inherit"
                                    }}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                        <X size={15} />
                                    </button>
                                )}
                            </div>

                            {/* Section heading */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Recommended For You</h2>
                                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                                        {loadingMatches ? "Searching..." : `${filteredMatches.length} opportunit${filteredMatches.length !== 1 ? "ies" : "y"} matched`}
                                    </p>
                                </div>
                                <Link to="/volunteer-opportunities" style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8,
                                    color: "#475569", textDecoration: "none", fontSize: 13, fontWeight: 500,
                                    background: "#f8fafc"
                                }}>Browse All <ArrowRight size={14} /></Link>
                            </div>

                            {/* No skills warning */}
                            {skills.length === 0 && (
                                <div style={{
                                    background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12,
                                    padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between"
                                }}>
                                    <p style={{ fontSize: 13, color: "#92400e", margin: 0, fontWeight: 500 }}>
                                        ⚠️ Add skills to your profile to get better matches!
                                    </p>
                                    <Link to="/edit-profile-volunteer" style={{
                                        fontSize: 13, color: "#d97706", fontWeight: 600, textDecoration: "none"
                                    }}>Add Skills →</Link>
                                </div>
                            )}

                            {/* Loading */}
                            {loadingMatches && (
                                <div style={{ textAlign: "center", padding: "48px 0" }}>
                                    <div style={{ width: 38, height: 38, border: "4px solid #e5e7eb", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                                    <p style={{ color: "#94a3b8", fontSize: 14 }}>Finding matching opportunities...</p>
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                </div>
                            )}

                            {/* No matches */}
                            {!loadingMatches && filteredMatches.length === 0 && (
                                <div style={{
                                    background: "white", borderRadius: 16, padding: "48px 32px",
                                    border: "1px solid #e2e8f0", textAlign: "center",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                                }}>
                                    <Briefcase size={36} color="#cbd5e1" style={{ marginBottom: 14 }} />
                                    <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
                                        {searchTerm ? "No results found" : "No Matches Yet"}
                                    </h4>
                                    <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px" }}>
                                        {searchTerm
                                            ? "Try a different search term or clear your filters."
                                            : skills.length === 0
                                                ? "Add skills to your profile to start seeing matches."
                                                : "No open opportunities match your skills right now. Check back soon!"}
                                    </p>
                                    {skills.length === 0 && (
                                        <Link to="/edit-profile-volunteer" style={{
                                            display: "inline-flex", alignItems: "center", gap: 8,
                                            padding: "10px 24px", background: "#7c3aed", color: "white",
                                            borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600
                                        }}>+ Add Skills</Link>
                                    )}
                                </div>
                            )}

                            {/* ── Match cards ── */}
                            {!loadingMatches && filteredMatches.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {filteredMatches
                                        .sort((a, b) => getMatchScore(b.required_skills) - getMatchScore(a.required_skills))
                                        .map(opp => {
                                            const score = getMatchScore(opp.required_skills);
                                            const badge = scoreBadge(score);
                                            const matchedSkills = getMatchedSkills(opp.required_skills);
                                            const otherSkills = (opp.required_skills || []).filter(s => !matchedSkills.includes(s));
                                            const isApplied = applySuccess === opp._id;
                                            const isApplying = applyingId === opp._id;

                                            return (
                                                <div
                                                    key={opp._id}
                                                    style={{
                                                        background: "white", borderRadius: 16, padding: 22,
                                                        border: "1px solid #e2e8f0",
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                                        transition: "box-shadow 0.2s, transform 0.2s"
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
                                                >
                                                    {/* Top row: title + score badge + status */}
                                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                                                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{opp.title}</h4>
                                                                {/* Match score */}
                                                                <span style={{
                                                                    fontSize: 12, fontWeight: 700, padding: "3px 10px",
                                                                    borderRadius: 20, background: badge.bg, color: badge.color,
                                                                    flexShrink: 0
                                                                }}>{badge.label} · {score}%</span>
                                                                {/* Status */}
                                                                <span style={{
                                                                    background: opp.status === "closed" ? "#fef2f2" : "#f0fdf4",
                                                                    color: opp.status === "closed" ? "#dc2626" : "#16a34a",
                                                                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                                                                    border: `1px solid ${opp.status === "closed" ? "#fecaca" : "#bbf7d0"}`,
                                                                    flexShrink: 0
                                                                }}>{opp.status === "closed" ? "Closed" : "Open"}</span>
                                                            </div>
                                                            {/* Location + duration */}
                                                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                                                {opp.location && (
                                                                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#64748b" }}>
                                                                        <MapPin size={13} color="#94a3b8" /> {opp.location}
                                                                    </span>
                                                                )}
                                                                {opp.duration && (
                                                                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#64748b" }}>
                                                                        <Clock size={13} color="#94a3b8" /> {opp.duration}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    {opp.description && (
                                                        <p style={{
                                                            fontSize: 14, color: "#475569", margin: "10px 0 12px", lineHeight: 1.6,
                                                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                                        }}>{opp.description}</p>
                                                    )}

                                                    {/* Skills */}
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                                                        {/* Matched skills — green */}
                                                        {matchedSkills.map(sk => (
                                                            <span key={sk} style={{
                                                                fontSize: 12, padding: "3px 10px", borderRadius: 20,
                                                                background: "#dcfce7", color: "#16a34a",
                                                                border: "1px solid #bbf7d0", fontWeight: 500
                                                            }}>✓ {sk}</span>
                                                        ))}
                                                        {/* Unmatched skills — grey */}
                                                        {otherSkills.slice(0, 4).map(sk => (
                                                            <span key={sk} style={{
                                                                fontSize: 12, padding: "3px 10px", borderRadius: 20,
                                                                background: "#f1f5f9", color: "#64748b",
                                                                border: "1px solid #e2e8f0", fontWeight: 500
                                                            }}>{sk}</span>
                                                        ))}
                                                        {otherSkills.length > 4 && (
                                                            <span style={{ fontSize: 12, color: "#94a3b8", padding: "3px 6px" }}>+{otherSkills.length - 4} more</span>
                                                        )}
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                                                        <Link to={`/opportunity/${opp._id}`} style={{
                                                            display: "flex", alignItems: "center", gap: 6,
                                                            fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600
                                                        }}>
                                                            <Eye size={14} /> View Details
                                                        </Link>
                                                        <button
                                                            onClick={() => handleApply(opp._id, opp.title)}
                                                            disabled={isApplied || isApplying || opp.status === "closed"}
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: 6,
                                                                padding: "9px 22px", borderRadius: 8, cursor: isApplied || opp.status === "closed" ? "default" : "pointer",
                                                                border: "none",
                                                                background: isApplied
                                                                    ? "#dcfce7"
                                                                    : opp.status === "closed"
                                                                        ? "#f1f5f9"
                                                                        : "#7c3aed",
                                                                color: isApplied
                                                                    ? "#16a34a"
                                                                    : opp.status === "closed"
                                                                        ? "#94a3b8"
                                                                        : "white",
                                                                fontSize: 13, fontWeight: 600,
                                                                transition: "all 0.2s",
                                                                opacity: isApplying ? 0.7 : 1
                                                            }}
                                                        >
                                                            {isApplying ? (
                                                                <>
                                                                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.65s linear infinite" }} />
                                                                    Applying...
                                                                </>
                                                            ) : isApplied ? (
                                                                <><CheckCircle2 size={14} /> Applied!</>
                                                            ) : opp.status === "closed" ? (
                                                                "Closed"
                                                            ) : (
                                                                "Apply Now"
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default VolunteerMatchSuggestions;
