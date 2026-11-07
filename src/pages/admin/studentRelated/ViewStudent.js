import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, TextField, Stack, IconButton,
    FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox,
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Divider,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Popup from '../../../components/Popup';
import OtpActionDialog from '../../../components/OtpActionDialog';
import InvoiceDialog from '../../../components/InvoiceDialog';
import { lineTotal, sumLineItems, toMoney } from '../../../utils/feeCalc';
import { buildStudentForm as buildForm, studentChanges, feeLineKey, feeStatus, THERAPY_OPTIONS } from '../../../utils/studentForm';
import axios from 'axios';

// Shows "N/A" for null/undefined/empty instead of the literal text "undefined".
const show = (value) => (value === null || value === undefined || value === '' ? 'N/A' : String(value));

// Helper components
const DetailItem = ({ label, value }) => ( <Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography><Typography variant="body1" gutterBottom>{show(value)}</Typography></Grid> );
const EditableDetailItem = ({ label, value, isEditMode, onChange, name, type = 'text' }) => ( <Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>{isEditMode ? ( <TextField fullWidth variant="outlined" size="small" value={value} onChange={onChange} name={name} type={type} InputLabelProps={type === 'date' ? { shrink: true } : undefined} /> ) : ( <Typography variant="body1" gutterBottom>{show(value)}</Typography> )}</Grid> );

const idOf = (v) => (v && typeof v === 'object' ? (v._id || v.$oid) : v);

// A yes/no answer: a checkbox while editing, "Yes"/"No" otherwise.
const BoolItem = ({ label, name, value, isEditMode, onToggle, xs = 12, sm = 6 }) => (
    <Grid item xs={xs} sm={sm} sx={{ mb: 1 }}>
        {isEditMode ? (
            <FormControlLabel control={<Checkbox name={name} checked={!!value} onChange={onToggle} />} label={label} />
        ) : (
            <>
                <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
                <Typography variant="body1">{value ? 'Yes' : 'No'}</Typography>
            </>
        )}
    </Grid>
);

const RECOMMENDATIONS = [
    ['Speech', [['rec_speech_difficultyPronouncing', 'Difficulty pronouncing words'], ['rec_speech_stuttering', 'Stuttering'], ['rec_speech_followInstructions', 'Difficulty following instructions']]],
    ['Behaviour', [['rec_behavior_concern', 'Behavioural concerns'], ['rec_behavior_diagnosis', 'Diagnosed (Autism, ADHD, etc.)'], ['rec_behavior_socialChallenges', 'Social challenges']]],
    ['Occupational', [['rec_occupational_dailyActivities', 'Difficulty with daily activities'], ['rec_occupational_sensoryIssue', 'Sensory issues']]],
    ['Remedial', [['rec_remedial_difficultiesLearning', 'Learning difficulties'], ['rec_remedial_specialEducation', 'Needs special education']]],
    ['Additional programme', [['rec_additional_iep', 'Inclusive Edification Programme (IEP)'], ['rec_additional_fl', 'Fun & Learn']]],
];

const STATUS_COLOR = { Paid: 'success.main', 'Partially Paid': 'warning.main', Unpaid: 'error.main' };

const FEE_TYPE_LABEL = { '0': 'Consultancy', '1': 'Admission', '2': 'Monthly' };

