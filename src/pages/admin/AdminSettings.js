import React from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckIcon from '@mui/icons-material/Check';
import { useColorMode } from '../../context/ColorModeContext';
import { primaryPresets } from '../../theme';

// Settings surface for the preferences the app actually has: colour mode and
// primary colour, both already provided by ColorModeContext. Nothing else is
// shown, because nothing else is backed by real state.
const SectionCard = ({ icon: Icon, title, description, children }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2.5 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'action.hover',
                        color: 'primary.main',
                        flexShrink: 0,
                    }}
                >
                    <Icon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{description}</Typography>
                </Box>
            </Stack>
            <Divider sx={{ mb: 2.5 }} />
            {children}
        </CardContent>
    </Card>
);

const ReadOnlyRow = ({ label, value }) => (
    <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ py: 1.25 }}
        justifyContent="space-between"
        spacing={0.5}
    >
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
            {value || '—'}
        </Typography>
    </Stack>
);

const AdminSettings = () => {
    const { mode, primary, setMode, setPrimary } = useColorMode();
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                    Preferences for how TherapyHome looks on this device.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <SectionCard
                        icon={PaletteOutlinedIcon}
                        title="Appearance"
                        description="Colour mode and accent colour. Saved on this device."
                    >
                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Colour mode
                        </Typography>
                        <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={mode}
                            onChange={(e, val) => { if (val) setMode(val); }}
                            sx={{ mb: 3 }}
                        >
                            <ToggleButton value="light" sx={{ px: 2.5 }}>
                                <LightModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Light
                            </ToggleButton>
                            <ToggleButton value="dark" sx={{ px: 2.5 }}>
                                <DarkModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Dark
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Accent colour
                        </Typography>
                        <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', gap: 1.25 }}>
                            {primaryPresets.map((c) => {
                                const active = c.value.toLowerCase() === String(primary).toLowerCase();
                                return (
                                    <Tooltip key={c.value} title={c.name}>
                                        <Box
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Accent colour ${c.name}`}
                                            aria-pressed={active}
                                            onClick={() => setPrimary(c.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') setPrimary(c.value);
                                            }}
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: '50%',
                                                bgcolor: c.value,
                                                cursor: 'pointer',
                                                display: 'grid',
                                                placeItems: 'center',
                                                color: '#fff',
                                                outline: active ? '2px solid' : '1px solid',
                                                outlineColor: active ? 'text.primary' : 'divider',
                                                outlineOffset: 2,
                                                transition: 'transform .15s ease',
                                                '&:hover': { transform: 'translateY(-2px)' },
                                            }}
                                        >
                                            {active && <CheckIcon sx={{ fontSize: 18 }} />}
                                        </Box>
                                    </Tooltip>
                                );
                            })}
                        </Stack>
                    </SectionCard>
                </Grid>

                <Grid item xs={12} md={5}>
                    <SectionCard
                        icon={PersonOutlineIcon}
                        title="Account"
                        description="Details from your signed-in account."
                    >
                        <ReadOnlyRow label="Name" value={currentUser?.name} />
                        <Divider />
                        <ReadOnlyRow label="Email" value={currentUser?.email} />
                        <Divider />
                        <ReadOnlyRow label="Organisation" value={currentUser?.schoolName} />
                        <Divider />
                        <ReadOnlyRow label="Role" value={currentUser?.role} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                            These details are read-only here — the app has no account update endpoint.
                        </Typography>
                    </SectionCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminSettings;
