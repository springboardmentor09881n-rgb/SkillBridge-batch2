import React, { useState } from 'react';
import './ProfileCreation.css';

const ProfileCreation = () => {
  const [userType, setUserType] = useState('volunteer'); // 'volunteer' or 'ngo'
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    location: '',
    bio: '',
    
    // Volunteer specific
    skills: '',
    
    // NGO specific
    organizationName: '',
    organizationDescription: '',
    website: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data based on user type
    const profileData = {
      userType,
      ...(userType === 'volunteer' ? {
        fullName: formData.fullName,
        skills: formData.skills,
        bio: formData.bio,
        location: formData.location
      } : {
        organizationName: formData.organizationName,
        organizationDescription: formData.organizationDescription,
        website: formData.website,
        location: formData.location,
        bio: formData.bio
      })
    };
    
    console.log('Profile Data:', profileData);
    // Add your API call here to save the profile
  };

  return (
    <div className="profile-creation-container">
      <div className="profile-creation-card">
        <h1 className="profile-title">Create Your Profile</h1>
        
        {/* User Type Selection */}
        <div className="user-type-selector">
          <button
            type="button"
            className={`type-btn ${userType === 'volunteer' ? 'active' : ''}`}
            onClick={() => setUserType('volunteer')}
          >
            Volunteer
          </button>
          <button
            type="button"
            className={`type-btn ${userType === 'ngo' ? 'active' : ''}`}
            onClick={() => setUserType('ngo')}
          >
            NGO
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {userType === 'volunteer' ? (
            // Volunteer Form Fields
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., Teaching, Medical Care, Event Management"
                  required
                />
                <small className="helper-text">Separate skills with commas</small>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter your city or region"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself and your volunteer interests"
                  rows="4"
                  required
                />
              </div>
            </>
          ) : (
            // NGO Form Fields
            <>
              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizationDescription">Organization Description</label>
                <textarea
                  id="organizationDescription"
                  name="organizationDescription"
                  value={formData.organizationDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your organization's mission and activities"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter your organization's location"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Additional information about your organization"
                  rows="4"
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreation;
