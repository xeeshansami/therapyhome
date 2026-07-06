import { createTheme } from '@mui/material/styles';

// =============================================================
// EduMin-inspired theme (UI ONLY – no business logic).
// Supports light & dark mode via createAppTheme(mode, primary).
// =============================================================

export const tokens = {
    primary: '#4d44e0',
    primaryLight: '#6a5cff',
    primaryDark: '#3a32b5',
    accentAmber: '#ff9800',
    accentPurple: '#7b2ff7',
    accentRed: '#f5365c',
    accentTeal: '#11b3a4',
    bg: '#f4f5fa',
    paper: '#ffffff',
    textPrimary: '#2f3349',
    textSecondary: '#6b7280',
    border: '#eceef5',
    // Gradient presets for dashboard stat cards (mode independent)
    gradients: {
        indigo: 'linear-gradient(135deg, #6a5cff 0%, #4d44e0 100%)',
        amber: 'linear-gradient(135deg, #ffb547 0%, #ff9800 100%)',
        purple: 'linear-gradient(135deg, #9c5cf0 0%, #7b2ff7 100%)',
        red: 'linear-gradient(135deg, #ff6a85 0%, #f5365c 100%)',
        teal: 'linear-gradient(135deg, #2dd4bf 0%, #11b3a4 100%)',
    },
};

// Selectable primary colours for the EduMin customizer panel.
export const primaryPresets = [
    { name: 'Indigo', value: '#4d44e0' },
    { name: 'Blue', value: '#2f6fed' },
    { name: 'Teal', value: '#11b3a4' },
    { name: 'Purple', value: '#7b2ff7' },
    { name: 'Magenta', value: '#eb47b9' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Orange', value: '#ff7a18' },
    { name: 'Red', value: '#f5365c' },
];

const darken = (hex, amount = 0.18) => {
    const h = hex.replace('#', '');
    const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.max(0, Math.round(r * (1 - amount)));
    g = Math.max(0, Math.round(g * (1 - amount)));
    b = Math.max(0, Math.round(b * (1 - amount)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const createAppTheme = (mode = 'light', primary = tokens.primary) => {
    const isLight = mode === 'light';
    const primaryDark = darken(primary, 0.18);
    const primaryLight = darken(primary, -0.18);

    const palette = isLight
        ? {
            mode: 'light',
            primary: { main: primary, light: primaryLight, dark: primaryDark, contrastText: '#ffffff' },
            secondary: { main: tokens.accentRed, contrastText: '#ffffff' },
            background: { default: '#f4f5fa', paper: '#ffffff' },
            text: { primary: '#2f3349', secondary: '#6b7280' },
            divider: '#eceef5',
        }
        : {
            mode: 'dark',
            primary: { main: primary, light: primaryLight, dark: primaryDark, contrastText: '#ffffff' },
            secondary: { main: tokens.accentRed, contrastText: '#ffffff' },
            background: { default: '#151b2d', paper: '#1d2640' },
            text: { primary: '#e7e9f6', secondary: '#9aa3c0' },
            divider: 'rgba(255,255,255,0.08)',
        };

    return createTheme({
        palette,
        shape: { borderRadius: 12 },
        typography: {
            fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
            h4: { fontWeight: 700 },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600 },
            subtitle1: { fontWeight: 600 },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { backgroundColor: palette.background.default },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    rounded: { borderRadius: 14 },
                    elevation1: {
                        boxShadow: isLight
                            ? '0 2px 12px rgba(45, 55, 99, 0.06)'
                            : '0 2px 12px rgba(0, 0, 0, 0.35)',
                    },
                    elevation3: {
                        boxShadow: isLight
                            ? '0 6px 18px rgba(45, 55, 99, 0.08)'
                            : '0 6px 18px rgba(0, 0, 0, 0.40)',
                    },
                    elevation6: {
                        boxShadow: isLight
                            ? '0 10px 28px rgba(45, 55, 99, 0.10)'
                            : '0 10px 28px rgba(0, 0, 0, 0.45)',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        paddingLeft: 18,
                        paddingRight: 18,
                        transition: 'transform .15s ease, box-shadow .15s ease, background-color .15s ease',
                        '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
                    },
                    containedPrimary: {
                        boxShadow: `0 6px 16px ${primary}4d`,
                        '&:hover': { boxShadow: `0 8px 22px ${primary}66`, transform: 'translateY(-1px)' },
                    },
                    outlined: {
                        '&:hover': { backgroundColor: `${primary}14` },
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        marginLeft: 8,
                        marginRight: 8,
                        marginTop: 2,
                        marginBottom: 2,
                        transition: 'background-color .15s ease, color .15s ease',
                        '&:hover': { backgroundColor: `${primary}14` },
                        '&.Mui-selected': {
                            backgroundColor: `${primary}24`,
                            color: primary,
                            '& .MuiListItemIcon-root': { color: primary },
                            '& .MuiListItemText-primary': { fontWeight: 600 },
                            '&:hover': { backgroundColor: `${primary}33` },
                        },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: { root: { borderRadius: 10 } },
            },
            MuiTableCell: {
                styleOverrides: { head: { fontWeight: 600 } },
            },
            MuiAppBar: {
                styleOverrides: { root: { color: palette.text.primary } },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        transition: 'background-color .15s ease',
                    },
                },
            },
        },
    });
};

// Default light theme kept for any static importers.
const theme = createAppTheme('light', tokens.primary);
export default theme;
