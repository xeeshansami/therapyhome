import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import { authLogout, authSuccess } from '../../redux/userRelated/userSlice';

/** Shown to an admin added by the super admin until they replace their temporary password. */
const ChangeTemporaryPassword = () => {
    const { currentUser } = useSelector((s) => s.user);
    const dispatch = useDispatch();
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const problem = next && (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) ? 'At least 8 characters, with letters and numbers.' : '';

    const submit = async (e) => {
        e.preventDefault();
        if (problem || next !== confirm || !current) return;
        setBusy(true);
        setError('');
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_BASE_URL}/Admin/change-temporary-password`, { currentPassword: current, newPassword: next });
            dispatch(authSuccess(data));
        } catch (err) {
            setError(err.response?.data?.message || 'Could not change the password.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
            <Paper component="form" onSubmit={submit} variant="outlined" sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 440, borderRadius: 3 }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <LockResetOutlinedIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Choose your password</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Welcome, {currentUser?.name}. You signed in with a temporary password. Choose your own to continue.
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField label="Temporary password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
                    <TextField label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={!!problem} helperText={problem || 'At least 8 characters, with letters and numbers.'} required />
                    <TextField label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={!!confirm && confirm !== next} helperText={confirm && confirm !== next ? 'Passwords do not match.' : ' '} required />
                    <Button type="submit" variant="contained" size="large" disabled={busy || !!problem || !next || next !== confirm || !current}>
                        {busy ? <CircularProgress size={22} color="inherit" /> : 'Save and continue'}
                    </Button>
                    <Button onClick={() => dispatch(authLogout())}>Sign out</Button>
                </Stack>
            </Paper>
        </Box>
    );
};

export default ChangeTemporaryPassword;
