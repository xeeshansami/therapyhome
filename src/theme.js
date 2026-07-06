import { createTheme } from '@mui/material/styles';

// =============================================================================
// Enterprise SaaS theme (UI ONLY — no business logic).
// Palette: Blue #2563EB / Indigo #4F46E5, with success/warning/danger.
// Typography: Inter. Supports light & dark via createAppTheme(mode, primary).
// Signature and exports (tokens, primaryPresets, createAppTheme, default) are
// unchanged so every existing importer keeps working.
// =============================================================================

export const tokens = {
    primary: '#2563EB',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#4F46E5',
    accentAmber: '#F59E0B',
    accentPurple: '#7C3AED',
    accentRed: '#EF4444',
    accentTeal: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0EA5E9',
    bg: '#F8FAFC',
    paper: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E9EDF3',
    // Gradient presets (mode independent). Keys kept stable — AdminHomePage and
    // other dashboards reference indigo/amber/purple/red/teal by name.
    gradients: {
        indigo: 'linear-gradient(135deg, #4F80FF 0%, #2563EB 100%)',
        amber: 'linear-gradient(135deg, #FBBF4C 0%, #F59E0B 100%)',
        purple: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
        red: 'linear-gradient(135deg, #FB7185 0%, #EF4444 100%)',
        teal: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
        brand: 'linear-gradient(120deg, #2563EB 0%, #4F46E5 55%, #7C3AED 100%)',
    },
};

