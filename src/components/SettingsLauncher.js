import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useColorMode } from '../context/ColorModeContext';

// Header control: only the light/dark switch. Accent colour and every other
// setting live on the Settings page (profile menu > Settings).
const SettingsLauncher = () => {
    const { mode, toggleColorMode } = useColorMode();
    const isDark = mode === 'dark';

    return (
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton color="inherit" size="large" onClick={toggleColorMode} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default SettingsLauncher;
