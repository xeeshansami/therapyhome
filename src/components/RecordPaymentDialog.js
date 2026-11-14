import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    InputAdornment, Stack, TextField, Typography,
} from '@mui/material';

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());
const money = (n) => `Rs. ${(Number(n) || 0).toLocaleString()}`;

/**
 * Records a later payment against a slip's outstanding balance (same month,
 * days later, or months later). The slip's original amount never changes and
 * the server refuses anything above what is still owed.
 * slip: a fee slip row ({ _id, invoiceID, name, netTotalFee, paidFee, payments })
 */
const RecordPaymentDialog = ({ open, slip, onClose, onSaved }) => {
    const outstanding = slip ? Math.max(0, (Number(slip.netTotalFee) || 0) - (Number(slip.paidFee) || 0)) : 0;
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(today());
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setAmount(outstanding ? String(outstanding) : '');
            setDate(today());
            setNote('');
            setError('');
        }
    }, [open, outstanding]);

    const n = Number(amount);
    const invalid = !(n > 0) || n > outstanding || !date;

    const save = async () => {
        if (invalid || busy) return;
        setBusy(true);
        setError('');
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_BASE_URL}/fees/${slip._id}/payments`, { amount: n, date, note });
            onSaved(data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not record the payment.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !busy && onClose()} fullWidth maxWidth="xs">
            <DialogTitle>Record payment</DialogTitle>
            <DialogContent>
                {slip && (
                    <DialogContentText sx={{ mb: 2 }}>
                        {slip.invoiceID} · {slip.name}<br />
                        Original amount {money(slip.netTotalFee)}, paid so far {money(slip.paidFee)}, <strong>outstanding {money(outstanding)}</strong>.
                    </DialogContentText>
                )}
                {slip?.payments?.length > 0 && (
                    <Stack sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">Earlier payments on this slip</Typography>
                        {slip.payments.map((p, i) => <Typography key={i} variant="body2">{p.date}: {money(p.amount)}{p.note ? ` · ${p.note}` : ''}</Typography>)}
                    </Stack>
                )}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={2}>
                    <TextField
                        autoFocus fullWidth type="number" label="Amount received"
                        InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment>, inputProps: { min: 1, max: outstanding } }}
                        value={amount} onChange={(e) => setAmount(e.target.value)}
                        error={amount !== '' && (n > outstanding || !(n > 0))}
                        helperText={n > outstanding ? `Only ${money(outstanding)} is outstanding.` : n > 0 && n < outstanding ? `${money(outstanding - n)} will still be outstanding.` : ' '}
                    />
                    <TextField fullWidth type="date" label="Payment date" InputLabelProps={{ shrink: true }} inputProps={{ max: today(), min: slip?.date }}
                        value={date} onChange={(e) => setDate(e.target.value)} />
                    <TextField fullWidth label="Note (optional)" inputProps={{ maxLength: 300 }} value={note} onChange={(e) => setNote(e.target.value)} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>Cancel</Button>
                <Button variant="contained" onClick={save} disabled={invalid || busy}>
                    {busy ? <CircularProgress size={20} color="inherit" /> : 'Save payment'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecordPaymentDialog;
