import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    InputAdornment,
    Stack,
    Switch,
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
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import VerifyAdminDialog from '../../components/VerifyAdminDialog';
import PageHeader, { PageShell } from '../../components/PageHeader';
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

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Editable copy of the saved settings (numbers as text while typing). */
const toDraft = (data) => ({
    consultationFee: String(data.consultationFee),
    requireOtp: { ...data.requireOtp },
    payrollPolicy: { ...data.payrollPolicy },
    geofence: {
        enabled: !!(data.geofence && data.geofence.enabled),
        lat: data.geofence && data.geofence.lat !== null && data.geofence.lat !== undefined ? String(data.geofence.lat) : '',
        lng: data.geofence && data.geofence.lng !== null && data.geofence.lng !== undefined ? String(data.geofence.lng) : '',
        radiusMeters: String((data.geofence && data.geofence.radiusMeters) || 150),
    },
    attendancePolicy: {
        lateGraceMinutes: String(data.attendancePolicy.lateGraceMinutes),
        halfDayMinHours: String(data.attendancePolicy.halfDayMinHours),
        maxAccuracyMeters: String(data.attendancePolicy.maxAccuracyMeters),
        weekendDays: [...(data.attendancePolicy.weekendDays || [])],
        lateArrivalTime: data.attendancePolicy.lateArrivalTime || '09:00',
        lateRule: data.attendancePolicy.lateRule || 'staffSchedule',
        halfDayAfterTime: data.attendancePolicy.halfDayAfterTime ?? '11:00',
    },
    feePolicy: {
        dueStartDay: String((data.feePolicy && data.feePolicy.dueStartDay) ?? 1),
        dueEndDay: String((data.feePolicy && data.feePolicy.dueEndDay) ?? 7),
        lateFeeEnabled: !!(data.feePolicy && data.feePolicy.lateFeeEnabled),
        lateFeeType: (data.feePolicy && data.feePolicy.lateFeeType) || 'fixed',
        lateFeeAmount: String((data.feePolicy && data.feePolicy.lateFeeAmount) ?? 0),
        lateFeeMax: String((data.feePolicy && data.feePolicy.lateFeeMax) ?? 0),
    },
    staffDefaultPassword: '',
});

