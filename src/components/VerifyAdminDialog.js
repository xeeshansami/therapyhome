import React, { useEffect, useState } from 'react';
import {
    Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField,
} from '@mui/material';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';

/**
 * Asks for the admin password and admin key, then calls `onConfirm`. If it
 * throws, the error message is shown and the dialog stays open.
 * Neither secret is kept after the dialog closes.
 */
const VerifyAdminDialog = ({ open, title = 'Confirm it’s you', description, confirmLabel = 'Confirm', onConfirm, onClose }) => {
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) {
            setPassword('');
            setAdminKey('');
            setError('');
        }
    }, [open]);

    const submit = async () => {
        if (busy) return;
        if (!password || !adminKey) {
            setError('Enter both your password and your admin key.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            await onConfirm({ password, adminKey });
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Verification failed.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !busy && onClose()} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><KeyOutlinedIcon color="primary" />{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    {description || 'Enter your admin password and admin key to continue.'}
                </DialogContentText>
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
