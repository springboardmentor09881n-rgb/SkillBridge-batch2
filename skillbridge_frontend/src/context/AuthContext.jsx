import { createContext, useContext, useEffect, useState } from "react";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../utils/authStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { token, role, email, username } = getStoredAuth();

        if (token && role) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const isExpired = payload.expires && payload.expires < Date.now() / 1000;
                if (isExpired) {
                    clearStoredAuth();
                } else {
                    setUser({ token, role, email, username });
                }
            } catch {
                clearStoredAuth();
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        setStoredAuth(data);
        setUser({
            token: data.access_token,
            role: data.role,
            email: data.email,
            username: data.username,
        });
    };

    const logout = () => {
        clearStoredAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