// Selectable primary colours for the customizer panel.
export const primaryPresets = [
    { name: 'Blue', value: '#2563EB' },
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Violet', value: '#7C3AED' },
    { name: 'Teal', value: '#10B981' },
    { name: 'Cyan', value: '#0EA5E9' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Rose', value: '#F43F5E' },
];

const shade = (hex, amount = 0.18) => {
    const h = hex.replace('#', '');
    const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.max(0, Math.min(255, Math.round(r * (1 - amount))));
    g = Math.max(0, Math.min(255, Math.round(g * (1 - amount))));
    b = Math.max(0, Math.min(255, Math.round(b * (1 - amount))));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const createAppTheme = (mode = 'light', primary = tokens.primary) => {
    const isLight = mode === 'light';
    const primaryDark = shade(primary, 0.18);
    const primaryLight = shade(primary, -0.22);

    const palette = isLight
        ? {
            mode: 'light',
            primary: { main: primary, light: primaryLight, dark: primaryDark, contrastText: '#ffffff' },
            secondary: { main: tokens.secondary, light: shade(tokens.secondary, -0.2), dark: shade(tokens.secondary, 0.18), contrastText: '#ffffff' },
            success: { main: tokens.success, contrastText: '#ffffff' },
            warning: { main: tokens.warning, contrastText: '#ffffff' },
            error: { main: tokens.danger, contrastText: '#ffffff' },
            info: { main: tokens.info, contrastText: '#ffffff' },
            background: { default: '#F8FAFC', paper: '#FFFFFF' },
            text: { primary: '#0F172A', secondary: '#64748B' },
            divider: '#E9EDF3',
        }
        : {
            mode: 'dark',
            primary: { main: shade(primary, -0.05), light: primaryLight, dark: primaryDark, contrastText: '#ffffff' },
            secondary: { main: shade(tokens.secondary, -0.08), contrastText: '#ffffff' },
            success: { main: tokens.success, contrastText: '#04120c' },
            warning: { main: tokens.warning, contrastText: '#1a1200' },
            error: { main: tokens.danger, contrastText: '#1a0606' },
            info: { main: tokens.info, contrastText: '#02121a' },
            background: { default: '#0B1120', paper: '#111a2e' },
            text: { primary: '#E6EAF2', secondary: '#94A3B8' },
            divider: 'rgba(148,163,184,0.16)',
        };

    const softShadow = isLight
        ? '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)'
        : '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)';

    return createTheme({
        palette,
        shape: { borderRadius: 14 },
        typography: {
            fontFamily: '"Inter", "Plus Jakarta Sans", "Poppins", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 800, letterSpacing: '-0.03em' },
            h2: { fontWeight: 800, letterSpacing: '-0.03em' },
            h3: { fontWeight: 800, letterSpacing: '-0.02em' },
            h4: { fontWeight: 700, letterSpacing: '-0.02em' },
            h5: { fontWeight: 700, letterSpacing: '-0.01em' },
            h6: { fontWeight: 700 },
            subtitle1: { fontWeight: 600 },
            subtitle2: { fontWeight: 600 },
            body1: { letterSpacing: '-0.005em' },
            button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { backgroundColor: palette.background.default },
                    '*::selection': { backgroundColor: `${primary}33` },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    rounded: { borderRadius: 16 },
                    elevation1: { boxShadow: softShadow },
                    elevation3: {
                        boxShadow: isLight
                            ? '0 4px 14px rgba(15,23,42,0.08)'
                            : '0 4px 14px rgba(0,0,0,0.5)',
                    },
                    elevation6: {
                        boxShadow: isLight
                            ? '0 12px 32px rgba(15,23,42,0.12)'
                            : '0 12px 32px rgba(0,0,0,0.55)',
                    },
                },
            },
            MuiCard: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: {
                        borderRadius: 18,
                        border: `1px solid ${palette.divider}`,
                        backgroundImage: 'none',
                        boxShadow: softShadow,
                    },
                },
            },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        textTransform: 'none',
                        fontWeight: 600,
                        paddingTop: 8,
                        paddingBottom: 8,
                        paddingLeft: 18,
                        paddingRight: 18,
                        transition: 'transform .15s ease, box-shadow .15s ease, background-color .15s ease, border-color .15s ease',
                        '&:hover': { transform: 'translateY(-1px)' },
                        '&:active': { transform: 'translateY(0)' },
                    },
                    sizeLarge: { paddingTop: 11, paddingBottom: 11, fontSize: '0.975rem' },
                    containedPrimary: {
                        boxShadow: `0 6px 16px ${primary}40`,
                        '&:hover': { boxShadow: `0 8px 22px ${primary}55` },
                    },
                    outlined: {
                        borderColor: palette.divider,
                        '&:hover': { backgroundColor: `${primary}0f`, borderColor: primary },
                    },
                    // Ghost variant: use variant="text" for a subtle, fill-on-hover button.
                    text: {
                        '&:hover': { backgroundColor: `${primary}12` },
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        transition: 'background-color .15s ease, transform .15s ease',
                        '&:hover': { transform: 'translateY(-1px)' },
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        marginLeft: 10,
                        marginRight: 10,
                        marginTop: 2,
                        marginBottom: 2,
                        paddingTop: 9,
                        paddingBottom: 9,
                        transition: 'background-color .15s ease, color .15s ease',
                        '&:hover': { backgroundColor: `${primary}12` },
                        '&.Mui-selected': {
                            backgroundColor: `${primary}1a`,
                            color: primary,
                            '& .MuiListItemIcon-root': { color: primary },
                            '& .MuiListItemText-primary': { fontWeight: 700 },
                            '&:hover': { backgroundColor: `${primary}26` },
                        },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                        transition: 'box-shadow .15s ease, border-color .15s ease',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.divider },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: shade(primary, -0.1) },
                        '&.Mui-focused': { boxShadow: `0 0 0 4px ${primary}22` },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primary, borderWidth: 1.5 },
                    },
                },
            },
            MuiInputLabel: { styleOverrides: { root: { fontWeight: 500 } } },
            MuiTextField: { defaultProps: { variant: 'outlined' } },
            MuiChip: {
                styleOverrides: {
                    root: { borderRadius: 8, fontWeight: 600 },
                    filled: { border: 'none' },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '6px 10px',
                        backgroundColor: isLight ? '#0F172A' : '#e2e8f0',
                        color: isLight ? '#ffffff' : '#0F172A',
                    },
                    arrow: { color: isLight ? '#0F172A' : '#e2e8f0' },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 20,
                        backgroundImage: 'none',
                        boxShadow: isLight ? '0 24px 64px rgba(15,23,42,0.22)' : '0 24px 64px rgba(0,0,0,0.6)',
                    },
                },
            },
            MuiBackdrop: {
                styleOverrides: {
                    root: { backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' },
                    invisible: { backgroundColor: 'transparent', backdropFilter: 'none' },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        borderRadius: 14,
                        border: `1px solid ${palette.divider}`,
                        boxShadow: softShadow,
                        marginTop: 6,
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        marginLeft: 6,
                        marginRight: 6,
                        '&:hover': { backgroundColor: `${primary}10` },
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: { borderColor: palette.divider },
                    head: {
                        fontWeight: 700,
                        color: palette.text.secondary,
                        backgroundColor: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
                        textTransform: 'none',
                        fontSize: 13,
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        transition: 'background-color .15s ease',
                        '&:hover': { backgroundColor: isLight ? 'rgba(37,99,235,0.04)' : 'rgba(255,255,255,0.04)' },
                    },
                },
            },
            MuiTableContainer: {
                styleOverrides: {
                    root: { borderRadius: 16 },
                },
            },
            MuiAppBar: {
                styleOverrides: { root: { color: palette.text.primary, backgroundImage: 'none' } },
            },
            MuiSwitch: {
                styleOverrides: {
                    root: { padding: 8 },
                    track: { borderRadius: 22 / 2, opacity: 1, backgroundColor: isLight ? '#CBD5E1' : 'rgba(255,255,255,0.2)' },
                    thumb: { boxShadow: '0 1px 3px rgba(15,23,42,0.3)' },
                },
            },
            MuiCheckbox: { styleOverrides: { root: { borderRadius: 8 } } },
            MuiLinearProgress: { styleOverrides: { root: { borderRadius: 999, height: 8 } } },
            MuiAlert: {
                styleOverrides: {
                    root: { borderRadius: 12, fontWeight: 500, alignItems: 'center' },
                },
            },
            MuiAvatar: {
                styleOverrides: { root: { fontWeight: 700 } },
            },
            MuiTab: {
                styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 } },
            },
        },
    });
};

// Default light theme kept for any static importers.
const theme = createAppTheme('light', tokens.primary);
export default theme;
