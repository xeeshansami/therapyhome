import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Alert, Autocomplete, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import DataTable from '../../../components/DataTable';
import PageHeader, { PageShell } from '../../../components/PageHeader';
import { clinicToday } from './StaffAttendance';

const API = process.env.REACT_APP_BASE_URL;
const STATUS_COLOR = { attended: 'success', absent: 'error', cancelled: 'default' };

const TherapySessions = () => {
    const { currentUser } = useSelector((s) => s.user);
    const [date, setDate] = useState(clinicToday());
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/attendance/sessions`, { params: { date } });
            setRows(data.map((s) => ({
                ...s,
                studentName: s.student ? s.student.name : '—',
                rollNum: s.student ? s.student.rollNum : '',
                therapy: s.sclass ? s.sclass.sclassName : '—',
                therapist: s.teacher ? s.teacher.name : (s.markedByKind === 'teacher' ? 'Staff' : 'Admin'),
            })));
        } catch (e) {
            setMessage({ severity: 'error', text: e.response?.data?.message || 'Could not load sessions.' });
        } finally {
            setLoading(false);
        }
    }, [date]);
    useEffect(() => { load(); }, [load]);

    const openForm = async () => {
        setForm({ student: null, sclassId: '', status: 'attended', durationMinutes: '', notes: '' });
        if (students.length === 0) {
            try {
                const [{ data }, cls] = await Promise.all([
                    axios.get(`${API}/AllStudents/${currentUser._id}`),
                    axios.get(`${API}/SclassList/${currentUser._id}`),
                ]);
                setStudents(Array.isArray(data) ? data.filter((s) => !s.isConsultantStudent) : []);
                setClasses(Array.isArray(cls.data) ? cls.data : []);
            } catch (e) {
                setMessage({ severity: 'error', text: 'Could not load students.' });
            }
        }
    };

    const therapies = useMemo(() => {
        if (!form || !form.student) return [];
        const ids = new Set([...(form.student.className || []), form.student.sclassName]
            .filter(Boolean).map((c) => String(c._id || c)));
        return classes.filter((c) => ids.has(String(c._id)));
    }, [form, classes]);

    const save = async () => {
        try {
            await axios.post(`${API}/attendance/sessions`, {
                studentId: form.student._id, sclassId: form.sclassId, date, status: form.status,
                durationMinutes: form.durationMinutes === '' ? undefined : Number(form.durationMinutes), notes: form.notes,
            });
            setForm(null);
            setMessage({ severity: 'success', text: 'Session saved.' });
            load();
        } catch (e) {
            setMessage({ severity: 'error', text: e.response?.data?.message || 'Could not save the session.' });
        }
    };

    const totals = rows.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});

    return (
        <PageShell>
            <PageHeader
                icon={EventNoteOutlinedIcon}
                title="Therapy Sessions"
                subtitle="Sessions marked by therapists in the app (or here). Attended sessions are used when generating monthly fees."
                actions={<Button variant="contained" onClick={openForm}>Mark a session</Button>}
            />
            {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip color="success" label={`Attended ${totals.attended || 0}`} />
                <Chip color="error" label={`Absent ${totals.absent || 0}`} />
                <Chip label={`Cancelled ${totals.cancelled || 0}`} />
            </Stack>
            <DataTable
                loading={loading}
                rows={rows}
                searchKeys={['studentName', 'rollNum', 'therapy', 'therapist']}
                searchPlaceholder="Search student, therapy or therapist"
                toolbar={<TextField size="small" type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ max: clinicToday() }} sx={{ ml: 'auto' }} />}
                columns={[
                    { id: 'studentName', label: 'Student', render: (r) => <><Typography sx={{ fontWeight: 600 }}>{r.studentName}</Typography><Typography variant="caption" color="text.secondary">{r.rollNum}</Typography></> },
                    { id: 'therapy', label: 'Therapy' },
                    { id: 'therapist', label: 'Marked by' },
                    { id: 'status', label: 'Status', highlight: true, render: (r) => <Chip size="small" color={STATUS_COLOR[r.status]} label={r.status} sx={{ textTransform: 'capitalize' }} /> },
                    { id: 'durationMinutes', label: 'Minutes', align: 'center' },
                    { id: 'notes', label: 'Notes', render: (r) => r.notes || '—' },
                ]}
                emptyText="No sessions marked for this day."
            />
            <Dialog open={!!form} onClose={() => setForm(null)} fullWidth maxWidth="sm">
                <DialogTitle>Mark a session on {date}</DialogTitle>
                <DialogContent>
                    {form && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Autocomplete
                                options={students}
                                getOptionLabel={(s) => `${s.name} (${s.rollNum})`}
                                isOptionEqualToValue={(a, b) => a._id === b._id}
                                value={form.student}
                                onChange={(e, v) => setForm((f) => ({ ...f, student: v, sclassId: '' }))}
                                renderInput={(params) => <TextField {...params} label="Student" />}
                            />
                            <TextField select label="Therapy" value={form.sclassId} onChange={(e) => setForm((f) => ({ ...f, sclassId: e.target.value }))} disabled={!form.student} helperText={form.student && therapies.length === 0 ? 'This student has no therapies.' : ' '}>
                                {therapies.map((c) => <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}
                            </TextField>
                            <TextField select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                                <MenuItem value="attended">Attended</MenuItem>
                                <MenuItem value="absent">Absent</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </TextField>
                            <TextField label="Duration (minutes)" type="number" value={form.durationMinutes} inputProps={{ min: 0, max: 600 }} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} />
                            <TextField label="Notes" value={form.notes} inputProps={{ maxLength: 500 }} multiline rows={2} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setForm(null)}>Cancel</Button>
                    <Button variant="contained" onClick={save} disabled={!form || !form.student || !form.sclassId}>Save</Button>
                </DialogActions>
            </Dialog>
        </PageShell>
    );
};

export default TherapySessions;
