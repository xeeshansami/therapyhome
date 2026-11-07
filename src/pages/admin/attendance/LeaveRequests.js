import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import DataTable, { RowButton } from '../../../components/DataTable';
import PageHeader, { PageShell } from '../../../components/PageHeader';

const API = process.env.REACT_APP_BASE_URL;
const TABS = ['pending', 'approved', 'rejected', 'cancelled', 'all'];
const STATUS_COLOR = { pending: 'warning', approved: 'success', rejected: 'error', cancelled: 'default' };

const niceDate = (ymd) => new Date(`${ymd}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Leave requested by staff from the app. Approving marks the working days as leave in Staff Attendance. */
const LeaveRequests = () => {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [deciding, setDeciding] = useState(null); // { row, status, note, busy, error }

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/leaves`, { params: { status: TABS[tab] } });
            setRows(data.map((r) => ({ ...r, staffName: r.teacher && r.teacher.name })));
        } catch (e) {
            setMessage({ severity: 'error', text: e.response?.data?.message || 'Could not load leave requests.' });
        } finally {
            setLoading(false);
        }
    }, [tab]);
    useEffect(() => { load(); }, [load]);

    const decide = async () => {
        const { row, status, note } = deciding;
        if (status === 'rejected' && note.trim().length < 3) {
            setDeciding((d) => ({ ...d, error: 'Give a short reason for rejecting.' }));
            return;
        }
        setDeciding((d) => ({ ...d, busy: true, error: '' }));
        try {
            const { data } = await axios.put(`${API}/leaves/${row._id}`, { status, adminNote: note.trim() });
            setMessage({ severity: 'success', text: `${row.staffName}: ${data.message} An email was sent to them.` });
            setDeciding(null);
            load();
        } catch (e) {
            setDeciding((d) => ({ ...d, busy: false, error: e.response?.data?.message || 'Could not save.' }));
        }
    };

    return (
        <PageShell>
            <PageHeader icon={EventBusyOutlinedIcon} title="Leave Requests" subtitle="Requested by staff from the app. Approving marks the working days as leave in Staff Attendance; unpaid leave is deducted in Pay Salary." />
            {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
                {TABS.map((t) => <Tab key={t} label={t[0].toUpperCase() + t.slice(1)} />)}
            </Tabs>
            <DataTable
                loading={loading}
                rows={rows}
                searchKeys={['staffName', 'typeLabel', 'reason']}
                searchPlaceholder="Search staff, type or reason"
                emptyText={TABS[tab] === 'pending' ? 'No requests waiting for a decision.' : 'No requests.'}
                columns={[
                    { id: 'staffName', label: 'Staff', render: (r) => (
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar src={r.teacher?.photo || undefined} sx={{ width: 32, height: 32 }}>{(r.staffName || '?')[0]}</Avatar>
                            <Typography sx={{ fontWeight: 600 }}>{r.staffName}</Typography>
                        </Stack>
                    ) },
                    { id: 'typeLabel', label: 'Type', render: (r) => <Chip size="small" variant="outlined" color={r.type === 'unpaid' ? 'warning' : 'primary'} label={r.typeLabel} /> },
                    { id: 'dates', label: 'Dates', minWidth: 210, render: (r) => (r.from === r.to ? niceDate(r.from) : `${niceDate(r.from)} – ${niceDate(r.to)}`) },
                    { id: 'days', label: 'Working days', align: 'center' },
                    { id: 'reason', label: 'Reason', minWidth: 200 },
                    { id: 'status', label: 'Status', highlight: true, render: (r) => (
                        <Stack spacing={0.5}>
                            <Chip size="small" color={STATUS_COLOR[r.status]} label={r.status} sx={{ textTransform: 'capitalize', alignSelf: 'flex-start' }} />
                            {r.decidedByName && <Typography variant="caption" color="text.secondary">by {r.decidedByName}{r.adminNote ? `: ${r.adminNote}` : ''}</Typography>}
                        </Stack>
                    ) },
                ]}
                actions={(r) => (r.status === 'pending' ? (
                    <>
                        <RowButton color="primary" onClick={() => setDeciding({ row: r, status: 'approved', note: '', busy: false, error: '' })}>Approve</RowButton>
                        <RowButton color="error" onClick={() => setDeciding({ row: r, status: 'rejected', note: '', busy: false, error: '' })}>Reject</RowButton>
                    </>
                ) : null)}
            />
            <Dialog open={!!deciding} onClose={() => !deciding?.busy && setDeciding(null)} fullWidth maxWidth="xs">
                <DialogTitle>{deciding && `${deciding.status === 'approved' ? 'Approve' : 'Reject'} leave for ${deciding.row.staffName}`}</DialogTitle>
                <DialogContent>
                    {deciding && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Typography variant="body2">
                                {deciding.row.typeLabel} leave, {deciding.row.from === deciding.row.to ? niceDate(deciding.row.from) : `${niceDate(deciding.row.from)} to ${niceDate(deciding.row.to)}`} ({deciding.row.days} working day{deciding.row.days === 1 ? '' : 's'}).
                                {deciding.status === 'approved' && ' These days will show as leave in Staff Attendance.'}
                            </Typography>
                            <TextField
                                label={deciding.status === 'rejected' ? 'Reason for rejecting' : 'Note (optional)'}
                                value={deciding.note}
                                onChange={(e) => setDeciding((d) => ({ ...d, note: e.target.value, error: '' }))}
                                inputProps={{ maxLength: 300 }}
                                multiline rows={2}
                                error={!!deciding.error}
                                helperText={deciding.error || 'Sent to the staff member by email.'}
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeciding(null)} disabled={deciding?.busy}>Cancel</Button>
                    <Button variant="contained" color={deciding?.status === 'rejected' ? 'error' : 'primary'} onClick={decide} disabled={deciding?.busy}>
                        {deciding?.status === 'rejected' ? 'Reject' : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageShell>
    );
};

export default LeaveRequests;
