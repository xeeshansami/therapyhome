import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme, tokens } from './theme';
import { ColorModeContext } from './context/ColorModeContext';

// Presentation-layer provider: manages light/dark mode + primary colour,
// persists the choice, exposes CSS variables via <html data-theme> and
// supplies the MUI theme. Does not touch any application data/logic.

// Local copy of the theme's shade() so the CSS variable can expose a hover tint
// without importing the whole theme factory.
const shadeHex = (hex, amount) => {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const num = parseInt(full, 16);
    if (Number.isNaN(num)) return hex;
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - amount))));
    const r = clamp((num >> 16) & 255);
    const g = clamp((num >> 8) & 255);
    const b = clamp(num & 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const readStored = (key, fallback) => {
    try {
        const v = window.localStorage.getItem(key);
        return v || fallback;
    } catch (e) {
        return fallback;
    }
};

const ThemeModeProvider = ({ children }) => {
    const [mode, setModeState] = useState(() => readStored('th_mode', 'light'));
    const [primary, setPrimaryState] = useState(() => readStored('th_primary_v2', tokens.primary));

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        try { window.localStorage.setItem('th_mode', mode); } catch (e) {}
    }, [mode]);

    useEffect(() => {
        document.documentElement.style.setProperty('--color-primary', primary);
        document.documentElement.style.setProperty('--color-primary-dark', shadeHex(primary, 0.18));
        try { window.localStorage.setItem('th_primary_v2', primary); } catch (e) {}
    }, [primary]);

    const colorMode = useMemo(() => ({
        mode,
        primary,
        toggleColorMode: () => setModeState((m) => (m === 'light' ? 'dark' : 'light')),
        setMode: (m) => setModeState(m),
        setPrimary: (p) => setPrimaryState(p),
    }), [mode, primary]);

    const theme = useMemo(() => createAppTheme(mode, primary), [mode, primary]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default ThemeModeProvider;
