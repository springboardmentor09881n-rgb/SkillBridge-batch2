import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Briefcase, 
  ClipboardList, 
  MessageSquare, 
  UserCircle, 
  LogOut,
  X,
  Sparkles
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    const normalizedRole = user?.role?.toLowerCase();
    const navItems = normalizedRole === "volunteer" 
        ? [
            { to: "/volunteer-dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
            { to: "/volunteer-opportunities", label: "Opportunities", icon: <Briefcase size={20} /> },
            { to: "/volunteer-applications", label: "Applications", icon: <ClipboardList size={20} /> },
            { to: "/volunteer-messages", label: "Messages", icon: <MessageSquare size={20} /> },
            { to: "/edit-profile-volunteer", label: "Edit Profile", icon: <UserCircle size={20} /> },
        ]
        : [
            { to: "/ngo-dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
            { to: "/manage-opportunities", label: "Opportunities", icon: <Briefcase size={20} /> },
            { to: "/ngo-applications", label: "Applications", icon: <ClipboardList size={20} /> },
            { to: "/ngo-messages", label: "Messages", icon: <MessageSquare size={20} /> },
            { to: "/edit-profile-ngo", label: "Edit Profile", icon: <UserCircle size={20} /> },
        ];

    const brandColor = normalizedRole === "ngo" ? "var(--color-ngo)" : "var(--color-volunteer)";

    return (
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <h2>SkillBridge</h2>
                <button 
                  className="sidebar-close-btn" 
                  onClick={() => document.querySelector('.app-sidebar').classList.remove('open')}
                >
                  <X size={24} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.to} className="nav-item-wrapper">
                            <Link 
                                to={item.to} 
                                className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
                                onClick={() => document.querySelector('.app-sidebar').classList.remove('open')}
                                style={isActive(item.to) ? { color: "white", backgroundColor: brandColor } : {}}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
