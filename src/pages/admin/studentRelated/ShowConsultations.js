import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid,
    ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import DataTable, { RowButton } from '../../../components/DataTable';
import PageHeader, { PageShell } from '../../../components/PageHeader';
import Popup from '../../../components/Popup';
import OtpActionDialog from '../../../components/OtpActionDialog';

const money = (v) => `Rs. ${(Number(v) || 0).toLocaleString()}`;
const yesNo = (v) => (v ? 'Yes' : 'No');

const RECOMMENDATIONS = [
    ['rec_speech_difficultyPronouncing', 'Difficulty pronouncing words'], ['rec_speech_stuttering', 'Stuttering'],
    ['rec_speech_followInstructions', 'Difficulty following instructions'], ['rec_behavior_concern', 'Behavioural concerns'],
    ['rec_behavior_diagnosis', 'Diagnosed (Autism, ADHD, etc.)'], ['rec_behavior_socialChallenges', 'Social challenges'],
    ['rec_occupational_dailyActivities', 'Difficulty with daily activities'], ['rec_occupational_sensoryIssue', 'Sensory issues'],
    ['rec_remedial_difficultiesLearning', 'Learning difficulties'], ['rec_remedial_specialEducation', 'Needs special education'],
    ['rec_additional_iep', 'Inclusive Edification Programme (IEP)'], ['rec_additional_fl', 'Fun & Learn'],
];

const Field = ({ label, value }) => (
    <Grid item xs={12} sm={6} md={4}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</Typography>
        <Typography>{value === undefined || value === null || value === '' ? '—' : value}</Typography>
    </Grid>
);

const StatusChip = ({ row }) => (row.status === 'admitted'
    ? <Chip size="small" color="success" variant="outlined" label={`Admitted${row.student?.rollNum ? ` · ${row.student.rollNum}` : ''}`} />
    : <Chip size="small" color="warning" variant="outlined" label="Pending" />);

