const MessageBox = ({ messages, loading, userEmail }) => {
    return (
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
            {loading ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>Loading messages...</div>
            ) : messages.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>No messages yet.</div>
            ) : (
                messages.map(message => {
                    const mine = message.sender_id === userEmail;
                    return (
                        <div
                            key={message._id}
                            style={{
                                alignSelf: mine ? "flex-end" : "flex-start",
                                maxWidth: "75%",
                                background: mine ? "#2563eb" : "#f1f5f9",
                                color: mine ? "white" : "#0f172a",
                                borderRadius: 12,
                                padding: "10px 12px"
                            }}
                        >
                            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{message.content}</div>
                            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MessageBox;
