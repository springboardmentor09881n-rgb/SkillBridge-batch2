import { Send } from "lucide-react";

const MessageInput = ({ activeThread, input, onInputChange, onSend }) => {
    return (
        <div style={{ borderTop: "1px solid #e2e8f0", padding: 12, display: "flex", gap: 8 }}>
            <input
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder={activeThread?.chat_enabled ? "Type your message..." : "Chat unavailable"}
                disabled={!activeThread?.chat_enabled}
                style={{
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "10px 12px",
                    outline: "none",
                    background: activeThread?.chat_enabled ? "white" : "#f8fafc"
                }}
            />
            <button
                onClick={onSend}
                disabled={!activeThread?.chat_enabled}
                style={{
                    border: "none",
                    borderRadius: 10,
                    background: activeThread?.chat_enabled ? "#2563eb" : "#cbd5e1",
                    color: "white",
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: activeThread?.chat_enabled ? "pointer" : "not-allowed"
                }}
            >
                <Send size={16} />
            </button>
        </div>
    );
};

export default MessageInput;
