import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../services/api";
import { getStoredRole } from "../utils/authStorage";

const ONE_HOUR_AGO_ISO = new Date(new Date().getTime() - 3600 * 1000).toISOString();
const MOCK_NOTIFICATIONS = [
    {
        _id: "mock-1",
        message: "You received a new message in Website Redesign chat.",
        is_read: false,
        type: "message",
        created_at: new Date().toISOString()
    },
    {
        _id: "mock-2",
        message: "A new opportunity match is available for your skills.",
        is_read: true,
        type: "match_suggestion",
        created_at: ONE_HOUR_AGO_ISO
    }
];

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await apiFetch("/notifications/unread-count", { method: "GET" });
            setUnreadCount(data.count);
        } catch {
            setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.is_read).length);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await apiFetch("/notifications/", { method: "GET" });
            setNotifications(data);
        } catch {
            setNotifications(MOCK_NOTIFICATIONS);
        }
    }, []);

    useEffect(() => {
        const kickoff = setTimeout(() => { fetchUnreadCount(); }, 0);
        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => {
            clearTimeout(kickoff);
            clearInterval(interval);
        };
    }, [fetchUnreadCount]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleBellClick = () => {
        if (!open) {
            fetchNotifications();
        }
        setOpen(!open);
    };

    const handleMarkAllRead = async () => {
        try {
            await apiFetch("/notifications/read-all", { method: "PUT" });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (e) {
            console.error("Failed to mark all as read", e);
        }
    };

    const handleNotificationClick = async (notif) => {
        // Mark as read
        if (!notif.is_read) {
            try {
                await apiFetch(`/notifications/${notif._id}/read`, { method: "PUT" });
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, is_read: true } : n));
            } catch (e) {
                console.error(e);
            }
        }
        // Navigate based on notification type
        setOpen(false);
        if (notif.type === "application_status") {
            navigate("/volunteer-applications");
        } else if (notif.type === "new_application") {
            navigate("/ngo-applications");
        } else if (notif.type === "message") {
            const role = getStoredRole();
            navigate(role === "NGO" ? "/ngo-messages" : "/volunteer-messages");
        } else if (notif.type === "match_suggestion") {
            if (notif.opportunity_id) {
                navigate(`/opportunity/${notif.opportunity_id}`);
            } else {
                navigate("/volunteer-opportunities");
            }
        } else if (notif.opportunity_id) {
            navigate(`/opportunity/${notif.opportunity_id}`);
        }
    };

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* Bell icon with badge */}
            <div onClick={handleBellClick} style={{ cursor: "pointer", position: "relative" }}>
                <Bell size={20} color={unreadCount > 0 ? "#374151" : "#9ca3af"} />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        background: "#ef4444",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "700",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white"
                    }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute",
                    top: "36px",
                    right: 0,
                    width: "340px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    border: "1px solid #e5e7eb",
                    zIndex: 1000
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#111827" }}>Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} style={{
                                background: "none", border: "none", color: "#3b82f6",
                                fontSize: "13px", cursor: "pointer", fontWeight: "500"
                            }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    {notifications.length === 0 ? (
                        <div style={{ padding: "30px 16px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                style={{
                                    padding: "12px 16px",
                                    borderBottom: "1px solid #f9fafb",
                                    cursor: "pointer",
                                    background: notif.is_read ? "white" : "#eff6ff",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "10px",
                                    transition: "background 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                                onMouseLeave={e => e.currentTarget.style.background = notif.is_read ? "white" : "#eff6ff"}
                            >
                                {/* Unread dot */}
                                <div style={{
                                    width: "8px", height: "8px", borderRadius: "50%",
                                    background: notif.is_read ? "transparent" : "#3b82f6",
                                    flexShrink: 0, marginTop: "6px"
                                }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: "14px", color: "#374151", fontWeight: notif.is_read ? "400" : "600", lineHeight: "1.4" }}>
                                        {notif.message}
                                    </p>
                                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                                        {timeAgo(notif.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
