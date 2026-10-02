import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Stack,
    TextField,
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useColorMode } from '../../context/ColorModeContext';
import { primaryPresets } from '../../theme';
import { authSuccess } from '../../redux/userRelated/userSlice';

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

const AdminSettings = () => {
    const { mode, primary, setMode, setPrimary } = useColorMode();
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [form, setForm] = useState({ name: '', email: '', schoolName: '' });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null); // { severity, text }

    useEffect(() => {
        if (currentUser) {
            setForm({
                name: currentUser.name || '',
                email: currentUser.email || '',
                schoolName: currentUser.schoolName || '',
            });
        }
    }, [currentUser]);

    const dirty =
        form.name !== (currentUser?.name || '') ||
        form.email !== (currentUser?.email || '') ||
        form.schoolName !== (currentUser?.schoolName || '') ||
        password.length > 0;

    const handleField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setFeedback(null);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            setFeedback({ severity: 'error', text: 'Name is required.' });
            return;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
            setFeedback({ severity: 'error', text: 'Enter a valid email address.' });
            return;
        }
        if (!form.schoolName.trim()) {
            setFeedback({ severity: 'error', text: 'Organisation name is required.' });
            return;
        }
        if (password && password.length < 6) {
            setFeedback({ severity: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        if (password && password !== confirmPassword) {
            setFeedback({ severity: 'error', text: 'The two passwords do not match.' });
            return;
        }

        setSaving(true);
        setFeedback(null);
        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                schoolName: form.schoolName.trim(),
            };
            if (password) payload.password = password;

            const res = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/Admin/${currentUser._id}`,
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (res.data && res.data._id) {
                // Keep the signed-in user in step with what was saved. The response
                // omits the password, so carry the stored one over.
                const merged = { ...currentUser, ...res.data };
                dispatch(authSuccess(merged));
                setPassword('');
                setConfirmPassword('');
                setFeedback({ severity: 'success', text: 'Profile updated successfully.' });
            } else {
                setFeedback({ severity: 'error', text: res.data?.message || 'Unable to update profile.' });
            }
        } catch (err) {
            setFeedback({
                severity: 'error',
                text: err.response?.data?.message || 'Unable to update profile. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setForm({
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            schoolName: currentUser?.schoolName || '',
        });
        setPassword('');
        setConfirmPassword('');
        setFeedback(null);
    };

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
                        description="Update the details on your signed-in account."
                    >
                        {feedback && (
                            <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
                                {feedback.text}
                            </Alert>
                        )}

                        <Stack spacing={2}>
                            <TextField label="Name" value={form.name} onChange={handleField('name')} fullWidth required />
                            <TextField label="Email" type="email" value={form.email} onChange={handleField('email')} fullWidth required />
                            <TextField label="Organisation" value={form.schoolName} onChange={handleField('schoolName')} fullWidth required />
                            <TextField label="Role" value={currentUser?.role || ''} fullWidth disabled helperText="Role cannot be changed here." />
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <LockOutlinedIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Change password</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Leave blank to keep your current password.
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label="New password"
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setFeedback(null); }}
                                fullWidth
                                autoComplete="new-password"
                            />
                            <TextField
                                label="Confirm new password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setFeedback(null); }}
                                fullWidth
                                autoComplete="new-password"
                                error={Boolean(confirmPassword) && confirmPassword !== password}
                                helperText={Boolean(confirmPassword) && confirmPassword !== password ? 'Passwords do not match.' : ' '}
                            />
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="flex-end">
                            <Button onClick={handleReset} disabled={saving || !dirty}>Reset</Button>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving || !dirty}
                                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {saving ? 'Saving...' : 'Save changes'}
                            </Button>
                        </Stack>
                    </SectionCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminSettings;
