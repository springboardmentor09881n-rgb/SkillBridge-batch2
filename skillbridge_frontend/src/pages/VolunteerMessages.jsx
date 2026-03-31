import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ChatPage from "../components/ChatPage";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";

const VolunteerMessages = () => {
    const [profilePhoto, setProfilePhoto] = useState("");
    const [searchParams] = useSearchParams();
    const selectedUserId = searchParams.get("user") || "";

    useEffect(() => {
        apiFetch("/dashboard/volunteer", { method: "GET" })
            .then(data => { if (data?.photo_url) setProfilePhoto(`${PUBLIC_BASE_URL}${data.photo_url}`); })
            .catch(() => {});
    }, []);

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role="Volunteer" 
                    profilePhoto={profilePhoto} 
                    activePage="messages" 
                />

                <main className="content-inner">

                    <header style={{ marginBottom: "28px" }}>
                        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Messages</h2>
                        <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>Send and receive updates from NGOs in real-time.</p>
                    </header>
                    
                    <ChatPage role="volunteer" selectedUserId={selectedUserId} />
                </main>
            </div>
        </div>
    );
};

export default VolunteerMessages;