const AdminSettings = () => {
    const { mode, primary, setMode, setPrimary } = useColorMode();
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    // Co-admins can see school settings but only the super admin can change them (enforced by the API too).
    const isSuper = currentUser?.adminRole !== 'admin';

    const [form, setForm] = useState({ name: '', email: '', schoolName: '' });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null); // { severity, text }
    const [verify, setVerify] = useState(null); // { title, description, run }
    const [otpStep, setOtpStep] = useState(null); // { challengeId, sentTo, code, error }

    // Admin settings: consultation fee and per-action verification.
    const [settings, setSettings] = useState(null);
    const [draft, setDraft] = useState(null);
    const [settingsFeedback, setSettingsFeedback] = useState(null);

    const loadSettings = useCallback(async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/Admin/${currentUser._id}/settings`);
            setSettings(data);
            setDraft(toDraft(data));
        } catch (err) {
            setSettingsFeedback({ severity: 'error', text: 'Could not load settings.' });
        }
    }, [currentUser._id]);

    // Limited Admins have no access to system settings, so they are not loaded at all.
    useEffect(() => { if (isSuper) loadSettings(); }, [loadSettings, isSuper]);

    const settingsDirty = !!settings && !!draft && (
        Number(draft.consultationFee) !== settings.consultationFee
        || Object.keys(draft.requireOtp).some((k) => draft.requireOtp[k] !== settings.requireOtp[k])
        || Object.keys(draft.payrollPolicy || {}).some((k) => Number(draft.payrollPolicy[k]) !== settings.payrollPolicy[k])
        || JSON.stringify(toDraft(settings).geofence) !== JSON.stringify(draft.geofence)
        || JSON.stringify(toDraft(settings).attendancePolicy) !== JSON.stringify(draft.attendancePolicy)
        || JSON.stringify(toDraft(settings).feePolicy) !== JSON.stringify(draft.feePolicy)
        || draft.staffDefaultPassword !== ''
    );
    const [locating, setLocating] = useState(false);
    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setSettingsFeedback({ severity: 'error', text: 'This browser cannot read your location.' });
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false);
                setDraft((d) => ({ ...d, geofence: { ...d.geofence, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) } }));
                setSettingsFeedback({ severity: 'info', text: `Location captured (accuracy ±${Math.round(pos.coords.accuracy)} m). Save settings to apply it.` });
            },
            (err) => {
                setLocating(false);
                setSettingsFeedback({ severity: 'error', text: err.code === 1 ? 'Location permission was denied.' : 'Could not read your location.' });
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    const handleSaveSettings = () => {
        const fee = Number(draft.consultationFee);
        if (draft.consultationFee === '' || !Number.isFinite(fee) || fee < 0) {
            setSettingsFeedback({ severity: 'error', text: 'Consultation fee must be zero or more.' });
            return;
        }
        const g = draft.geofence;
        if (g.enabled && (g.lat === '' || g.lng === '')) {
            setSettingsFeedback({ severity: 'error', text: 'Set the clinic location (latitude and longitude) before turning the geofence on.' });
            return;
        }
        const sp = draft.staffDefaultPassword;
        if (sp && (sp.length < 8 || !/[A-Za-z]/.test(sp) || !/\d/.test(sp))) {
            setSettingsFeedback({ severity: 'error', text: 'Staff first-login password needs at least 8 characters with letters and numbers.' });
            return;
        }
        const geofence = { enabled: g.enabled, radiusMeters: Number(g.radiusMeters) };
        if (g.lat !== '') geofence.lat = Number(g.lat);
        if (g.lng !== '') geofence.lng = Number(g.lng);
        const ap = draft.attendancePolicy;
        const attendancePolicy = {
            lateGraceMinutes: Number(ap.lateGraceMinutes), halfDayMinHours: Number(ap.halfDayMinHours),
            maxAccuracyMeters: Number(ap.maxAccuracyMeters), weekendDays: ap.weekendDays,
            lateArrivalTime: ap.lateArrivalTime, lateRule: ap.lateRule, halfDayAfterTime: ap.halfDayAfterTime,
        };
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(ap.lateArrivalTime || '')) {
            setSettingsFeedback({ severity: 'error', text: 'Enter the late arrival time.' });
            return;
        }
        const fp = draft.feePolicy;
        const feePolicy = {
            dueStartDay: Number(fp.dueStartDay), dueEndDay: Number(fp.dueEndDay), lateFeeEnabled: fp.lateFeeEnabled,
            lateFeeType: fp.lateFeeType, lateFeeAmount: Number(fp.lateFeeAmount), lateFeeMax: Number(fp.lateFeeMax || 0),
        };
        if (!(feePolicy.dueStartDay >= 1 && feePolicy.dueEndDay <= 28 && feePolicy.dueStartDay <= feePolicy.dueEndDay)) {
            setSettingsFeedback({ severity: 'error', text: 'Fee payment days must be between 1 and 28, and the first day on or before the last.' });
            return;
        }
        if (feePolicy.lateFeeEnabled && !(feePolicy.lateFeeAmount > 0)) {
            setSettingsFeedback({ severity: 'error', text: 'Enter a late fee amount above zero, or turn the late fee off.' });
            return;
        }
        setVerify({
            title: 'Save settings',
            description: 'Settings change how records are protected, so they need your admin password and admin key.',
            run: async (secrets) => {
                const { data } = await axios.put(`${process.env.REACT_APP_BASE_URL}/Admin/${currentUser._id}/settings`, {
                    ...secrets, consultationFee: fee, requireOtp: draft.requireOtp,
                    payrollPolicy: Object.fromEntries(Object.entries(draft.payrollPolicy).map(([k, v]) => [k, Number(v)])),
                    geofence, attendancePolicy, feePolicy,
                    ...(sp ? { staffDefaultPassword: sp } : {}),
                });
                setSettings(data.settings);
                setDraft(toDraft(data.settings));
                setSettingsFeedback({ severity: 'success', text: 'Settings saved.' });
            },
        });
    };

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

    const handleSave = () => {
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
        if (password && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) {
            setFeedback({ severity: 'error', text: 'Password must be at least 8 characters, with letters and numbers.' });
            return;
        }
        if (password && password !== confirmPassword) {
            setFeedback({ severity: 'error', text: 'The two passwords do not match.' });
            return;
        }

        setFeedback(null);
        setVerify({
            title: 'Save account changes',
            description: 'Enter your current admin password and admin key. A one-time code will then be emailed to your current address.',
            run: async (secrets) => saveAccount(secrets),
        });
    };

    // Step 1: password + admin key check, then an OTP is emailed to the current address.
    const saveAccount = async ({ password: currentPassword, adminKey }) => {
        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            schoolName: form.schoolName.trim(),
            currentPassword,
            adminKey,
        };
        if (password) payload.password = password;
        const { data } = await axios.post(`${process.env.REACT_APP_BASE_URL}/Admin/${currentUser._id}/account-change`, payload);
        setOtpStep({ challengeId: data.challengeId, sentTo: data.sentTo, code: '', error: '' });
    };

    // Step 2: the emailed OTP applies exactly the change it was issued for.
    const confirmAccountOtp = async () => {
        if (!/^\d{6}$/.test(otpStep.code.trim())) {
            setOtpStep((s) => ({ ...s, error: 'Enter the 6-digit code from the email.' }));
            return;
        }
        setSaving(true);
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/Admin/${currentUser._id}`,
                { challengeId: otpStep.challengeId, otp: otpStep.code.trim() },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (res.data && res.data._id) {
                // Keep the signed-in user in step with what was saved. The response
                // omits the password, so carry the stored one over.
                const merged = { ...currentUser, ...res.data };
                dispatch(authSuccess(merged));
                setPassword('');
                setConfirmPassword('');
                setOtpStep(null);
                setFeedback({ severity: 'success', text: 'Profile updated successfully.' });
            } else {
                setOtpStep((s) => ({ ...s, error: res.data?.message || 'Unable to update profile.' }));
            }
        } catch (err) {
            setOtpStep((s) => ({ ...s, error: err.response?.data?.message || 'Unable to update profile. Please try again.' }));
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
        <PageShell>
            <PageHeader icon={SettingsOutlinedIcon} title="Settings" subtitle="Appearance, account, consultation fee and how changes are verified" />

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
                            <TextField label="Organisation" value={form.schoolName} onChange={handleField('schoolName')} fullWidth required disabled={currentUser?.adminRole === 'admin'} helperText={currentUser?.adminRole === 'admin' ? 'Only the super admin can rename the organisation.' : ' '} />
                            <TextField label="Role" value={currentUser?.role || ''} fullWidth disabled helperText="Role cannot be changed here." />
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <LockOutlinedIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Change password</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Leave blank to keep your current password. At least 8 characters, with letters and numbers.
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

                {!isSuper && (
                    <Grid item xs={12}>
                        <Alert severity="info" icon={<LockOutlinedIcon />}>
                            You are a Limited Admin. System settings (verification, fees and late fee, salary deductions, staff app and attendance rules) are managed only by the super admin.
                        </Alert>
                    </Grid>
                )}
                {isSuper && (<>
                <Grid item xs={12} md={7}>
                    <SectionCard
                        icon={VerifiedUserOutlinedIcon}
                        title="Verification for changes"
                        description="For each action, choose an emailed OTP or the admin password plus admin key."
                    >
                        {!draft ? <CircularProgress size={24} /> : (
                            <Stack divider={<Divider flexItem />} spacing={1.25}>
                                {settings.actions.map((a) => (
                                    <Stack key={a.key} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 600 }}>{a.label}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {draft.requireOtp[a.key] ? 'Emailed OTP required' : 'Admin password + admin key'}
                                            </Typography>
                                        </Box>
                                        <FormControlLabel
                                            labelPlacement="start"
                                            label="OTP"
                                            control={(
                                                <Switch
                                                    checked={!!draft.requireOtp[a.key]}
                                                    onChange={(e) => setDraft((d) => ({ ...d, requireOtp: { ...d.requireOtp, [a.key]: e.target.checked } }))}
                                                    inputProps={{ 'aria-label': `Require OTP to ${a.label.toLowerCase()}` }}
                                                />
                                            )}
                                        />
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </SectionCard>
                </Grid>

                <Grid item xs={12} md={5}>
                    <SectionCard
                        icon={RequestQuoteOutlinedIcon}
                        title="Consultation fee"
                        description="Charged on every new consultation. Past consultations keep the fee they were charged."
                    >
                        {settingsFeedback && (
                            <Alert severity={settingsFeedback.severity} sx={{ mb: 2 }} onClose={() => setSettingsFeedback(null)}>
                                {settingsFeedback.text}
                            </Alert>
                        )}
                        {draft && (
                            <TextField
                                label="Consultation fee"
                                type="number"
                                fullWidth
                                value={draft.consultationFee}
                                onChange={(e) => setDraft((d) => ({ ...d, consultationFee: e.target.value }))}
                                InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment>, inputProps: { min: 0 } }}
                            />
                        )}
                        <Stack direction="row" spacing={1} sx={{ mt: 3 }} justifyContent="flex-end">
                            <Button onClick={() => settings && setDraft(toDraft(settings))} disabled={!settingsDirty}>Reset</Button>
                            <Button variant="contained" onClick={handleSaveSettings} disabled={!settingsDirty || !isSuper}>Save settings</Button>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                            Saves every setting on this page (verification, fee, salary deductions, staff app). Needs your admin password and admin key.
                        </Typography>
                    </SectionCard>
                </Grid>

                <Grid item xs={12}>
                    <SectionCard
                        icon={EventOutlinedIcon}
                        title="Monthly fee and late fee"
                        description="Monthly fees are due between these days of the billed month. Paying after the last allowed day adds the late fee to the slip. Saved with Save settings."
                    >
                        {draft?.feePolicy && (
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6} sm={3}>
                                    <TextField fullWidth type="number" label="Fee payment starts (day)" inputProps={{ min: 1, max: 28 }} value={draft.feePolicy.dueStartDay}
                                        onChange={(e) => setDraft((d) => ({ ...d, feePolicy: { ...d.feePolicy, dueStartDay: e.target.value } }))} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField fullWidth type="number" label="Last allowed day" inputProps={{ min: 1, max: 28 }} value={draft.feePolicy.dueEndDay}
                                        onChange={(e) => setDraft((d) => ({ ...d, feePolicy: { ...d.feePolicy, dueEndDay: e.target.value } }))}
                                        helperText={`e.g. ${draft.feePolicy.dueStartDay || 1}st to ${draft.feePolicy.dueEndDay || 7}th`} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={<Switch checked={draft.feePolicy.lateFeeEnabled} onChange={(e) => setDraft((d) => ({ ...d, feePolicy: { ...d.feePolicy, lateFeeEnabled: e.target.checked } }))} />}
                                        label={draft.feePolicy.lateFeeEnabled ? 'Late fee on' : 'Late fee off'}
                                    />
                                </Grid>
                                {draft.feePolicy.lateFeeEnabled && (
                                    <>
                                        <Grid item xs={12} sm={4}>
                                            <TextField select fullWidth label="Late fee rule" SelectProps={{ native: true }} value={draft.feePolicy.lateFeeType}
                                                onChange={(e) => setDraft((d) => ({ ...d, feePolicy: { ...d.feePolicy, lateFeeType: e.target.value } }))}>
                                                <option value="fixed">Fixed amount once late</option>
                                                <option value="perDay">Amount per day late</option>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth type="number" label={draft.feePolicy.lateFeeType === 'perDay' ? 'Late fee per day' : 'Late fee amount'}
                                                value={draft.feePolicy.lateFeeAmount}
                                                InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment>, inputProps: { min: 0 } }}
                                                onChange={(e) => setDraft((d) => ({ ...d, feePolicy: { ...d.feePolicy, lateFeeAmount: e.target.value } }))} />
                                        </Grid>
                                        {draft.feePolicy.lateFeeType === 'perDay' && (
                                            <Grid item xs={12} sm={4}>
                                                <TextField fullWidth type="number" label="Maximum late fee" helperText="0 = no limit" value={draft.feePolicy.lateFeeMax}
                                                    InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment>, inputProps: { min: 0 } }}
                                                    onChange={(e) => setDraft((d) => ({ ...d, feePolicy: { ...d.feePolicy, lateFeeMax: e.target.value } }))} />
                                            </Grid>
                                        )}
                                    </>
                                )}
                            </Grid>
                        )}
                    </SectionCard>
                </Grid>

                <Grid item xs={12}>
                    <SectionCard
                        icon={PaymentsOutlinedIcon}
                        title="Salary deductions"
                        description="Used by Pay Salary to suggest deductions. One day of pay = basic salary ÷ working days per month. Saved with the button above."
                    >
                        {draft?.payrollPolicy && (
                            <Grid container spacing={2}>
                                {[
                                    ['workingDaysPerMonth', 'Working days per month', 'Divides basic salary into one day of pay.', 1, 31, 1],
                                    ['halfDayFraction', 'Half day counts as', 'Fraction of a day, e.g. 0.5.', 0, 1, 0.25],
                                    ['latesPerDayDeduction', 'Late arrivals per day of pay', 'Every N lates deduct one day.', 1, 31, 1],
                                    ['sandwichDays', 'Days per sandwiched weekend', 'Absent before and after a weekend counts the weekend too.', 0, 7, 1],
                                ].map(([key, label, help, min, max, step]) => (
                                    <Grid item xs={12} sm={6} md={3} key={key}>
                                        <TextField
                                            fullWidth type="number" label={label} helperText={help}
                                            value={draft.payrollPolicy[key]}
                                            inputProps={{ min, max, step }}
                                            onChange={(e) => setDraft((d) => ({ ...d, payrollPolicy: { ...d.payrollPolicy, [key]: e.target.value } }))}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </SectionCard>
                </Grid>

                <Grid item xs={12}>
                    <SectionCard
                        icon={PhoneIphoneOutlinedIcon}
                        title="Staff app and attendance"
                        description="Staff sign in to the TherapyHome app with their email. Attendance is marked from the app inside the clinic's area. Saved with the Save settings button."
                    >
                        {draft?.geofence && (
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth type="password" autoComplete="new-password"
                                        label={settings.staffDefaultPasswordSet ? 'Change staff first-login password' : 'Set staff first-login password'}
                                        value={draft.staffDefaultPassword}
                                        onChange={(e) => setDraft((d) => ({ ...d, staffDefaultPassword: e.target.value }))}
                                        helperText={settings.staffDefaultPasswordSet
                                            ? 'A password is set. Tell it to new staff in person; each must choose their own on first sign-in. Leave blank to keep it.'
                                            : 'Not set: staff cannot sign in to the app yet. At least 8 characters with letters and numbers.'}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={<Switch checked={draft.geofence.enabled} onChange={(e) => setDraft((d) => ({ ...d, geofence: { ...d.geofence, enabled: e.target.checked } }))} />}
                                        label={draft.geofence.enabled ? 'Geofence on: attendance only inside the clinic area' : 'Geofence off: attendance from anywhere'}
                                    />
                                </Grid>
                                {[
                                    ['lat', 'Clinic latitude', 'e.g. 24.860700'],
                                    ['lng', 'Clinic longitude', 'e.g. 67.001100'],
                                    ['radiusMeters', 'Allowed radius (metres)', '20 to 5000'],
                                ].map(([key, label, help]) => (
                                    <Grid item xs={12} sm={4} md={3} key={key}>
                                        <TextField
                                            fullWidth type="number" label={label} helperText={help}
                                            value={draft.geofence[key]}
                                            onChange={(e) => setDraft((d) => ({ ...d, geofence: { ...d.geofence, [key]: e.target.value } }))}
                                        />
                                    </Grid>
                                ))}
                                <Grid item xs={12} md={3}>
                                    <Button fullWidth variant="outlined" sx={{ height: 56 }} startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />} onClick={useMyLocation} disabled={locating}>
                                        Use my current location
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth type="time" label="Late arrival time" InputLabelProps={{ shrink: true }}
                                        value={draft.attendancePolicy.lateArrivalTime}
                                        onChange={(e) => setDraft((d) => ({ ...d, attendancePolicy: { ...d.attendancePolicy, lateArrivalTime: e.target.value } }))}
                                        helperText="Checking in after this time (plus the grace minutes) is late."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select fullWidth label="Late is measured from" SelectProps={{ native: true }}
                                        value={draft.attendancePolicy.lateRule}
                                        onChange={(e) => setDraft((d) => ({ ...d, attendancePolicy: { ...d.attendancePolicy, lateRule: e.target.value } }))}
                                        helperText="Each staff member's scheduled check-in, or one school time for everyone."
                                    >
                                        <option value="staffSchedule">Staff schedule (school time if none)</option>
                                        <option value="schoolTime">School late arrival time for everyone</option>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth type="time" label="Half day after" InputLabelProps={{ shrink: true }}
                                        value={draft.attendancePolicy.halfDayAfterTime}
                                        onChange={(e) => setDraft((d) => ({ ...d, attendancePolicy: { ...d.attendancePolicy, halfDayAfterTime: e.target.value } }))}
                                        helperText="Checking in after this time counts as a half day. Clear it to turn this off."
                                    />
                                </Grid>
                                {[
                                    ['lateGraceMinutes', 'Late after (minutes)', 'Grace minutes after the late arrival / scheduled time before a check-in counts as late.'],
                                    ['halfDayMinHours', 'Half day under (hours)', 'Fewer hours between check-in and check-out count as a half day.'],
                                    ['maxAccuracyMeters', 'Max GPS error (metres)', 'Less accurate locations are refused.'],
                                ].map(([key, label, help]) => (
                                    <Grid item xs={12} sm={4} key={key}>
                                        <TextField
                                            fullWidth type="number" label={label} helperText={help}
                                            value={draft.attendancePolicy[key]}
                                            onChange={(e) => setDraft((d) => ({ ...d, attendancePolicy: { ...d.attendancePolicy, [key]: e.target.value } }))}
                                        />
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Weekend days (not counted as absences; used for sandwich deductions)</Typography>
                                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                                        {WEEK_DAYS.map((day) => {
                                            const on = draft.attendancePolicy.weekendDays.includes(day);
                                            return (
                                                <Button
                                                    key={day} size="small" variant={on ? 'contained' : 'outlined'}
                                                    onClick={() => setDraft((d) => ({
                                                        ...d,
                                                        attendancePolicy: {
                                                            ...d.attendancePolicy,
                                                            weekendDays: on ? d.attendancePolicy.weekendDays.filter((x) => x !== day) : [...d.attendancePolicy.weekendDays, day],
                                                        },
                                                    }))}
                                                >
                                                    {day}
                                                </Button>
                                            );
                                        })}
                                    </Stack>
                                </Grid>
                            </Grid>
                        )}
                        <Stack direction="row" spacing={1} sx={{ mt: 3 }} justifyContent="flex-end">
                            <Button variant="contained" onClick={handleSaveSettings} disabled={!settingsDirty || !isSuper}>Save settings</Button>
                        </Stack>
                    </SectionCard>
                </Grid>
                </>)}
            </Grid>

            <Dialog open={!!otpStep} onClose={() => !saving && setOtpStep(null)} fullWidth maxWidth="xs">
                <DialogTitle>Enter the OTP</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        A 6-digit code was sent to {otpStep?.sentTo || 'your email'}. It expires in 10 minutes and works once.
                    </Typography>
                    <TextField
                        autoFocus fullWidth label="OTP"
                        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                        value={otpStep?.code || ''}
                        onChange={(e) => setOtpStep((s) => ({ ...s, code: e.target.value.replace(/\D/g, ''), error: '' }))}
                        onKeyDown={(e) => e.key === 'Enter' && confirmAccountOtp()}
                        error={!!otpStep?.error} helperText={otpStep?.error || ' '}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOtpStep(null)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={confirmAccountOtp} disabled={saving}>
                        {saving ? <CircularProgress size={20} color="inherit" /> : 'Verify & Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <VerifyAdminDialog
                open={!!verify}
                title={verify?.title}
                description={verify?.description}
                confirmLabel="Save"
                onClose={() => setVerify(null)}
                onConfirm={async (secrets) => { await verify.run(secrets); setVerify(null); }}
            />
        </PageShell>
    );
};

export default AdminSettings;
