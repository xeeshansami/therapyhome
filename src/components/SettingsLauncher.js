import React, { useState } from 'react';
import {
    Box, IconButton, Tooltip, Drawer, Typography, Divider, Stack, ToggleButton,
    ToggleButtonGroup, Badge,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useColorMode } from '../context/ColorModeContext';
import { primaryPresets } from '../theme';

// Presentation-only EduMin-style header controls + theme customizer.
// Renders: messages + notifications icons, a dark/light toggle, and a
// settings gear that opens a right-side customizer drawer. Also renders a
// floating gear tab on the right edge (matching the EduMin template).
// Purely visual / theming – no application data or logic touched.

const SettingsLauncher = () => {
    const { mode, primary, toggleColorMode, setMode, setPrimary } = useColorMode();
    const [open, setOpen] = useState(false);
    const isDark = mode === 'dark';

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.5 } }}>
                <Tooltip title="Messages">
                    <IconButton color="inherit" size="large">
                        <Badge color="secondary" variant="dot">
                            <MailOutlineIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Notifications">
                    <IconButton color="inherit" size="large">
                        <Badge color="error" variant="dot">
                            <NotificationsNoneOutlinedIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>
                <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                    <IconButton color="inherit" size="large" onClick={toggleColorMode}>
                        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Theme settings">
                    <IconButton color="inherit" size="large" onClick={() => setOpen(true)}>
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Floating customizer tab on the right edge (EduMin style) */}
            <Tooltip title="Theme settings" placement="left">
                <IconButton
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'fixed',
                        right: 0,
                        top: '46%',
                        zIndex: (t) => t.zIndex.drawer + 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: '10px 0 0 10px',
                        boxShadow: 3,
                        '&:hover': { bgcolor: 'primary.dark' },
                    }}
                >
                    <SettingsIcon />
                </IconButton>
            </Tooltip>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: 320, p: 0 } }}
            >
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Theme Settings</Typography>
                        <Typography variant="caption" color="text.secondary">Customize your dashboard</Typography>
                    </Box>
                    <IconButton onClick={() => setOpen(false)} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Divider />

                <Box sx={{ px: 2.5, py: 2.5 }}>
                    <Typography variant="overline" color="text.secondary">Appearance</Typography>
                    <ToggleButtonGroup
                        exclusive
                        fullWidth
                        value={mode}
                        onChange={(e, val) => { if (val) setMode(val); }}
                        sx={{ mt: 1 }}
                    >
                        <ToggleButton value="light">
                            <LightModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Light
                        </ToggleButton>
                        <ToggleButton value="dark">
                            <DarkModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Dark
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
                        Primary Color
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ mt: 1 }}>
                        {primaryPresets.map((c) => {
                            const active = c.value.toLowerCase() === String(primary).toLowerCase();
                            return (
                                <Tooltip title={c.name} key={c.value}>
                                    <Box
                                        onClick={() => setPrimary(c.value)}
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: '50%',
                                            bgcolor: c.value,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            boxShadow: active ? `0 0 0 3px ${c.value}55` : 'none',
                                            transition: 'transform .15s ease',
                                            '&:hover': { transform: 'scale(1.1)' },
                                        }}
                                    >
                                        {active && <CheckIcon fontSize="small" />}
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
};

export default SettingsLauncher;
