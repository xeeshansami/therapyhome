import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem,
    Stack, Switch, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import DataTable, { RowButton } from '../../../components/DataTable';
import PageHeader, { PageShell } from '../../../components/PageHeader';
import { formatTime } from '../../../utils/staffForm';

const API = process.env.REACT_APP_BASE_URL;

/** Today in Pakistan time (the clinic's day), as YYYY-MM-DD. */
export const clinicToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());

const time = (point) => (point && point.at
    ? new Date(point.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Karachi' })
    : '—');

export const statusChip = (record) => {
    if (!record) return <Chip size="small" label="Not marked" variant="outlined" />;
    if (record.status === 'absent') return <Chip size="small" color="error" label="Absent" />;
    if (record.status === 'leave') return <Chip size="small" color={record.leaveType === 'unpaid' ? 'warning' : 'info'} label={record.leaveType ? `Leave (${record.leaveType})` : 'Leave'} />;
    return (
        <Stack direction="row" spacing={0.5}>
            <Chip size="small" color="success" label="Present" />
            {record.late && <Chip size="small" color="warning" label="Late" />}
            {record.halfDay && <Chip size="small" color="warning" variant="outlined" label="Half day" />}
        </Stack>
    );
};

const DayView = () => {
    const [date, setDate] = useState(clinicToday());
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/attendance/staff`, { params: { date } });
            setRows(data.rows.map((r) => ({ ...r, _id: r.teacher._id, name: r.teacher.name })));
        } catch (e) {
            setMessage({ severity: 'error', text: e.response?.data?.message || 'Could not load attendance.' });
        } finally {
            setLoading(false);
        }
    }, [date]);
    useEffect(() => { load(); }, [load]);

    const closeDay = async () => {
        if (!window.confirm(`Mark everyone without attendance on ${date} as absent?`)) return;
        try {
            const { data } = await axios.post(`${API}/attendance/staff/close-day`, { date });
            setMessage({ severity: 'success', text: data.message });
            load();
        } catch (e) {
            setMessage({ severity: 'error', text: e.response?.data?.message || 'Could not close the day.' });
        }
    };

    const save = async () => {
        try {
            await axios.put(`${API}/attendance/staff/${editing.teacher._id}/${date}`, {
                status: editing.status, late: editing.late, halfDay: editing.halfDay, note: editing.note,
            });
            setEditing(null);
            setMessage({ severity: 'success', text: `Attendance saved for ${editing.teacher.name}.` });
            load();
        } catch (e) {
            setMessage({ severity: 'error', text: e.response?.data?.message || 'Could not save.' });
        }
    };

    const counts = rows.reduce((acc, r) => {
        const k = !r.record ? 'notMarked' : r.record.status;
        acc[k] = (acc[k] || 0) + 1;
        if (r.record && r.record.late) acc.late = (acc.late || 0) + 1;
        return acc;
    }, {});

    return (
        <Box>
            {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Chip color="success" label={`Present ${counts.present || 0}`} />
                <Chip color="warning" label={`Late ${counts.late || 0}`} />
                <Chip color="error" label={`Absent ${counts.absent || 0}`} />
                <Chip color="info" label={`Leave ${counts.leave || 0}`} />
                <Chip variant="outlined" label={`Not marked ${counts.notMarked || 0}`} />
            </Stack>
            <DataTable
                loading={loading}
                rows={rows}
                searchKeys={['name']}
                searchPlaceholder="Search staff"
                toolbar={(
                    <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                        <TextField size="small" type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ max: clinicToday() }} />
                        <Button variant="outlined" onClick={closeDay}>Mark unmarked absent</Button>
                    </Stack>
                )}
                columns={[
                    { id: 'name', label: 'Staff', render: (r) => <><Typography sx={{ fontWeight: 600 }}>{r.teacher.name}</Typography><Typography variant="caption" color="text.secondary">{r.teacher.designation || ''}</Typography></> },
                    { id: 'schedule', label: 'Schedule', render: (r) => (r.teacher.scheduledCheckIn ? `${formatTime(r.teacher.scheduledCheckIn)} – ${formatTime(r.teacher.scheduledCheckOut)}` : '—') },
                    { id: 'in', label: 'Check-in', render: (r) => time(r.record && r.record.checkIn) },
                    { id: 'out', label: 'Check-out', render: (r) => time(r.record && r.record.checkOut) },
                    { id: 'distance', label: 'Distance', render: (r) => (r.record && r.record.checkIn && r.record.checkIn.distance != null ? `${r.record.checkIn.distance} m` : '—') },
                    { id: 'status', label: 'Status', highlight: true, render: (r) => statusChip(r.record) },
                    { id: 'source', label: 'Marked by', render: (r) => (r.record ? (r.record.source === 'admin' ? 'Admin' : 'App') : '—') },
                ]}
                actions={(r) => (
                    <RowButton onClick={() => setEditing({
                        teacher: r.teacher,
                        status: r.record ? r.record.status : 'present',
                        late: !!(r.record && r.record.late),
                        halfDay: !!(r.record && r.record.halfDay),
                        note: (r.record && r.record.note) || '',
                    })}
                    >
                        {r.record ? 'Correct' : 'Mark'}
                    </RowButton>
                )}
            />
            <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
                <DialogTitle>{editing && `${editing.teacher.name} — ${date}`}</DialogTitle>
                <DialogContent>
                    {editing && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField select label="Status" value={editing.status} onChange={(e) => setEditing((x) => ({ ...x, status: e.target.value }))}>
                                <MenuItem value="present">Present</MenuItem>
                                <MenuItem value="absent">Absent</MenuItem>
                                <MenuItem value="leave">Leave</MenuItem>
                            </TextField>
                            {editing.status === 'present' && (
                                <>
                                    <FormControlLabel control={<Switch checked={editing.late} onChange={(e) => setEditing((x) => ({ ...x, late: e.target.checked }))} />} label="Late arrival" />
                                    <FormControlLabel control={<Switch checked={editing.halfDay} onChange={(e) => setEditing((x) => ({ ...x, halfDay: e.target.checked }))} />} label="Half day" />
                                </>
                            )}
                            <TextField label="Note" value={editing.note} inputProps={{ maxLength: 300 }} onChange={(e) => setEditing((x) => ({ ...x, note: e.target.value }))} multiline rows={2} />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditing(null)}>Cancel</Button>
                    <Button variant="contained" onClick={save}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const MonthView = () => {
    const [month, setMonth] = useState(clinicToday().slice(0, 7));
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        setLoading(true);
        axios.get(`${API}/attendance/staff-month`, { params: { month } })
            .then(({ data }) => alive && setRows(data.rows.map((r) => ({ ...r.summary, _id: r.teacher._id, name: r.teacher.name }))))
            .catch((e) => alive && setError(e.response?.data?.message || 'Could not load the month.'))
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [month]);

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <DataTable
                loading={loading}
                rows={rows}
                searchKeys={['name']}
                searchPlaceholder="Search staff"
                toolbar={<TextField size="small" type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ ml: 'auto' }} />}
                columns={[
                    { id: 'name', label: 'Staff', render: (r) => <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography> },
                    { id: 'present', label: 'Present', align: 'center' },
                    { id: 'absent', label: 'Absent', align: 'center', highlight: true },
                    { id: 'halfDay', label: 'Half days', align: 'center' },
                    { id: 'late', label: 'Late', align: 'center' },
                    { id: 'sandwich', label: 'Sandwiched weekends', align: 'center' },
                    { id: 'leave', label: 'Leave', align: 'center' },
                    { id: 'unpaidLeave', label: 'Unpaid leave', align: 'center' },
                    { id: 'unmarkedWorkingDays', label: 'Unmarked days', align: 'center' },
                ]}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                These counts fill the deduction rows in Pay Salary. Unmarked working days are not deducted; mark them absent first if they should be.
            </Typography>
        </Box>
    );
};

const StaffAttendance = () => {
    const [tab, setTab] = useState(0);
    return (
        <PageShell>
            <PageHeader icon={EventAvailableOutlinedIcon} title="Staff Attendance" subtitle="Check-ins from the staff app, admin corrections and monthly totals" />
            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Daily register" />
                <Tab label="Monthly summary" />
            </Tabs>
            {tab === 0 ? <DayView /> : <MonthView />}
        </PageShell>
    );
};

export default StaffAttendance;
