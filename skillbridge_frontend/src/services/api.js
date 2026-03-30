import { getStoredToken } from "../utils/authStorage";

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = stripTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
);

export const PUBLIC_BASE_URL = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL;

export const WS_BASE_URL = stripTrailingSlash(
    import.meta.env.VITE_WS_BASE_URL || PUBLIC_BASE_URL.replace(/^http/i, "ws")
);

const apiFetch = async (endpoint, options = {}) => {
    const token = getStoredToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || data.message || "An error occurred");
    }

    return data;
};

export default apiFetch;
