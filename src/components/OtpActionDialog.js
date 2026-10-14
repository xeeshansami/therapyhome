import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, TextField, Typography,
} from '@mui/material';

// Two-step verification for sensitive changes:
//   1. the admin re-enters their password; the server validates the change and
//      emails an OTP bound to exactly that change and record,
//   2. the admin enters the OTP; the server applies the change it stored.
// The OTP is generated, stored and checked only on the server.

const errorText = (error, fallback) => error?.response?.data?.message || (error?.request && !error?.response
    ? 'Could not reach the server. Check your connection and try again.'
    : fallback);

const OtpActionDialog = ({
    open, onClose, onSuccess,
    adminId, actionType, targetType, targetId, targetName, payload,
}) => {
    const isDelete = actionType === 'delete';
    const [step, setStep] = useState('confirm'); // confirm -> password -> otp
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [challenge, setChallenge] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setStep(isDelete ? 'confirm' : 'password');
            setPassword('');
            setOtp('');
            setChallenge(null);
            setError('');
        } else {
            setPassword(''); // never keep the password around after closing
        }
    }, [open, isDelete]);

    const action = { type: actionType, targetType, targetId };

    const requestOtp = async () => {
        if (busy) return;
        if (!password) {
            setError('Please enter your password.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_BASE_URL}/verify-password-send-otp`, {
                adminId,
                password,
                actiontype: targetType,
                action: { ...action, payload: isDelete ? null : payload },
            });
            setChallenge(data);
            setOtp('');
            setStep('otp');
        } catch (err) {
            setError(errorText(err, 'Password verification failed.'));
        } finally {
            setBusy(false);
        }
    };

    const confirmOtp = async () => {
        if (busy) return;
        if (!/^\d{6}$/.test(otp.trim())) {
            setError('Enter the 6-digit code from the email.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_BASE_URL}/verify-otp-execute-action`, {
                adminId,
                otp: otp.trim(),
                challengeId: challenge?.challengeId,
                actiontype: targetType,
                action,
            });
            onSuccess(data);
        } catch (err) {
            const code = err?.response?.data?.code;
            // These codes mean this OTP can no longer be used; offer a fresh one.
            if (['OTP_EXPIRED', 'OTP_ALREADY_USED', 'OTP_LOCKED', 'OTP_NOT_FOUND'].includes(code)) {
                setChallenge((c) => ({ ...c, dead: true }));
            }
            setError(errorText(err, 'OTP verification failed.'));
        } finally {
            setBusy(false);
        }
    };

    const handleClose = () => {
        if (!busy) onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>{isDelete ? 'Delete record' : 'Confirm update'}</DialogTitle>
            <DialogContent>
                {step === 'confirm' && (
                    <DialogContentText>
                        Delete <strong>{targetName || 'this record'}</strong>? This cannot be undone from the portal.
                        {targetType === 'student' && ' Fee slips and payment history for this student are kept.'}
                    </DialogContentText>
                )}
                {step === 'password' && (
                    <>
                        <DialogContentText sx={{ mb: 1 }}>
                            Enter your admin password. A one-time code will be emailed to you.
                        </DialogContentText>
                        <TextField
                            autoFocus margin="dense" label="Password" type="password" fullWidth
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            error={!!error} helperText={error}
                            onKeyDown={(e) => e.key === 'Enter' && requestOtp()}
                        />
                    </>
                )}
                {step === 'otp' && (
                    <>
                        <DialogContentText sx={{ color: 'success.main', mb: 1 }}>
                            {challenge?.message || 'OTP sent.'}
                        </DialogContentText>
                        <DialogContentText sx={{ mb: 1 }}>
                            Enter the 6-digit code. It expires
                            {challenge?.expiresAt ? ` at ${new Date(challenge.expiresAt).toLocaleTimeString()}` : ' in 10 minutes'} and works once.
                        </DialogContentText>
                        <TextField
                            autoFocus margin="dense" label="OTP" fullWidth
                            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                            value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            error={!!error} helperText={error}
                            disabled={challenge?.dead}
                            onKeyDown={(e) => e.key === 'Enter' && confirmOtp()}
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Didn't get it?{' '}
                            <Button size="small" onClick={requestOtp} disabled={busy}>Resend code</Button>
                        </Typography>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" disabled={busy}>Cancel</Button>
                {step === 'confirm' && (
                    <Button color="error" variant="contained" onClick={() => setStep('password')}>Continue</Button>
                )}
                {step === 'password' && (
                    <Button onClick={requestOtp} variant="contained" disabled={busy}>
                        {busy ? <CircularProgress size={22} color="inherit" /> : 'Verify & Send OTP'}
                    </Button>
                )}
                {step === 'otp' && (
                    <Button onClick={confirmOtp} variant="contained" color={isDelete ? 'error' : 'primary'} disabled={busy || challenge?.dead}>
                        {busy ? <CircularProgress size={22} color="inherit" /> : (isDelete ? 'Verify & Delete' : 'Verify & Update')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OtpActionDialog;
