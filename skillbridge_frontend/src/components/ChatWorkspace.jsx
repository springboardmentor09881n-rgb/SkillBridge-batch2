import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConversationList from "./chat/ConversationList";
import MessageBox from "./chat/MessageBox";
import MessageInput from "./chat/MessageInput";
import { useAuth } from "../context/AuthContext";
import apiFetch, { WS_BASE_URL } from "../services/api";

const ChatWorkspace = ({ role = "volunteer", selectedUserId = "" }) => {
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState("");
    const [messages, setMessages] = useState([]);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [volunteerSuggestions, setVolunteerSuggestions] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const activeThreadIdRef = useRef("");

    const activeThread = useMemo(
        () => threads.find(thread => thread.user_id === activeThreadId) || null,
        [threads, activeThreadId]
    );

    useEffect(() => {
        activeThreadIdRef.current = activeThreadId;
    }, [activeThreadId]);

    const markConversationRead = useCallback(async (otherUserId) => {
        if (!otherUserId) return;
        try {
            await apiFetch(`/messages/read/${encodeURIComponent(otherUserId)}`, { method: "PUT" });
            setThreads(prev => prev.map(t => t.user_id === otherUserId ? { ...t, unread_count: 0 } : t));
        } catch {
            // Keep the UI responsive even if the read-sync request fails.
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        setLoadingThreads(true);
        setError("");
        try {
            const data = await apiFetch("/messages/conversations", { method: "GET" });
            const conversationList = Array.isArray(data) ? data : [];
            setThreads(conversationList);

            if (conversationList.length) {
                const preferred = selectedUserId && conversationList.some(c => c.user_id === selectedUserId)
                    ? selectedUserId
                    : conversationList[0].user_id;
                setActiveThreadId(prev => prev || preferred);
            } else {
                setActiveThreadId("");
            }
        } catch (e) {
            setError(e.message || "Failed to load conversations");
            setThreads([]);
            setActiveThreadId("");
        } finally {
            setLoadingThreads(false);
        }
    }, [selectedUserId]);

    const fetchHistory = useCallback(async (otherUserId) => {
        if (!otherUserId) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        try {
            const data = await apiFetch(`/messages/history/${encodeURIComponent(otherUserId)}`, { method: "GET" });
            setMessages(Array.isArray(data) ? data : []);
            setThreads(prev => prev.map(t => t.user_id === otherUserId ? { ...t, unread_count: 0 } : t));
        } catch (e) {
            setMessages([]);
            setError(e.message || "Failed to load message history");
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (role !== "volunteer") return;
        apiFetch("/opportunities/match", { method: "GET" })
            .then(data => {
                const list = Array.isArray(data) ? data.slice(0, 3) : [];
                setVolunteerSuggestions(list);
            })
            .catch(() => setVolunteerSuggestions([]));
    }, [role]);

    useEffect(() => {
        fetchHistory(activeThreadId);
    }, [activeThreadId, fetchHistory]);

    useEffect(() => {
        if (!user?.email || !user?.token) return;
        let disposed = false;

        const connect = () => {
            const url = `${WS_BASE_URL}/ws/chat/${encodeURIComponent(user.email)}?token=${encodeURIComponent(user.token)}`;
            const socket = new WebSocket(url);
            wsRef.current = socket;

            socket.onopen = () => {
                setError("");
            };

            socket.onmessage = (event) => {
                let payload;
                try {
                    payload = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (payload.type === "error") {
                    setError(payload.detail || "Message delivery failed");
                    return;
                }

                if (payload.type === "message") {
                    const sender = payload.sender_id;
                    const receiver = payload.receiver_id;
                    const peerId = sender === user.email ? receiver : sender;
                    const isActive = peerId === activeThreadIdRef.current;

                    setThreads(prev => {
                        let found = false;
                        const updated = prev.map(item => {
                            if (item.user_id !== peerId) return item;
                            found = true;
                            return {
                                ...item,
                                last_message: payload.content,
                                last_message_at: payload.timestamp,
                                unread_count: isActive || sender === user.email ? 0 : (item.unread_count || 0) + 1,
                            };
                        });
                        if (!found) {
                            fetchConversations();
                            return prev;
                        }
                        return updated.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
                    });

                    if (isActive) {
                        setMessages(prev => [...prev, payload]);
                        if (sender !== user.email) {
                            void markConversationRead(peerId);
                        }
                    }
                }
            };

            socket.onerror = () => {
                setError("Live chat connection error");
            };

            socket.onclose = () => {
                if (wsRef.current === socket) {
                    wsRef.current = null;
                }
                if (!disposed) {
                    reconnectTimeoutRef.current = setTimeout(connect, 1000);
                }
            };
        };

        connect();

        return () => {
            disposed = true;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            const socket = wsRef.current;
            wsRef.current = null;
            if (socket && socket.readyState < WebSocket.CLOSING) {
                socket.close(1000, "component-unmount");
            }
        };
    }, [user?.email, user?.token, fetchConversations, markConversationRead]);

    const sendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed || !activeThread) return;

        if (!activeThread.chat_enabled) {
            setError("Chat is enabled only after an application is accepted");
            return;
        }

        const socket = wsRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setError("Chat is disconnected. Please refresh this page.");
            return;
        }

        socket.send(JSON.stringify({
            receiver_id: activeThread.user_id,
            content: trimmed,
        }));
        setInput("");
        setError("");
    };

    const suggestions = role === "ngo"
        ? threads.filter(t => t.chat_enabled).slice(0, 3).map(t => ({
            id: t.user_id,
            name: t.display_name,
            skillMatch: "Accepted applicant",
            match: "Chat enabled",
        }))
        : volunteerSuggestions.map(o => ({
            id: o._id,
            name: o.title,
            skillMatch: (o.match_meta?.skill_matches || []).join(", ") || "Skill match available",
            match: o.match_meta?.location_match ? "Location matched" : "Skill matched",
        }));

    return (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: 18 }}>
            <ConversationList
                threads={threads}
                activeThreadId={activeThreadId}
                loading={loadingThreads}
                onSelect={setActiveThreadId}
            />

            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", minHeight: 500 }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{activeThread?.display_name || "Select a conversation"}</div>
                    <div style={{ fontSize: 12, color: activeThread?.chat_enabled ? "#64748b" : "#d97706", marginTop: 2 }}>
                        {activeThread ? (activeThread.chat_enabled ? "Chat enabled" : "Chat unlocks after application acceptance") : ""}
                    </div>
                </div>

                <MessageBox messages={messages} loading={loadingMessages} userEmail={user?.email} />

                {error && (
                    <div style={{ margin: "0 12px 10px", fontSize: 12, color: "#dc2626" }}>{error}</div>
                )}

                <MessageInput
                    activeThread={activeThread}
                    input={input}
                    onInputChange={setInput}
                    onSend={sendMessage}
                />
            </div>

            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Match Suggestions</h3>
                <p style={{ margin: "6px 0 14px", color: "#64748b", fontSize: 12 }}>
                    {role === "ngo" ? "Accepted volunteers ready to chat" : "Recommended opportunities based on your profile"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {suggestions.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#64748b" }}>No suggestions available.</div>
                    ) : (
                        suggestions.map(item => (
                            <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.name}</div>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{item.skillMatch}</div>
                                <div style={{ marginTop: 8, fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{item.match}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatWorkspace;