const ViewStudent = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const params = useParams();
    const { currentUser } = useSelector((state) => state.user); // Logged-in admin
    const studentID = params.id;

    // The record is loaded here by its id rather than read from shared redux
    // state, so another student's (or a stale) record is never shown.
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // --- SECTION: UI & Form State ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [popup, setPopup] = useState({ open: false, message: '', success: true });
    const [formData, setFormData] = useState(buildForm({}));
    const [otpAction, setOtpAction] = useState(null); // { type, payload }

    // --- SECTION: Related data ---
    const [classDetails, setClassDetails] = useState([]);
    const [classDetailsLoading, setClassDetailsLoading] = useState(false);
    const [classDetailsError, setClassDetailsError] = useState(null);
    const [allClasses, setAllClasses] = useState([]);
    const [feeHistory, setFeeHistory] = useState([]);
    const [feeHistoryError, setFeeHistoryError] = useState('');
    const [invoiceData, setInvoiceData] = useState(null);

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // --- SECTION: Data Fetching ---
    const loadFeeHistory = useCallback(async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/StudentFees/${studentID}`);
            setFeeHistory(Array.isArray(data) ? data : []);
            setFeeHistoryError('');
        } catch (err) {
            setFeeHistoryError('Could not load fee history.');
        }
    }, [studentID]);

    // Always loads the complete, latest record by id (never the partial list row).
    const loadStudent = useCallback(async (isCancelled = () => false) => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/Student/${studentID}`);
            if (isCancelled()) return;
            if (!data || !data._id) {
                setLoadError(data?.message || 'Student not found.');
                return;
            }
            setStudent(data);
            setFormData(buildForm(data));
        } catch (err) {
            if (isCancelled()) return;
            setLoadError(err?.response?.status === 404 ? 'This student was not found. It may have been deleted.' : (err?.response?.data?.message || 'Error loading student details.'));
        }
    }, [studentID]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError('');
        setStudent(null);
        setIsEditMode(false);
        loadStudent(() => cancelled).finally(() => { if (!cancelled) setLoading(false); });
        loadFeeHistory();
        return () => { cancelled = true; };
    }, [studentID, loadFeeHistory, loadStudent]);

    useEffect(() => {
        if (!currentUser?._id) return;
        axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${currentUser._id}`)
            .then(({ data }) => setAllClasses(Array.isArray(data) ? data : []))
            .catch(() => setAllClasses([]));
    }, [currentUser?._id]);

    useEffect(() => {
        const ids = (student?.className || []).map(idOf).filter(Boolean);
        if (ids.length === 0) {
            setClassDetails([]);
            return;
        }
        let cancelled = false;
        setClassDetailsLoading(true);
        setClassDetailsError(null);
        Promise.all(ids.map((id) => axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${id}`)))
            .then((results) => { if (!cancelled) setClassDetails(results.map((r) => r.data).filter((c) => c && c._id)); })
            .catch(() => { if (!cancelled) setClassDetailsError('Could not load class details.'); })
            .finally(() => { if (!cancelled) setClassDetailsLoading(false); });
        return () => { cancelled = true; };
    }, [student]);

    // --- SECTION: Event Handlers ---
    const handleInputChange = (event) => setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    const handleDayChange = (event) => {
        const { name, checked } = event.target;
        setFormData((prev) => ({ ...prev, days: checked ? [...prev.days, name] : prev.days.filter((day) => day !== name) }));
    };
    const handleToggle = (event) => {
        const { name, checked } = event.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };
    const handleTherapyToggle = (event) => {
        const { name, checked } = event.target;
        setFormData((prev) => ({ ...prev, therapiesSeeking: checked ? [...prev.therapiesSeeking, name] : prev.therapiesSeeking.filter((t) => t !== name) }));
    };
    const handleCancel = () => {
        // Discard unsaved edits and go back to the saved values.
        setFormData(buildForm(student || {}));
        setIsEditMode(false);
    };

    const handleFeeLineChange = (key, field, value) => {
        setFormData((prev) => ({
            ...prev,
            feePlan: prev.feePlan.map((l) => {
                if (l.key !== key) return l;
                if (field === 'sclassName') {
                    const picked = allClasses.find((c) => c._id === value);
                    // Picking a class only fills the name; the agreed fee is not overwritten.
                    return { ...l, sclassName: value, serviceName: picked ? picked.sclassName : l.serviceName };
                }
                return { ...l, [field]: value };
            }),
        }));
    };
    const handleAddFeeLine = () => setFormData((prev) => ({
        ...prev,
        feePlan: [...prev.feePlan, { key: feeLineKey(), sclassName: '', serviceName: '', feePerSession: '', sessions: 1 }],
    }));
    const handleRemoveFeeLine = (key) => setFormData((prev) => ({ ...prev, feePlan: prev.feePlan.filter((l) => l.key !== key) }));

    const buildChanges = () => studentChanges(student || {}, formData);

    const validate = (changes) => {
        if (changes.name !== undefined && !changes.name.trim()) return 'Student name is required.';
        if (changes.parentContact && !/^03\d{9}$/.test(changes.parentContact)) return 'Parent contact must start with 03 and be 11 digits.';
        if (changes.parentCNIC && changes.parentCNIC.replace(/\D/g, '').length !== 13) return 'Parent CNIC must be 13 digits.';
        if (changes.studentEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(changes.studentEmail)) return 'Enter a valid student email address.';
        if (changes.className && changes.className.length === 0) return 'Select at least one class.';
        if (changes.feePlan) {
            for (const l of changes.feePlan) {
                if (!String(l.serviceName || '').trim()) return 'Every agreed fee line needs a session/service name.';
                if (!(toMoney(l.feePerSession) >= 0) || l.feePerSession === '') return `Enter a valid fee for "${l.serviceName}".`;
                if (!(l.sessions >= 1)) return `Sessions for "${l.serviceName}" must be 1 or more.`;
            }
        }
        return '';
    };

    const handleUpdateClick = () => {
        const changes = buildChanges();
        if (Object.keys(changes).length === 0) {
            setPopup({ open: true, message: 'No changes to save.', success: false });
            return;
        }
        const problem = validate(changes);
        if (problem) {
            setPopup({ open: true, message: problem, success: false });
            return;
        }
        setOtpAction({ type: 'update', payload: changes });
    };

    const handleOtpSuccess = (result) => {
        const type = otpAction?.type;
        setOtpAction(null);
        if (type === 'delete') {
            navigate('/Admin/students', { replace: true });
            return;
        }
        // Re-fetch so the page shows exactly what the server saved.
        setIsEditMode(false);
        loadStudent();
        setPopup({ open: true, message: result?.message || 'Details Updated Successfully.', success: true });
        loadFeeHistory();
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (loadError || !student) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" gutterBottom>{loadError || 'Error loading student details.'}</Typography>
                <Button variant="outlined" onClick={() => navigate('/Admin/students')}>Back to students</Button>
            </Box>
        );
    }

    const planTotal = sumLineItems(isEditMode ? formData.feePlan : student.feePlan);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h4" gutterBottom>{student.name || 'Student Details'}</Typography>
                    <Typography variant="h6" color="text.secondary">Roll No: {student.rollNum}</Typography>
                </div>
                {!isEditMode && <Button variant="contained" onClick={() => setIsEditMode(true)}>Edit Details</Button>}
            </Paper>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateClick(); }}>
                <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Student Profile</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><EditableDetailItem label="Name" name="name" value={formData.name} isEditMode={isEditMode} onChange={handleInputChange} /><DetailItem label="Roll Number" value={student.rollNum} /><Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Gender</Typography>{isEditMode ? (<FormControl fullWidth size="small"><Select name="gender" value={formData.gender} onChange={handleInputChange} displayEmpty><MenuItem value=""><em>Not set</em></MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl>) : (<Typography variant="body1" gutterBottom>{show(formData.gender)}</Typography>)}</Grid><EditableDetailItem label="Age" name="age" value={formData.age} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Date of Birth" name="dob" value={formData.dob} isEditMode={isEditMode} onChange={handleInputChange} type="date" /><EditableDetailItem label="Reference" name="reference" value={formData.reference} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Student Email" name="studentEmail" value={formData.studentEmail} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Session Time" name="sessionTime" value={formData.sessionTime} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Assigned Teacher" name="assignedTeacher" value={formData.assignedTeacher} isEditMode={isEditMode} onChange={handleInputChange} /><DetailItem label="Admission Date" value={student.admissionDate} /><DetailItem label="Registered Through" value={student.isConsultantStudent ? 'Consultant (not yet admitted)' : (student.consultancyDate ? 'Consultant, then admitted' : 'Add Student')} /></Grid></AccordionDetails></Accordion>
                <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Parent & Contact Information</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><EditableDetailItem label="Parent's Name" name="parentName" value={formData.parentName} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Parent's Contact" name="parentContact" value={formData.parentContact} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Parent's CNIC" name="parentCNIC" value={formData.parentCNIC} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Parent's Profession" name="parentProfession" value={formData.parentProfession} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Home Address" name="parentAddress" value={formData.parentAddress} isEditMode={isEditMode} onChange={handleInputChange} /><Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Parent's Gender</Typography>{isEditMode ? (<FormControl fullWidth size="small"><Select name="parentGender" value={formData.parentGender} onChange={handleInputChange} displayEmpty><MenuItem value=""><em>Not set</em></MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl>) : (<Typography variant="body1" gutterBottom>{show(formData.parentGender)}</Typography>)}</Grid><Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Marital Status</Typography>{isEditMode ? (<FormControl fullWidth size="small"><Select name="parentMaritalStatus" value={formData.parentMaritalStatus} onChange={handleInputChange} displayEmpty><MenuItem value=""><em>Not set</em></MenuItem><MenuItem value="Single">Single</MenuItem><MenuItem value="Married">Married</MenuItem><MenuItem value="Widow">Widow</MenuItem><MenuItem value="Divorced">Divorced</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl>) : (<Typography variant="body1" gutterBottom>{show(formData.parentMaritalStatus)}</Typography>)}</Grid></Grid></AccordionDetails></Accordion>
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Medical History</Typography></AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <BoolItem label="Doctor diagnosed a condition" name="doctorDiagnosisCondition" value={formData.doctorDiagnosisCondition} isEditMode={isEditMode} onToggle={handleToggle} />
                            <EditableDetailItem label="Diagnosis Details" name="doctorDiagnosisDetails" value={formData.doctorDiagnosisDetails} isEditMode={isEditMode} onChange={handleInputChange} />
                            <BoolItem label="Taken therapies before" name="takingTherapiesBefore" value={formData.takingTherapiesBefore} isEditMode={isEditMode} onToggle={handleToggle} />
                            <EditableDetailItem label="Previous Therapies" name="therapiesBeforeDetails" value={formData.therapiesBeforeDetails} isEditMode={isEditMode} onChange={handleInputChange} />
                            <BoolItem label="Currently on medication" name="onMedication" value={formData.onMedication} isEditMode={isEditMode} onToggle={handleToggle} />
                            <EditableDetailItem label="Medication Details" name="medicationDetails" value={formData.medicationDetails} isEditMode={isEditMode} onChange={handleInputChange} />
                            <BoolItem label="Attends school elsewhere" name="childAttendsSchool" value={formData.childAttendsSchool} isEditMode={isEditMode} onToggle={handleToggle} />
                            <EditableDetailItem label="School Details" name="schoolDetails" value={formData.schoolDetails} isEditMode={isEditMode} onChange={handleInputChange} />
                            <Grid item xs={12} sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Therapies Sought</Typography>
                                {isEditMode ? (
                                    <FormGroup row>{THERAPY_OPTIONS.map((t) => (<FormControlLabel key={t} control={<Checkbox name={t} checked={formData.therapiesSeeking.includes(t)} onChange={handleTherapyToggle} />} label={t} />))}</FormGroup>
                                ) : (<Typography variant="body1">{formData.therapiesSeeking.length ? formData.therapiesSeeking.join(', ') : 'N/A'}</Typography>)}
                            </Grid>
                            <EditableDetailItem label="Specific Requirements" name="therapiesSeekingSpecific" value={formData.therapiesSeekingSpecific} isEditMode={isEditMode} onChange={handleInputChange} />
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded={!!student.consultancyDate || student.isConsultantStudent}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Consultant Assessment</Typography></AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <DetailItem label="Consultancy Date" value={student.consultancyDate} />
                            <DetailItem label="Therapy Plan" value={student.therapyPlan?.label ? `${student.therapyPlan.label} (Rs. ${toMoney(student.therapyPlan.perSessionCost).toLocaleString()}/session, Rs. ${toMoney(student.therapyPlan.perMonthCost).toLocaleString()}/month)` : ''} />
                        </Grid>
                        {RECOMMENDATIONS.map(([group, items]) => (
                            <Box key={group} sx={{ mt: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{group}</Typography>
                                <Grid container spacing={1}>
                                    {items.map(([name, label]) => <BoolItem key={name} label={label} name={name} value={formData[name]} isEditMode={isEditMode} onToggle={handleToggle} sm={4} />)}
                                </Grid>
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Enrolled Courses & Schedule</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Scheduled Days</Typography>{isEditMode ? (<FormGroup row>{weekdays.map(day => (<FormControlLabel key={day} control={<Checkbox checked={formData.days.includes(day)} onChange={handleDayChange} name={day} />} label={day} />))}</FormGroup>) : (<Typography variant="body1" gutterBottom>{formData.days.length ? formData.days.join(', ') : 'N/A'}</Typography>)}</Grid></Grid><Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Class Details:</Typography>{isEditMode && (<FormControl fullWidth size="small" sx={{ mb: 2 }}><InputLabel id="student-classes">Classes</InputLabel><Select labelId="student-classes" label="Classes" multiple value={formData.className.filter((id) => allClasses.some((c) => c._id === id))} onChange={(e) => setFormData((prev) => ({ ...prev, className: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value }))} renderValue={(sel) => sel.map((id) => allClasses.find((c) => c._id === id)?.sclassName || id).join(', ')}>{allClasses.map((c) => <MenuItem key={c._id} value={c._id}><Checkbox checked={formData.className.includes(c._id)} />{c.sclassName}</MenuItem>)}</Select><Typography variant="caption" color="text.secondary">The first class is the primary class. Saved classes are shown below.</Typography></FormControl>)}{classDetailsLoading ? <CircularProgress /> : classDetailsError ? <Typography color="error">{classDetailsError}</Typography> : classDetails.length === 0 ? <Typography variant="body2">No classes.</Typography> : (<Grid container spacing={2}>{classDetails.map((sClass) => (<Grid item xs={12} md={6} key={sClass._id}><Card variant="outlined"><CardContent><Typography variant="h6">{sClass.sclassName}</Typography><DetailItem label="Timing" value={`${sClass.timingSlot} (${sClass.timingType})`} /><DetailItem label="Class Default Fee" value={`Rs. ${sClass.sclassFee}`} /></CardContent></Card></Grid>))}</Grid>)}</AccordionDetails></Accordion>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Fees</Typography></AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <DetailItem label="Admission Fee" value={`Rs. ${toMoney(student.admissionFee).toLocaleString()}`} />
                            <DetailItem label="Security Deposit" value={`Rs. ${toMoney(student.securityDeposit).toLocaleString()}`} />
                            <DetailItem label="Other Charges" value={`Rs. ${toMoney(student.otherCharges).toLocaleString()}`} />
                            <DetailItem label="Admission Total" value={`Rs. ${toMoney(student.totalFee).toLocaleString()}`} />
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Agreed Session Fees</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Agreed for this student at admission and used as the default on every new monthly fee slip.
                            Changing them does not alter slips that were already issued.
                        </Typography>
                        {formData.feePlan.length === 0 ? (
                            <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                                No agreed fees saved for this student. New fee slips will start from the class fee.
                            </Typography>
                        ) : formData.feePlan.map((line) => (
                            isEditMode ? (
                                <Stack key={line.key} direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
                                    <FormControl size="small" sx={{ flex: 2, minWidth: 0 }}>
                                        <InputLabel id={`plan-${line.key}`}>Session / Service</InputLabel>
                                        <Select
                                            labelId={`plan-${line.key}`} label="Session / Service"
                                            value={allClasses.some((c) => c._id === line.sclassName) ? line.sclassName : ''}
                                            onChange={(e) => handleFeeLineChange(line.key, 'sclassName', e.target.value)}
                                            displayEmpty
                                            renderValue={(sel) => (sel ? (allClasses.find((c) => c._id === sel)?.sclassName || line.serviceName) : (line.serviceName || <em>Select a class</em>))}
                                        >
                                            {allClasses.map((c) => <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <TextField size="small" label="Fee Per Session (PKR)" type="number" value={line.feePerSession} onChange={(e) => handleFeeLineChange(line.key, 'feePerSession', e.target.value)} InputProps={{ inputProps: { min: 0 } }} sx={{ flex: 1 }} />
                                    <TextField size="small" label="Sessions" type="number" value={line.sessions} onChange={(e) => handleFeeLineChange(line.key, 'sessions', e.target.value)} InputProps={{ inputProps: { min: 1, step: 1 } }} sx={{ flex: 1 }} />
                                    <Typography sx={{ flex: 1 }}>Rs. {lineTotal(line).toLocaleString()}</Typography>
                                    <IconButton color="error" onClick={() => handleRemoveFeeLine(line.key)} aria-label="Remove fee line"><DeleteIcon /></IconButton>
                                </Stack>
                            ) : (
                                <Grid container key={line.key} spacing={2}>
                                    <DetailItem label={line.serviceName} value={`Rs. ${toMoney(line.feePerSession).toLocaleString()} x ${line.sessions} session(s) = Rs. ${lineTotal(line).toLocaleString()}`} />
                                </Grid>
                            )
                        ))}
                        {isEditMode && (
                            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddFeeLine} sx={{ mb: 2 }}>Add Session</Button>
                        )}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Monthly Session Fee: Rs. {planTotal.toLocaleString()}</Typography>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Fee History{feeHistory.length > 0 && ` · Outstanding: Rs. ${feeHistory.reduce((sum, r) => sum + feeStatus(r).outstanding, 0).toLocaleString()}`}</Typography>
                        {feeHistoryError ? <Typography color="error">{feeHistoryError}</Typography> : feeHistory.length === 0 ? (
                            <Typography variant="body2">No fee slips yet.</Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead><TableRow><TableCell>Invoice</TableCell><TableCell>Type</TableCell><TableCell>Date</TableCell><TableCell align="right">Net</TableCell><TableCell align="right">Paid</TableCell><TableCell>Status</TableCell><TableCell align="right">Balance</TableCell><TableCell /></TableRow></TableHead>
                                    <TableBody>
                                        {feeHistory.map((r) => (
                                            <TableRow key={r._id}>
                                                <TableCell>{r.invoiceID}</TableCell>
                                                <TableCell>{FEE_TYPE_LABEL[r.isConsultancyOrIsRegistrationOrMonthly] || 'N/A'}</TableCell>
                                                <TableCell>{show(r.date)}</TableCell>
                                                <TableCell align="right">Rs. {toMoney(r.netTotalFee).toLocaleString()}</TableCell>
                                                <TableCell align="right">Rs. {toMoney(r.paidFee).toLocaleString()}</TableCell>
                                                <TableCell sx={{ color: STATUS_COLOR[feeStatus(r).status], fontWeight: 'bold' }}>{feeStatus(r).status}</TableCell>
                                                <TableCell align="right">Rs. {feeStatus(r).outstanding.toLocaleString()}</TableCell>
                                                <TableCell><Button size="small" onClick={() => setInvoiceData({ ...student, ...r })}>View / Print</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </AccordionDetails>
                </Accordion>

                {isEditMode && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={!!otpAction}>Update Details</Button>
                    </Box>
                )}
            </form>

            {!isEditMode && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="error" onClick={() => setOtpAction({ type: 'delete', payload: null })}>
                        Delete Student
                    </Button>
                </Box>
            )}

            <Popup open={popup.open} message={popup.message} success={popup.success} onClose={() => setPopup((p) => ({ ...p, open: false }))} />

            <OtpActionDialog
                open={!!otpAction}
                onClose={() => setOtpAction(null)}
                onSuccess={handleOtpSuccess}
                adminId={currentUser?._id}
                actionType={otpAction?.type}
                targetType="student"
                targetId={studentID}
                targetName={`${student.name} (${student.rollNum})`}
                payload={otpAction?.payload}
            />
            <InvoiceDialog open={!!invoiceData} onClose={() => setInvoiceData(null)} data={invoiceData || {}} />
        </Container>
    );
};

export default ViewStudent;
