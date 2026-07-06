import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme, tokens } from './theme';
import { ColorModeContext } from './context/ColorModeContext';

// Presentation-layer provider: manages light/dark mode + primary colour,
// persists the choice, exposes CSS variables via <html data-theme> and
// supplies the MUI theme. Does not touch any application data/logic.

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
    const [primary, setPrimaryState] = useState(() => readStored('th_primary', tokens.primary));

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        try { window.localStorage.setItem('th_mode', mode); } catch (e) {}
    }, [mode]);

    useEffect(() => {
        document.documentElement.style.setProperty('--color-primary', primary);
        try { window.localStorage.setItem('th_primary', primary); } catch (e) {}
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
