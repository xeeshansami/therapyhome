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

const AdminSettings = () => {
    const { mode, primary, setMode, setPrimary } = useColorMode();
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

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
            setDraft({ consultationFee: String(data.consultationFee), requireOtp: { ...data.requireOtp }, payrollPolicy: { ...data.payrollPolicy } });
        } catch (err) {
            setSettingsFeedback({ severity: 'error', text: 'Could not load settings.' });
        }
    }, [currentUser._id]);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const settingsDirty = !!settings && !!draft && (
        Number(draft.consultationFee) !== settings.consultationFee
        || Object.keys(draft.requireOtp).some((k) => draft.requireOtp[k] !== settings.requireOtp[k])
        || Object.keys(draft.payrollPolicy || {}).some((k) => Number(draft.payrollPolicy[k]) !== settings.payrollPolicy[k])
    );

    const handleSaveSettings = () => {
        const fee = Number(draft.consultationFee);
        if (draft.consultationFee === '' || !Number.isFinite(fee) || fee < 0) {
            setSettingsFeedback({ severity: 'error', text: 'Consultation fee must be zero or more.' });
            return;
        }
        setVerify({
            title: 'Save settings',
            description: 'Settings change how records are protected, so they need your admin password and admin key.',
            run: async ({ password, adminKey }) => {
                const { data } = await axios.put(`${process.env.REACT_APP_BASE_URL}/Admin/${currentUser._id}/settings`, {
                    password, adminKey, consultationFee: fee, requireOtp: draft.requireOtp,
                    payrollPolicy: Object.fromEntries(Object.entries(draft.payrollPolicy).map(([k, v]) => [k, Number(v)])),
                });
                setSettings(data.settings);
                setDraft({ consultationFee: String(data.settings.consultationFee), requireOtp: { ...data.settings.requireOtp }, payrollPolicy: { ...data.settings.payrollPolicy } });
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
        if (password && password.length < 6) {
            setFeedback({ severity: 'error', text: 'Password must be at least 6 characters.' });
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
                            <Button onClick={() => settings && setDraft({ consultationFee: String(settings.consultationFee), requireOtp: { ...settings.requireOtp }, payrollPolicy: { ...settings.payrollPolicy } })} disabled={!settingsDirty}>Reset</Button>
                            <Button variant="contained" onClick={handleSaveSettings} disabled={!settingsDirty}>Save settings</Button>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                            Saves the verification choices, the fee and the salary deduction policy. Needs your admin password and admin key.
                        </Typography>
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
