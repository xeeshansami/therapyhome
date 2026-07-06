import { createContext, useContext } from 'react';

// UI-only theme controls (mode + primary colour). No business logic.
export const ColorModeContext = createContext({
    mode: 'light',
    primary: '#4d44e0',
    toggleColorMode: () => {},
    setMode: () => {},
    setPrimary: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);
