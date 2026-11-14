import React, { useEffect, useState } from 'react';
import {
    Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Stack, TextField,
} from '@mui/material';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { clearGrant, currentGrant } from '../utils/verification';

/**
 * Asks for the admin password and admin key, then calls `onConfirm(secrets)`.
 * When the admin already verified in this tab within the last few minutes,
 * a short-lived grant is offered instead so they are not asked for the admin
 * key again in the same workflow; `secrets` is then { verificationToken }.
 * Callers pass `...secrets` straight into the request body.
 * If onConfirm throws, the error is shown and the dialog stays open.
 * Neither secret is kept after the dialog closes.
 */
const VerifyAdminDialog = ({ open, title = 'Confirm it’s you', description, confirmLabel = 'Confirm', onConfirm, onClose }) => {
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [grant, setGrant] = useState(null);

    useEffect(() => {
        if (open) {
            setGrant(currentGrant());
        } else {
            setPassword('');
            setAdminKey('');
            setError('');
        }
    }, [open]);

    const run = async (secrets) => {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            await onConfirm(secrets);
        } catch (err) {
            const code = err?.response?.data?.code;
            if (secrets.verificationToken && err?.response?.status === 401) {
                // Grant expired or revoked: fall back to password + admin key.
                clearGrant();
                setGrant(null);
                setError(code === 'GRANT_EXPIRED' ? 'Your verification expired. Enter your password and admin key.' : (err?.response?.data?.message || 'Please verify again.'));
            } else {
                setError(err?.response?.data?.message || err?.message || 'Verification failed.');
            }
        } finally {
            setBusy(false);
        }
    };

    const submit = () => {
        if (grant) return run({ verificationToken: grant.token });
        if (!password || !adminKey) {
            setError('Enter both your password and your admin key.');
            return undefined;
        }
        return run({ password, adminKey });
    };

    const minutesLeft = grant ? Math.max(1, Math.round((grant.expiresAt - Date.now()) / 60000)) : 0;

    return (
        <Dialog open={open} onClose={() => !busy && onClose()} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><KeyOutlinedIcon color="primary" />{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    {description || 'Enter your admin password and admin key to continue.'}
                </DialogContentText>
                {grant ? (
                    <Alert icon={<VerifiedUserOutlinedIcon fontSize="inherit" />} severity="success" sx={{ mb: 1 }}>
                        You verified with your admin key in this session. It stays valid for about {minutesLeft} more minute{minutesLeft === 1 ? '' : 's'}.
                        {' '}
                        <Link component="button" type="button" onClick={() => { clearGrant(); setGrant(null); }}>Use password instead</Link>
                        {error && <><br />{error}</>}
                    </Alert>
                ) : (
                    <Stack spacing={2}>
                        <TextField
                            autoFocus label="Admin password" type="password" fullWidth autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submit()}
                        />
                        <TextField
                            label="Admin key" type="password" fullWidth autoComplete="off"
                            value={adminKey} onChange={(e) => setAdminKey(e.target.value)}
                            error={!!error} helperText={error || 'The secret key set when this admin account was registered.'}
                            onKeyDown={(e) => e.key === 'Enter' && submit()}
                        />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>Cancel</Button>
                <Button variant="contained" onClick={submit} disabled={busy}>
                    {busy ? <CircularProgress size={20} color="inherit" /> : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VerifyAdminDialog;
