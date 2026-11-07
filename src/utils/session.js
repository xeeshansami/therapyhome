import axios from 'axios';

// Every API call carries the signed-in admin's session token. When the server
// says the session is no longer valid (expired, password changed, account
// disabled), the stored session is cleared and the login page is shown.

const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
        return null;
    }
};

export const sessionToken = () => (readUser() || {}).token || null;

let installed = false;

export const installSession = (onExpired) => {
    if (installed) return;
    installed = true;
    // Sessions saved before sign-in tokens existed cannot call the API: sign in again.
    if (readUser() && !sessionToken()) {
        try { localStorage.removeItem('user'); } catch (e) { /* ignore */ }
        if (onExpired) onExpired();
    }
    axios.interceptors.request.use((config) => {
        const token = sessionToken();
        const base = process.env.REACT_APP_BASE_URL || '';
        const url = config.url || '';
        // Only our own API gets the token.
        if (token && (url.startsWith(base) || url.startsWith('/'))) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    axios.interceptors.response.use(
        (res) => res,
        (error) => {
            const status = error && error.response && error.response.status;
            const url = (error && error.config && error.config.url) || '';
            const isLogin = /\/(AdminLogin|app\/login)$/.test(url);
            if (status === 401 && !isLogin && readUser()) {
                try { localStorage.removeItem('user'); } catch (e) { /* ignore */ }
                if (onExpired) onExpired();
            }
            return Promise.reject(error);
        }
    );
};
