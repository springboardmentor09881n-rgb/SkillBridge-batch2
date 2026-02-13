import React, { useState } from "react";
import "./ProfileForm.css";

function ProfileForm() {
  const [role, setRole] = useState("volunteer");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile Saved");
  };

  return (
    <div className="profile-wrapper">
      <form className="profile-card" onSubmit={handleSubmit}>
        <h2>Create Profile</h2>

        <label>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="volunteer">Volunteer</option>
          <option value="ngo">NGO</option>
        </select>

        <input type="text" placeholder="Location" />

        <textarea placeholder="Short Bio"></textarea>

        {role === "volunteer" && (
          <input type="text" placeholder="Skills (comma separated)" />
        )}

        {role === "ngo" && (
          <>
            <input type="text" placeholder="Organization Name" />
            <textarea placeholder="Organization Description"></textarea>
            <input type="text" placeholder="Website URL" />
          </>
        )}

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default ProfileForm;
