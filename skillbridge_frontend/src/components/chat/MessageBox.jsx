const MessageBox = ({ messages, loading, userEmail }) => {
    // Add default timestamp to messages if missing for consistent sorting
    const formattedMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString()
    }));

    // Group messages by calendar date
    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const date = new Date(msg.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    // Helper to format the display date
    const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

        return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    };

    const groupedMessages = groupMessagesByDate(formattedMessages);

    return (
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
            {loading ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Loading messages...</div>
            ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No messages yet. Start the conversation!</div>
            ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                        {/* Date Separator */}
                        <div style={{
                            textAlign: "center",
                            margin: "20px 0",
                            position: "relative"
                        }}>
                            <div style={{
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                right: 0,
                                height: "1px",
                                background: "#e2e8f0",
                                zIndex: 1
                            }}></div>
                            <span style={{
                                background: "#fff",
                                padding: "4px 12px",
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "#94a3b8",
                                position: "relative",
                                zIndex: 2,
                                borderRadius: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                {formatDisplayDate(date)}
                            </span>
                        </div>

                        {/* Messages for this date */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {msgs.map(message => {
                                const mine = message.sender_id === userEmail;
                                return (
                                    <div
                                        key={message._id}
                                        style={{
                                            alignSelf: mine ? "flex-end" : "flex-start",
                                            maxWidth: "75%",
                                            background: mine ? "#2563eb" : "#f1f5f9",
                                            color: mine ? "white" : "#0f172a",
                                            // Asymmetric corners for a modern chat look
                                            borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            padding: "10px 14px",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                            position: "relative"
                                        }}
                                    >
                                        <div style={{ fontSize: "13.5px", lineHeight: "1.5" }}>{message.content}</div>
                                        <div style={{
                                            fontSize: "10px",
                                            opacity: 0.7,
                                            marginTop: "4px",
                                            textAlign: "right",
                                            fontWeight: "500"
                                        }}>
                                            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MessageBox;
