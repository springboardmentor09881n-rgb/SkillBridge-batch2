import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in and token is still valid
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("role");
        const email = localStorage.getItem("email");
        const username = localStorage.getItem("username");

        if (token && role) {
            // Decode JWT and check expiration
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const isExpired = payload.expires && payload.expires < Date.now() / 1000;
                if (isExpired) {
                    // Token expired — clear stale session
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("email");
                    localStorage.removeItem("username");
                } else {
                    setUser({ token, role, email, username });
                }
            } catch {
                // Invalid token — clear it
                localStorage.removeItem("access_token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                localStorage.removeItem("username");
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        setUser({
            token: data.access_token,
            role: data.role,
            email: data.email,
            username: data.username,
        });
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("username");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
