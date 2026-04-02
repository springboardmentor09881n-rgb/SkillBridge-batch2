import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MessageSquare, Search, Sparkles, User, Info } from "lucide-react";
import ConversationList from "./chat/ConversationList";
import MessageBox from "./chat/MessageBox";
import MessageInput from "./chat/MessageInput";
import { useAuth } from "../context/AuthContext";
import apiFetch, { WS_BASE_URL } from "../services/api";
import "./ChatWorkspace.css";

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
    const [ngoSuggestions, setNgoSuggestions] = useState([]);
    const [activeMobileView, setActiveMobileView] = useState("list"); // 'list' or 'chat'
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const activeThreadIdRef = useRef("");

    const activeThread = useMemo(
        () => {
            const found = threads.find(thread => thread.user_id === activeThreadId);
            if (found) return found;

            const suggestion = role === "ngo"
                ? ngoSuggestions.find(v => v.user_id === activeThreadId)
                : volunteerSuggestions.find(v => v._id === activeThreadId);

            if (suggestion) {
                return {
                    user_id: activeThreadId,
                    display_name: suggestion.name,
                    chat_enabled: true,
                };
            }
            return null;
        },
        [threads, activeThreadId, role, ngoSuggestions, volunteerSuggestions]
    );

    useEffect(() => {
        activeThreadIdRef.current = activeThreadId;
        if (activeThreadId && window.innerWidth <= 1024) {
            setActiveMobileView("chat");
        }
    }, [activeThreadId]);

    const markConversationRead = useCallback(async (otherUserId) => {
        if (!otherUserId) return;
        try {
            await apiFetch(`/messages/read/${encodeURIComponent(otherUserId)}`, { method: "PUT" });
            setThreads(prev => prev.map(t => t.user_id === otherUserId ? { ...t, unread_count: 0 } : t));
        } catch {
            // Logically silent error
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
            setError(e.message || "Failed to load history");
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (role === "volunteer") {
            apiFetch("/opportunities/match", { method: "GET" })
                .then(data => setVolunteerSuggestions(Array.isArray(data) ? data : []))
                .catch(() => setVolunteerSuggestions([]));
        } else if (role === "ngo") {
            apiFetch("/opportunities/match-volunteers", { method: "GET" })
                .then(data => setNgoSuggestions(Array.isArray(data) ? data.slice(0, 3) : []))
                .catch(() => setNgoSuggestions([]));
        }
    }, [role]);

    useEffect(() => {
        fetchHistory(activeThreadId);
        if (activeThreadId) {
            markConversationRead(activeThreadId);
        }
    }, [activeThreadId, fetchHistory, markConversationRead]);

    useEffect(() => {
        if (!user?.email || !user?.token) return;
        let disposed = false;

        const connect = () => {
            const url = `${WS_BASE_URL}/ws/chat/${encodeURIComponent(user.email)}?token=${encodeURIComponent(user.token)}`;
            const socket = new WebSocket(url);
            wsRef.current = socket;

            socket.onmessage = (event) => {
                let payload;
                try { payload = JSON.parse(event.data); } catch { return; }

                if (payload.type === "message") {
                    const peerId = payload.sender_id === user.email ? payload.receiver_id : payload.sender_id;
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
                                unread_count: isActive || payload.sender_id === user.email ? 0 : (item.unread_count || 0) + 1,
                            };
                        });
                        if (!found) { fetchConversations(); return prev; }
                        return updated.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
                    });

                    if (isActive) {
                        setMessages(prev => [...prev, payload]);
                        if (payload.sender_id !== user.email) markConversationRead(peerId);
                    }
                }
            };
            socket.onclose = () => { if (!disposed) reconnectTimeoutRef.current = setTimeout(connect, 2000); };
        };
        connect();
        return () => { disposed = true; if (wsRef.current) wsRef.current.close(); };
    }, [user, fetchConversations, markConversationRead]);

    const sendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed || !activeThread || !activeThread.chat_enabled) return;
        const socket = wsRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return setError("Disconnected.");
        
        socket.send(JSON.stringify({ receiver_id: activeThread.user_id, content: trimmed }));
        setInput("");
        setError("");
    };

    return (
        <div className="chat-layout">
            <div className={`chat-threads-sidebar chat-card ${activeMobileView === "list" ? "mobile-active" : ""}`}>
                <div className="chat-header">
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Chats</h3>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                    <ConversationList
                        threads={threads}
                        activeThreadId={activeThreadId}
                        loading={loadingThreads}
                        onSelect={(id) => {
                            setActiveThreadId(id);
                            if (window.innerWidth <= 1024) setActiveMobileView("chat");
                        }}
                    />
                </div>
            </div>

            <div className={`chat-main-area chat-card ${activeMobileView === "chat" ? "mobile-active" : ""}`}>
                <div className="chat-header">
                    <button className="chat-back-btn" onClick={() => setActiveMobileView("list")}>
                        <ArrowLeft size={18} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: "var(--text-main)", fontSize: 16 }}>{activeThread?.display_name || "SkillBridge Connection"}</div>
                        <div style={{ fontSize: 12, color: activeThread?.chat_enabled ? "var(--color-ngo)" : "var(--color-warning)" }}>
                            {activeThread?.chat_enabled ? "Messaging active" : "Unlocks after application acceptance"}
                        </div>
                    </div>
                </div>

                <div className="chat-messages-scroll">
                    <MessageBox messages={messages} loading={loadingMessages} userEmail={user?.email} />
                    {error && <div style={{ fontSize: 12, color: "var(--color-error)", padding: 10, textAlign: "center" }}>{error}</div>}
                </div>

                <div className="chat-input-area">
                    <MessageInput
                        activeThread={activeThread}
                        input={input}
                        onInputChange={setInput}
                        onSend={sendMessage}
                    />
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ChatWorkspace;
