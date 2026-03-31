import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ChatPage from "../components/ChatPage";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import apiFetch, { PUBLIC_BASE_URL } from "../services/api";

const NGOMessages = () => {
    const [profilePhoto, setProfilePhoto] = useState("");
    const [searchParams] = useSearchParams();
    const selectedUserId = searchParams.get("user") || "";

    useEffect(() => {
        apiFetch("/dashboard/ngo", { method: "GET" })
            .then(d => { if (d?.photo_url) setProfilePhoto(`${PUBLIC_BASE_URL}${d.photo_url}`); })
            .catch(() => {});
    }, []);

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-container">
                <Header 
                    role="NGO" 
                    profilePhoto={profilePhoto} 
                    activePage="messages" 
                />

                <main className="content-inner">
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Messages</h2>
                        <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Communicate with volunteers and get smart match suggestions</p>
                    </div>


                    <ChatPage role="ngo" selectedUserId={selectedUserId} />
                </main>
            </div>
        </div>
    );
};

export default NGOMessages;
