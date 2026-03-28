import ChatWorkspace from "./ChatWorkspace";

const ChatPage = ({ role = "volunteer", selectedUserId = "" }) => {
    return <ChatWorkspace role={role} selectedUserId={selectedUserId} />;
};

export default ChatPage;
