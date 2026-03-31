import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Building2, User } from "lucide-react";
import NotificationBell from "./NotificationBell";
import "./Header.css";

const Header = ({ role, profilePhoto, activePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const normalizedRole = role?.toLowerCase();
  const navLinks = normalizedRole === "ngo" 
    ? [
        { to: "/ngo-dashboard", label: "Dashboard", id: "dashboard" },
        { to: "/manage-opportunities", label: "Opportunities", id: "opportunities" },
        { to: "/ngo-applications", label: "Applications", id: "applications" },
        { to: "/ngo-messages", label: "Messages", id: "messages" }
      ]
    : [
        { to: "/volunteer-dashboard", label: "Dashboard", id: "dashboard" },
        { to: "/volunteer-opportunities", label: "Opportunities", id: "opportunities" },
        { to: "/volunteer-applications", label: "Applications", id: "applications" },
        { to: "/volunteer-messages", label: "Messages", id: "messages" }
      ];

  const profileLink = normalizedRole === "ngo" ? "/edit-profile-ngo" : "/edit-profile-volunteer";
  const brandColor = normalizedRole === "ngo" ? "var(--color-ngo)" : "var(--color-volunteer)";
  const softColor = normalizedRole === "ngo" ? "var(--color-ngo-soft)" : "var(--color-volunteer-soft)";

  return (
    <header className="main-header">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle" 
          onClick={() => {
            const sidebar = document.querySelector('.app-sidebar');
            sidebar?.classList.toggle('open');
          }}
        >
          <Menu size={24} />
        </button>
        <h1 className="brand-logo">SkillBridge</h1>
      </div>

      <nav className="desktop-nav">
        {navLinks.map((link) => (
          <Link
            key={link.id}
            to={link.to}
            className={`nav-item ${activePage === link.id ? "active" : ""}`}
            style={activePage === link.id ? { color: brandColor, background: softColor } : {}}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <span className="role-badge" style={{ background: softColor, color: brandColor }}>
          {role}
        </span>
        <NotificationBell />
        <Link to={profileLink} className="profile-link">
          <div className="profile-avatar" style={{ 
            background: profilePhoto ? `url("${profilePhoto}") center/cover no-repeat` : softColor 
          }}>
            {!profilePhoto && (normalizedRole === "ngo" ? <Building2 size={18} color={brandColor} /> : <User size={18} color={brandColor} />)}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
