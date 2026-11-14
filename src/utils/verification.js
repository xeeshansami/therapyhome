// Verification grant: after the admin enters their password + admin key once,
// the server returns a short-lived grant (15 min, bound to that admin). It is
// kept in sessionStorage (this tab only, gone when the tab closes) so the next
// sensitive step of the same workflow does not ask for the admin key again.
// The server still checks every action; OTP-protected actions still need an OTP.

const KEY = 'th.verificationGrant';

const userId = () => {
    try { return (JSON.parse(localStorage.getItem('user')) || {}).userId || null; } catch (e) { return null; }
};

export const saveGrant = (data) => {
    if (!data || !data.verificationToken) return;
    const ttl = Number(data.verificationExpiresIn) || 900;
    try {
        // Expire a little early so a grant is never used right at its limit.
        sessionStorage.setItem(KEY, JSON.stringify({ token: data.verificationToken, user: userId(), expiresAt: Date.now() + (ttl - 30) * 1000, savedAt: Date.now() }));
    } catch (e) { /* storage blocked: the admin is simply asked again */ }
};

/** The current grant for the signed-in admin, or null. */
export const currentGrant = () => {
    try {
        const g = JSON.parse(sessionStorage.getItem(KEY));
        if (!g || !g.token || g.user !== userId() || Date.now() > g.expiresAt) return null;
        return g;
    } catch (e) {
        return null;
    }
};

export const clearGrant = () => {
    try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
};