const ShowConsultations = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending');
    const [viewing, setViewing] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const [message, setMessage] = useState({ text: '', success: true });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/consultations/${currentUser._id}`, { params: { status: 'all' } });
            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            setMessage({ text: 'Could not load consultations.', success: false });
        } finally {
            setLoading(false);
        }
    }, [currentUser._id]);

    useEffect(() => { load(); }, [load]);

    const visible = useMemo(() => (status === 'all' ? rows : rows.filter((r) => r.status === status)), [rows, status]);
    const counts = useMemo(() => ({
        pending: rows.filter((r) => r.status === 'pending').length,
        admitted: rows.filter((r) => r.status === 'admitted').length,
    }), [rows]);

    const admit = (row) => navigate('/Admin/addstudents', { state: { consultationId: row._id } });

    const columns = [
        { id: 'consultationNo', label: 'No.', highlight: true },
        { id: 'name', label: 'Child', minWidth: 150 },
        { id: 'age', label: 'Age', render: (r) => r.age || '—' },
        { id: 'parentName', label: 'Parent / Guardian', minWidth: 150, render: (r) => r.parentName || '—' },
        { id: 'parentContact', label: 'Contact' },
        { id: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) },
        { id: 'fee', label: 'Fee Paid', render: (r) => `${money(r.paidFee)} / ${money(r.consultationFee)}` },
        { id: 'status', label: 'Status', render: (r) => <StatusChip row={r} /> },
    ];

    return (
        <PageShell>
            <PageHeader
                icon={AssignmentIndOutlinedIcon}
                title="Consultations"
                subtitle="Children seen for consultation. Admit one to give them a roll number and make them a student."
                actions={<Button variant="contained" startIcon={<NoteAddOutlinedIcon />} onClick={() => navigate('/Admin/AddConsultancy')}>New Consultation</Button>}
            />
            <DataTable
                columns={columns}
                rows={visible}
                loading={loading}
                searchKeys={['name', 'parentName', 'parentContact', 'consultationNo']}
                searchPlaceholder="Search by child, parent, contact or number"
                emptyText={status === 'pending' ? 'No consultations waiting for admission.' : 'No consultations yet.'}
                toolbar={(
                    <ToggleButtonGroup exclusive size="small" color="primary" value={status} onChange={(_, v) => v && setStatus(v)}>
                        <ToggleButton value="pending">Pending ({counts.pending})</ToggleButton>
                        <ToggleButton value="admitted">Admitted ({counts.admitted})</ToggleButton>
                        <ToggleButton value="all">All</ToggleButton>
                    </ToggleButtonGroup>
                )}
                actions={(r) => (
                    <>
                        <RowButton onClick={() => setViewing(r)}>View</RowButton>
                        {r.status === 'pending' && <RowButton color="primary" onClick={() => admit(r)}>Admit</RowButton>}
                        {r.status === 'pending' && <RowButton color="error" onClick={() => setToDelete({ id: r._id, name: `${r.name} (${r.consultationNo})` })}>Delete</RowButton>}
                        {r.status === 'admitted' && r.student?._id && <RowButton onClick={() => navigate(`/Admin/students/student/${r.student._id}`)}>Student</RowButton>}
                    </>
                )}
            />

            <Dialog open={!!viewing} onClose={() => setViewing(null)} fullWidth maxWidth="md">
                {viewing && (
                    <>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            {viewing.name} <Typography component="span" color="text.secondary">· {viewing.consultationNo}</Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <StatusChip row={viewing} />
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Child</Typography>
                            <Grid container spacing={2}>
                                <Field label="Age" value={viewing.age} />
                                <Field label="Date of Birth" value={viewing.dob && new Date(viewing.dob).toLocaleDateString()} />
                                <Field label="Gender" value={viewing.gender} />
                                <Field label="Consultation Date" value={viewing.consultancyDate} />
                                <Field label="Reference" value={viewing.reference} />
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Parent / Guardian</Typography>
                            <Grid container spacing={2}>
                                <Field label="Name" value={viewing.parentName} />
                                <Field label="Contact" value={viewing.parentContact} />
                                <Field label="CNIC" value={viewing.parentCNIC} />
                                <Field label="Profession" value={viewing.parentProfession} />
                                <Field label="Gender" value={viewing.parentGender} />
                                <Field label="Marital Status" value={viewing.parentMaritalStatus} />
                                <Field label="Address" value={viewing.parentAddress} />
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Medical History</Typography>
                            <Grid container spacing={2}>
                                <Field label="Diagnosed condition" value={`${yesNo(viewing.doctorDiagnosisCondition)}${viewing.doctorDiagnosisDetails ? ` — ${viewing.doctorDiagnosisDetails}` : ''}`} />
                                <Field label="Previous therapies" value={`${yesNo(viewing.takingTherapiesBefore)}${viewing.therapiesBeforeDetails ? ` — ${viewing.therapiesBeforeDetails}` : ''}`} />
                                <Field label="On medication" value={`${yesNo(viewing.onMedication)}${viewing.medicationDetails ? ` — ${viewing.medicationDetails}` : ''}`} />
                                <Field label="Attends school" value={`${yesNo(viewing.childAttendsSchool)}${viewing.schoolDetails ? ` — ${viewing.schoolDetails}` : ''}`} />
                                <Field label="Therapies sought" value={(viewing.therapiesSeeking || []).join(', ')} />
                                <Field label="Specific requirements" value={viewing.therapiesSeekingSpecific} />
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Consultant Recommendations</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {RECOMMENDATIONS.filter(([k]) => viewing[k]).map(([k, label]) => <Chip key={k} label={label} size="small" />)}
                                {!RECOMMENDATIONS.some(([k]) => viewing[k]) && <Typography color="text.secondary">None recorded.</Typography>}
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Field label="Therapy Plan" value={viewing.therapyPlan?.label} />
                                <Field label="Consultation Fee" value={money(viewing.consultationFee)} />
                                <Field label="Paid" value={money(viewing.paidFee)} />
                                <Field label="Invoice" value={viewing.invoiceID} />
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewing(null)}>Close</Button>
                            {viewing.status === 'pending' && <Button variant="contained" onClick={() => admit(viewing)}>Admit as Student</Button>}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Popup open={!!message.text} message={message.text} success={message.success} onClose={() => setMessage({ text: '', success: true })} />
            <OtpActionDialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onSuccess={(result) => { setToDelete(null); setMessage({ text: result?.message || 'Consultation deleted.', success: true }); load(); }}
                adminId={currentUser?._id}
                actionType="delete"
                targetType="consultation"
                targetId={toDelete?.id}
                targetName={toDelete?.name}
            />
        </PageShell>
    );
};

export default ShowConsultations;
