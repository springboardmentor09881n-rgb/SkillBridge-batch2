const ConversationList = ({ threads, activeThreadId, loading, onSelect }) => {
    const formatTime = (ts) => {
        if (!ts) return "";
        const date = new Date(ts);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {loading ? (
                <div style={{ padding: 12, fontSize: 13, color: "#64748b" }}>Loading conversations...</div>
            ) : threads.length === 0 ? (
                <div style={{ padding: 12, fontSize: 13, color: "#64748b" }}>
                    No active conversations yet.
                </div>
            ) : (
                threads.map(thread => (
                    <button
                        key={thread.user_id}
                        onClick={() => onSelect(thread.user_id)}
                        style={{
                            width: "100%",
                            textAlign: "left",
                            border: "none",
                            background: activeThreadId === thread.user_id ? "#eff6ff" : "white",
                            borderBottom: "1px solid #f1f5f9",
                            padding: "12px 14px",
                            cursor: "pointer"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{thread.display_name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                                    {formatTime(thread.last_message_at)}
                                </span>
                                {thread.unread_count > 0 && (
                                    <span style={{
                                        minWidth: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        background: "#2563eb",
                                        color: "white",
                                        fontSize: 10,
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        {thread.unread_count}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {thread.last_message || (thread.chat_enabled ? "Start a conversation" : "Waiting for accepted application")}
                        </div>
                    </button>
                ))
            )}
        </div>
    );
};

export default ConversationList;
