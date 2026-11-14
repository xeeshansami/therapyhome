import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Divider, InputAdornment, Paper, Stack, Step, StepLabel, Stepper, TextField, Typography,
} from '@mui/material';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import VerifyAdminDialog from './VerifyAdminDialog';

const API = process.env.REACT_APP_BASE_URL;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());
const money = (n) => `Rs. ${(Number(n) || 0).toLocaleString()}`;

const DEPOSIT_STEPS = ['Received', 'Student withdrawn', 'Return initiated', 'Returned'];
const STATUS_LABEL = { none: 'No deposit', pending: 'Pending', received: 'Received', return_initiated: 'Return initiated', returned: 'Returned' };
const STATUS_COLOR = { none: 'default', pending: 'warning', received: 'success', return_initiated: 'info', returned: 'secondary' };

/**
 * Student status (Active / Withdrawn) with withdraw / reactivate, and the
 * security deposit return journey: received -> withdrawn -> return initiated -> returned.
 * Every step is enforced by the API; this only guides the admin through it.
 */
const StudentLifecyclePanel = ({ student, onChanged, onMessage, canEditStatus = true, canViewDeposit = true, canEditDeposit = true }) => {
    const [deposit, setDeposit] = useState(null);
    const [dialog, setDialog] = useState(null); // { kind: 'withdraw'|'reactivate'|'initiate'|'complete'|'cancel', ... }
    const [verify, setVerify] = useState(null);
    const [busy, setBusy] = useState(false);
    const withdrawn = student.status === 'withdrawn';

    // null = loading; a failed load ends in a message instead of a spinner that never stops.
    const [depositError, setDepositError] = useState('');
    const loadDeposit = useCallback(() => {
        setDeposit(null);
        setDepositError('');
        axios.get(`${API}/Student/${student._id}/security-deposit`)
            .then(({ data }) => {
                if (data && data.deposit) setDeposit(data.deposit);
                else setDepositError('Security deposit details are not available from the server yet.');
            })
            .catch((err) => {
                const status = err?.response?.status;
                setDepositError(status === 404
                    ? 'Security deposit tracking needs the updated TherapyHome server. Ask your administrator to deploy the latest backend.'
                    : (err?.response?.data?.message || 'Could not load the security deposit.'));
            });
    }, [student._id]);
    useEffect(() => { if (canViewDeposit) loadDeposit(); }, [loadDeposit, student.status, canViewDeposit]);

    const fail = (err, fallback) => onMessage(err?.response?.data?.message || fallback, false);

    const runStatus = async () => {
        setBusy(true);
        try {
            const kind = dialog.kind;
            const { data } = await axios.post(`${API}/Student/${student._id}/${kind}`, kind === 'withdraw' ? { reason: dialog.reason, date: dialog.date } : {});
            setDialog(null);
            onMessage(data.message, true);
            onChanged();
        } catch (err) {
            if (err?.response?.status === 404 && !err?.response?.data?.message) fail(err, 'Withdrawal needs the updated TherapyHome server.');
            else fail(err, 'Could not update the student status.');
        } finally {
            setBusy(false);
        }
    };

    // Deposit steps need the admin key (or this session's verification).
    const runDeposit = () => {
        const { kind, amount, date, note } = dialog;
        setVerify({
            title: kind === 'initiate' ? 'Start security deposit return' : kind === 'complete' ? 'Confirm deposit returned' : 'Cancel deposit return',
            run: async (secrets) => {
                const { data } = await axios.post(`${API}/Student/${student._id}/security-deposit`, {
                    ...secrets, action: kind, note,
                    ...(amount !== '' && amount !== undefined ? { amount: Number(amount) } : {}),
                    ...(kind === 'complete' ? { date } : {}),
                });
                setDeposit(data.deposit);
                setDialog(null);
                onMessage(data.message, true);
            },
        });
    };

    const activeStep = !deposit || deposit.status === 'none' ? -1
        : deposit.status === 'pending' ? 0
            : deposit.status === 'returned' ? 4
                : deposit.status === 'return_initiated' ? 3
                    : withdrawn ? 2 : 1;

    return (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Status</Typography>
                    <Chip size="small" label={withdrawn ? 'Withdrawn' : 'Active'} color={withdrawn ? 'warning' : 'success'} />
                    {withdrawn && student.withdrawnAt && (
                        <Typography variant="body2" color="text.secondary">
                            since {new Date(student.withdrawnAt).toLocaleDateString()}{student.withdrawalReason ? ` — ${student.withdrawalReason}` : ''}
                        </Typography>
                    )}
                </Stack>
                {canEditStatus && (withdrawn
                    ? <Button variant="outlined" color="success" onClick={() => setDialog({ kind: 'reactivate' })}>Reactivate student</Button>
                    : <Button variant="outlined" color="warning" onClick={() => setDialog({ kind: 'withdraw', reason: '', date: today() })}>Withdraw student</Button>)}
            </Stack>
            {withdrawn && (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                    Withdrawn students are hidden from active lists, the staff app and dashboard totals. Sessions, fee slips and invoices are kept.
                </Alert>
            )}

            {canViewDeposit && (<>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <SavingsOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Security deposit</Typography>
                {deposit && <Chip size="small" label={STATUS_LABEL[deposit.status] || deposit.status} color={STATUS_COLOR[deposit.status] || 'default'} variant="outlined" />}
            </Stack>
            {depositError ? (
                <Alert severity="warning" action={<Button color="inherit" size="small" onClick={loadDeposit}>Retry</Button>}>{depositError}</Alert>
            ) : !deposit ? <CircularProgress size={20} /> : deposit.status === 'none' ? (
                <Typography variant="body2" color="text.secondary">No security deposit was billed for this student.</Typography>
            ) : (
                <>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                        Deposit {money(deposit.amount)}{deposit.admissionInvoice ? ` on admission slip ${deposit.admissionInvoice}` : ''}{deposit.receivedOn ? `, received ${deposit.receivedOn}` : ''}.
                        {deposit.returnAmount !== null && ` Return amount ${money(deposit.returnAmount)}.`}
                        {deposit.returnedOn && ` Returned on ${deposit.returnedOn}.`}
                    </Typography>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2, display: { xs: 'none', sm: 'flex' } }}>
                        {DEPOSIT_STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ display: canEditDeposit ? 'flex' : 'none' }}>
                        {deposit.status === 'received' && (
                            <Button variant="contained" disabled={!withdrawn} onClick={() => setDialog({ kind: 'initiate', amount: String(deposit.amount), note: '' })}>
                                Initiate return
                            </Button>
                        )}
                        {deposit.status === 'received' && !withdrawn && (
                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>Withdraw the student to start the return.</Typography>
                        )}
                        {deposit.status === 'pending' && (
                            <Typography variant="caption" color="text.secondary">The admission slip is not fully paid yet, so the deposit has not been received.</Typography>
                        )}
                        {deposit.status === 'return_initiated' && (
                            <>
                                <Button variant="contained" color="success" onClick={() => setDialog({ kind: 'complete', amount: String(deposit.returnAmount ?? deposit.amount), date: today(), note: '' })}>Mark as returned</Button>
                                <Button color="inherit" onClick={() => setDialog({ kind: 'cancel', note: '' })}>Cancel return</Button>
                            </>
                        )}
                    </Stack>
                    {deposit.history?.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">History</Typography>
                            {deposit.history.map((h, i) => (
                                <Typography key={i} variant="body2">
                                    {new Date(h.at).toLocaleString()} — {h.action === 'initiated' ? 'Return initiated' : h.action === 'returned' ? 'Returned' : 'Return cancelled'}
                                    {h.amount !== undefined && h.amount !== null ? ` (${money(h.amount)})` : ''}{h.on ? ` on ${h.on}` : ''}{h.note ? ` · ${h.note}` : ''}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </>
            )}

            </>)}

            <Dialog open={!!dialog} onClose={() => !busy && setDialog(null)} fullWidth maxWidth="xs">
                <DialogTitle>
                    {{ withdraw: `Withdraw ${student.name}?`, reactivate: `Reactivate ${student.name}?`, initiate: 'Return security deposit', complete: 'Deposit handed back', cancel: 'Cancel the return?' }[dialog?.kind]}
                </DialogTitle>
                <DialogContent>
                    {dialog?.kind === 'withdraw' && (
                        <>
                            <DialogContentText sx={{ mb: 2 }}>History is kept and the student can be reactivated later. After withdrawing you can return the security deposit.</DialogContentText>
                            <TextField fullWidth type="date" label="Withdrawal date" InputLabelProps={{ shrink: true }} sx={{ mb: 2 }}
                                value={dialog.date} onChange={(e) => setDialog((d) => ({ ...d, date: e.target.value }))} />
                            <TextField fullWidth label="Reason (optional)" inputProps={{ maxLength: 300 }}
                                value={dialog.reason} onChange={(e) => setDialog((d) => ({ ...d, reason: e.target.value }))} />
                        </>
                    )}
                    {dialog?.kind === 'reactivate' && <DialogContentText>The student becomes active again and appears in lists and the staff app.</DialogContentText>}
                    {['initiate', 'complete'].includes(dialog?.kind) && (
                        <>
                            <DialogContentText sx={{ mb: 2 }}>
                                {dialog.kind === 'initiate'
                                    ? `Deposit held: ${money(deposit?.amount)}. Enter the amount to return (less any deductions) and a note.`
                                    : 'Record the date the money was handed back. The original deposit stays on the admission slip.'}
                            </DialogContentText>
                            <TextField fullWidth type="number" label="Return amount" sx={{ mb: 2 }}
                                InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment>, inputProps: { min: 0, max: deposit?.amount } }}
                                value={dialog.amount} onChange={(e) => setDialog((d) => ({ ...d, amount: e.target.value }))}
                                error={Number(dialog.amount) > Number(deposit?.amount)} helperText={Number(dialog.amount) > Number(deposit?.amount) ? 'More than the deposit.' : ' '} />
                            {dialog.kind === 'complete' && (
                                <TextField fullWidth type="date" label="Return date" InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} inputProps={{ max: today() }}
                                    value={dialog.date} onChange={(e) => setDialog((d) => ({ ...d, date: e.target.value }))} />
                            )}
                        </>
                    )}
                    {['initiate', 'complete', 'cancel'].includes(dialog?.kind) && (
                        <TextField fullWidth label="Note (optional)" inputProps={{ maxLength: 300 }} value={dialog.note}
                            onChange={(e) => setDialog((d) => ({ ...d, note: e.target.value }))} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(null)} disabled={busy}>Back</Button>
                    <Button
                        variant="contained" disabled={busy || (['initiate', 'complete'].includes(dialog?.kind) && Number(dialog?.amount) > Number(deposit?.amount))}
                        color={dialog?.kind === 'withdraw' ? 'warning' : 'primary'}
                        onClick={['withdraw', 'reactivate'].includes(dialog?.kind) ? runStatus : runDeposit}
                    >
                        {busy ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <VerifyAdminDialog
                open={!!verify}
                title={verify?.title}
                description="Returning a security deposit changes financial records, so it needs your admin password and admin key."
                onClose={() => setVerify(null)}
                onConfirm={async (secrets) => { await verify.run(secrets); setVerify(null); }}
            />
        </Paper>
    );
};

export default StudentLifecyclePanel;
