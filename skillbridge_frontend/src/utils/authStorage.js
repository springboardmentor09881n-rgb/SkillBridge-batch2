const ACCESS_TOKEN_KEY = "access_token";
const ROLE_KEY = "role";
const EMAIL_KEY = "email";
const USERNAME_KEY = "username";

export const getStoredAuth = () => ({
    token: sessionStorage.getItem(ACCESS_TOKEN_KEY),
    role: sessionStorage.getItem(ROLE_KEY),
    email: sessionStorage.getItem(EMAIL_KEY),
    username: sessionStorage.getItem(USERNAME_KEY),
});

export const setStoredAuth = ({ access_token, role, email, username }) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    sessionStorage.setItem(ROLE_KEY, role);
    sessionStorage.setItem(EMAIL_KEY, email);
    sessionStorage.setItem(USERNAME_KEY, username);
};

export const clearStoredAuth = () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
};

export const getStoredToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredRole = () => sessionStorage.getItem(ROLE_KEY);
