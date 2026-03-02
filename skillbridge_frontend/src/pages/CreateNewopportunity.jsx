import { useState } from "react";
import "./CreateNewOpportunity.css";

export default function CreateOpportunity({ onBack, onSubmit, ngoName = "HopeForAll Foundation" }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: [],
    duration: "",
    location: "",
    status: "open",
  });

  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formData.requiredSkills.includes(trimmed)) { setSkillInput(""); return; }
    setFormData((prev) => ({ ...prev, requiredSkills: [...prev.requiredSkills, trimmed] }));
    setSkillInput("");
    if (errors.requiredSkills) setErrors((prev) => ({ ...prev, requiredSkills: "" }));
  };

  const handleSkillKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } };
  const removeSkill = (skill) =>
    setFormData((prev) => ({ ...prev, requiredSkills: prev.requiredSkills.filter((s) => s !== skill) }));

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Title is required.";
    if (!formData.description.trim()) e.description = "Description is required.";
    if (!formData.requiredSkills.length) e.requiredSkills = "Add at least one required skill.";
    if (!formData.duration.trim()) e.duration = "Duration is required.";
    if (!formData.location.trim()) e.location = "Location is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    if (onSubmit) onSubmit(formData);
  };

  const handleCancel = () => { if (onBack) onBack(); };

  /* ── Shared shell ── */
  const Shell = ({ children }) => (
    <div className="co-layout">
      {/* LEFT SIDEBAR */}
      <aside className="co-sidebar">
        <div className="co-sidebar-top">
          <div className="co-brand">
            <span className="co-brand-name">SkillBridge</span>
            <span className="co-brand-page">Dashboard</span>
          </div>
          <nav className="co-sidenav">
            <button className="co-sidenav-link" onClick={handleCancel}>Opportunities</button>
            <button className="co-sidenav-link">Applications</button>
            <button className="co-sidenav-link">Messages</button>
            <button className="co-sidenav-link">Edit Profile</button>
          </nav>
        </div>
        <button className="co-logout">Logout</button>
      </aside>

      {/* RIGHT AREA */}
      <div className="co-right">
        {/* TOP BAR */}
        <header className="co-topbar">
          <div className="co-topbar-brand">SkillBridge</div>
          <nav className="co-topnav">
            <button className="co-topnav-link" onClick={handleCancel}>Dashboard</button>
            <button className="co-topnav-link co-topnav-active">Opportunities</button>
            <button className="co-topnav-link">Messages</button>
          </nav>
          <div className="co-topbar-right">
            <span className="co-topbar-role">Ngo</span>
            <span className="co-topbar-bell" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </span>
            <div className="co-avatar" aria-label="Profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );

  /* ── Success screen ── */
  if (submitted) {
    return (
      <Shell>
        <main className="co-main co-main-center">
          <div className="co-success-card">
            <div className="co-success-icon">✓</div>
            <h2>Opportunity Created!</h2>
            <p>Your opportunity has been posted and is now visible to volunteers.</p>
            <button className="co-btn-primary" onClick={handleCancel}>Back to Dashboard</button>
          </div>
        </main>
      </Shell>
    );
  }

  /* ── Main form ── */
  return (
    <Shell>
      <main className="co-main">
        {/* Page heading row */}
        <div className="co-page-header">
          <button className="co-back-btn" onClick={handleCancel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <h1 className="co-page-title">Create New Opportunity</h1>
        </div>

        {/* Form card */}
        <div className="co-card">
          <form onSubmit={handleSubmit} noValidate>

            {/* Title */}
            <div className="co-field">
              <label className="co-label" htmlFor="co-title">Title</label>
              <input
                id="co-title" name="title" type="text"
                className={`co-input${errors.title ? " co-err-border" : ""}`}
                placeholder="e.g. Website Redesign"
                value={formData.title} onChange={handleChange}
              />
              {errors.title && <span className="co-errmsg">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="co-field">
              <label className="co-label" htmlFor="co-desc">Description</label>
              <textarea
                id="co-desc" name="description"
                className={`co-textarea${errors.description ? " co-err-border" : ""}`}
                placeholder="Provide details about the opportunity"
                value={formData.description} onChange={handleChange} rows={5}
              />
              {errors.description && <span className="co-errmsg">{errors.description}</span>}
            </div>

            {/* Required Skills */}
            <div className="co-field">
              <label className="co-label" htmlFor="co-skill">Required Skills</label>
              <div className="co-skill-row">
                <input
                  id="co-skill" type="text"
                  className={`co-input co-skill-input${errors.requiredSkills ? " co-err-border" : ""}`}
                  placeholder="e.g. Web Development"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                <button type="button" className="co-btn-add" onClick={addSkill}>Add</button>
              </div>
              {errors.requiredSkills && <span className="co-errmsg">{errors.requiredSkills}</span>}
              {formData.requiredSkills.length > 0 && (
                <div className="co-tags">
                  {formData.requiredSkills.map((skill) => (
                    <span key={skill} className="co-tag">
                      {skill}
                      <button type="button" className="co-tag-x" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Duration + Location */}
            <div className="co-row">
              <div className="co-field co-half">
                <label className="co-label" htmlFor="co-dur">Duration</label>
                <input
                  id="co-dur" name="duration" type="text"
                  className={`co-input${errors.duration ? " co-err-border" : ""}`}
                  placeholder="e.g. 2-3 weeks, Ongoing"
                  value={formData.duration} onChange={handleChange}
                />
                {errors.duration && <span className="co-errmsg">{errors.duration}</span>}
              </div>
              <div className="co-field co-half">
                <label className="co-label" htmlFor="co-loc">Location</label>
                <input
                  id="co-loc" name="location" type="text"
                  className={`co-input${errors.location ? " co-err-border" : ""}`}
                  placeholder="e.g. New York, NY, Remote"
                  value={formData.location} onChange={handleChange}
                />
                {errors.location && <span className="co-errmsg">{errors.location}</span>}
              </div>
            </div>

            {/* Status */}
            <div className="co-field">
              <label className="co-label" htmlFor="co-status">Status</label>
              <div className="co-select-wrap">
                <select id="co-status" name="status" className="co-select" value={formData.status} onChange={handleChange}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
                <span className="co-chevron" aria-hidden="true">▾</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="co-actions">
              <button type="button" className="co-btn-cancel" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="co-btn-primary" disabled={submitting}>
                {submitting ? <span className="co-spinner" /> : "Create"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </Shell>
  );
}
