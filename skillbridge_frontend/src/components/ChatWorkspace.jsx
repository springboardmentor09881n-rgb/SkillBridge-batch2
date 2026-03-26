import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const volunteerSuggestions = [
    { id: 1, name: "Green Earth Foundation", skillMatch: "Environment Campaigns", match: "94%" },
    { id: 2, name: "Hope Education Trust", skillMatch: "Teaching & Mentoring", match: "89%" },
    { id: 3, name: "Care Health Mission", skillMatch: "Event Coordination", match: "84%" }
];

const ngoSuggestions = [
    { id: 1, name: "Aarav Sharma", skillMatch: "Web Development", match: "96%" },
    { id: 2, name: "Meera Nair", skillMatch: "Content Writing", match: "90%" },
    { id: 3, name: "Rahul Patel", skillMatch: "Digital Marketing", match: "86%" }
];

const initialThreadsByRole = {
    volunteer: [
        {
            id: 1,
            title: "Green Earth Foundation",
            subtitle: "Website Redesign",
            messages: [
                { id: 1, sender: "them", text: "Hi! We reviewed your profile and loved your portfolio.", time: "10:10 AM" },
                { id: 2, sender: "me", text: "Thanks! Happy to contribute. Can we discuss the timeline?", time: "10:12 AM" }
            ]
        },
        {
            id: 2,
            title: "Hope Education Trust",
            subtitle: "Translation Materials",
            messages: [{ id: 1, sender: "them", text: "Would you be available for 3-4 hours weekly?", time: "Yesterday" }]
        }
    ],
    ngo: [
        {
            id: 1,
            title: "Aarav Sharma",
            subtitle: "Frontend Volunteer",
            messages: [
                { id: 1, sender: "them", text: "I can start this weekend. Please share design references.", time: "09:25 AM" },
                { id: 2, sender: "me", text: "Great. Sharing Figma link shortly.", time: "09:30 AM" }
            ]
        },
        {
            id: 2,
            title: "Meera Nair",
            subtitle: "Content Support",
            messages: [{ id: 1, sender: "them", text: "Can I help with social media content also?", time: "Yesterday" }]
        }
    ]
};

const ChatWorkspace = ({ role = "volunteer" }) => {
    const [threads, setThreads] = useState(initialThreadsByRole[role] || initialThreadsByRole.volunteer);
    const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id || null);
    const [input, setInput] = useState("");
    const [newMessageBadge, setNewMessageBadge] = useState(0);

    const suggestions = role === "ngo" ? ngoSuggestions : volunteerSuggestions;

    const activeThread = useMemo(
        () => threads.find(thread => thread.id === activeThreadId) || threads[0],
        [threads, activeThreadId]
    );

    const sendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed || !activeThread) return;

        setThreads(prev =>
            prev.map(thread =>
                thread.id === activeThread.id
                    ? {
                        ...thread,
                        messages: [
                            ...thread.messages,
                            {
                                id: Date.now(),
                                sender: "me",
                                text: trimmed,
                                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            }
                        ]
                    }
                    : thread
            )
        );
        setInput("");
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setThreads(prev => {
                if (!prev.length) return prev;
                const targetIndex = Math.floor(Math.random() * prev.length);
                const roleText = role === "ngo"
                    ? "Thanks! I have updated my availability."
                    : "Noted. We will share next steps soon.";

                const updated = [...prev];
                const targetThread = updated[targetIndex];
                updated[targetIndex] = {
                    ...targetThread,
                    messages: [
                        ...targetThread.messages,
                        {
                            id: Date.now(),
                            sender: "them",
                            text: roleText,
                            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        }
                    ]
                };

                if (targetThread.id !== activeThreadId) {
                    setNewMessageBadge(count => count + 1);
                }
                return updated;
            });
        }, 15000);

        return () => clearInterval(interval);
    }, [activeThreadId, role]);

    const handleThreadSelect = (id) => {
        setActiveThreadId(id);
        setNewMessageBadge(0);
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: 18 }}>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, color: "#0f172a" }}>
                    Conversations {newMessageBadge > 0 ? `(${newMessageBadge} new)` : ""}
                </div>
                {threads.map(thread => (
                    <button
                        key={thread.id}
                        onClick={() => handleThreadSelect(thread.id)}
                        style={{
                            width: "100%",
                            textAlign: "left",
                            border: "none",
                            background: activeThreadId === thread.id ? "#eff6ff" : "white",
                            borderBottom: "1px solid #f1f5f9",
                            padding: "12px 14px",
                            cursor: "pointer"
                        }}
                    >
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{thread.title}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{thread.subtitle}</div>
                    </button>
                ))}
            </div>

            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", minHeight: 500 }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{activeThread?.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{activeThread?.subtitle}</div>
                </div>

                <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
                    {(activeThread?.messages || []).map(message => (
                        <div
                            key={message.id}
                            style={{
                                alignSelf: message.sender === "me" ? "flex-end" : "flex-start",
                                maxWidth: "75%",
                                background: message.sender === "me" ? "#2563eb" : "#f1f5f9",
                                color: message.sender === "me" ? "white" : "#0f172a",
                                borderRadius: 12,
                                padding: "10px 12px"
                            }}
                        >
                            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{message.text}</div>
                            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{message.time}</div>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", padding: 12, display: "flex", gap: 8 }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your message..."
                        style={{
                            flex: 1,
                            border: "1px solid #cbd5e1",
                            borderRadius: 10,
                            padding: "10px 12px",
                            outline: "none"
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        style={{
                            border: "none",
                            borderRadius: 10,
                            background: "#2563eb",
                            color: "white",
                            padding: "0 14px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                        }}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Match Suggestions</h3>
                <p style={{ margin: "6px 0 14px", color: "#64748b", fontSize: 12 }}>
                    {role === "ngo" ? "Recommended volunteers for your projects" : "Recommended NGOs based on your skills"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {suggestions.map(item => (
                        <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{item.skillMatch}</div>
                            <div style={{ marginTop: 8, fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Match Score: {item.match}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatWorkspace;
