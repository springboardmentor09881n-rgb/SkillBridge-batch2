const BASE_URL = "http://localhost:8000/api";

const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || data.message || "An error occurred");
    }

    return data;
};

export default apiFetch;
