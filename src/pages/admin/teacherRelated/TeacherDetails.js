import React, { useEffect, useMemo, useState } from 'react';
import { can } from '../../../utils/permissions';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import {
    Box, Button, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, TextField,
    FormControl, Select, MenuItem, Avatar, InputLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack,
    Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import StaffExtraFields from '../../../components/StaffExtraFields';
import PeopleMultiSelect from '../../../components/PeopleMultiSelect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Popup from '../../../components/Popup';
import OtpActionDialog from '../../../components/OtpActionDialog';
import ClassMultiSelect from '../../../components/ClassMultiSelect';
import axios from 'axios';
import {
    designationIdFor, isInternTitle, staffRuleError, titleOf, formatTime, internLabel,
    internDurationLabel, joiningDateInput, bankDetailsError, emptyBankDetails,
} from '../../../utils/staffForm';

const API = process.env.REACT_APP_BASE_URL;

// Shows "N/A" for null/undefined/empty instead of the literal text "undefined".
const show = (value) => (value === null || value === undefined || value === '' ? 'N/A' : String(value));

const DetailItem = ({ label, value }) => (<Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography><Typography variant="body1" gutterBottom>{show(value)}</Typography></Grid>);
const EditableDetailItem = ({ label, value, isEditMode, onChange, name, type = 'text' }) => (<Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>{isEditMode ? (<TextField fullWidth variant="outlined" size="small" value={value} onChange={onChange} name={name} type={type} InputLabelProps={type === 'time' ? { shrink: true } : {}} />) : (<Typography variant="body1" gutterBottom>{show(value)}</Typography>)}</Grid>);

// The single source for the editable form, used on load and on Cancel.
const buildForm = (t, designations = []) => ({
    name: t.name || '',
    email: t.email || '',
    phone: t.phone || '',
    address: t.address || '',
    emergencyContact: t.emergencyContact || '',
    salary: t.salary ?? '',
    gender: t.gender || '',
    maritalStatus: t.maritalStatus || '',
    cnic: t.cnic || '',
    education: t.education || '',
    fatherName: t.fatherName || '',
    occupation: t.occupation || '',
    timing: (t.timing && (t.timing._id || t.timing)) || '',
    teacherDateTime: t.teacherDateTime || '',
    designation: designationIdFor(t, designations),
    internType: t.internType || '',
    scheduledCheckIn: t.scheduledCheckIn || '',
    scheduledCheckOut: t.scheduledCheckOut || '',
    // Classes taught (older records only have the single teachSclass).
    teachSclasses: ((t.teachSclasses && t.teachSclasses.length) ? t.teachSclasses : (t.teachSclass ? [t.teachSclass] : []))
        .map((c) => String((c && c._id) || c)),
    joiningDate: joiningDateInput(t),
    internDuration: t.internDuration || '',
    internDurationUnit: t.internDurationUnit || '',
    bankDetails: {
        ...emptyBankDetails(),
        ...(t.bankDetails ? {
            bankName: t.bankDetails.bankName || '', accountTitle: t.bankDetails.accountTitle || '',
            accountNumber: t.bankDetails.accountNumber || '', iban: t.bankDetails.iban || '',
        } : {}),
    },
});

// Objects (bank details) are compared by value.
const same = (a, b) => (a && typeof a === 'object' ? JSON.stringify(a) === JSON.stringify(b) : String(a ?? '') === String(b ?? ''));

const TeacherDetails = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { teacherDetails, loading, error } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);
    const teacherID = params.id;

    // --- SECTION: UI & Form State ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [popup, setPopup] = useState({ open: false, message: '', success: true });
    const [formData, setFormData] = useState(buildForm({}));
    const [designations, setDesignations] = useState([]);
    const [classes, setClasses] = useState([]);
    useEffect(() => {
        if (!currentUser?._id) return;
        axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${currentUser._id}`)
            .then(({ data }) => setClasses(Array.isArray(data) ? data : []))
            .catch(() => setClasses([]));
    }, [currentUser?._id]);

    // --- State for Timings ---
    const [timings, setTimings] = useState([]);
    const [timingLoader, setTimingLoader] = useState(true);

    // --- OTP-verified update/delete ---
    const [otpAction, setOtpAction] = useState(null); // { type, payload, impact }

    // --- Assigned students and withdrawal ---
    const [allStudents, setAllStudents] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [assignedDraft, setAssignedDraft] = useState(null); // ids while editing
    const [lifecycle, setLifecycle] = useState(null); // { action: 'withdraw'|'reactivate', reason }
    const [busy, setBusy] = useState(false);
    const [assignedError, setAssignedError] = useState('');
    const loadAssigned = () => axios.get(`${API}/Teacher/${teacherID}/students`)
        .then(({ data }) => { setAssigned(Array.isArray(data) ? data : []); setAssignedError(''); })
        .catch((err) => {
            setAssigned([]);
            setAssignedError(err?.response?.status === 404 ? 'Assigned students need the updated TherapyHome server.' : (err?.response?.data?.message || 'Could not load assigned students.'));
        });
    useEffect(() => {
        loadAssigned();
        if (currentUser?._id) {
            axios.get(`${API}/AllStudents/${currentUser._id}`).then(({ data }) => setAllStudents(Array.isArray(data) ? data : [])).catch(() => setAllStudents([]));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacherID, currentUser?._id]);

    const saveAssigned = async () => {
        setBusy(true);
        try {
            const { data } = await axios.put(`${API}/Teacher/${teacherID}/students`, { studentIds: assignedDraft });
            setAssigned(data.students || []);
            setAssignedDraft(null);
            setPopup({ open: true, message: data.message || 'Assigned students saved.', success: true });
        } catch (err) {
            setPopup({ open: true, message: err?.response?.data?.message || 'Could not save the assigned students.', success: false });
        } finally {
            setBusy(false);
        }
    };

    const runLifecycle = async () => {
        setBusy(true);
        try {
            const { data } = await axios.post(`${API}/Teacher/${teacherID}/${lifecycle.action}`, lifecycle.action === 'withdraw' ? { reason: lifecycle.reason } : {});
            setLifecycle(null);
            setPopup({ open: true, message: data.message, success: true });
            dispatch(getTeacherDetails(teacherID));
        } catch (err) {
            setPopup({ open: true, message: err?.response?.data?.message || 'Could not update the status.', success: false });
        } finally {
            setBusy(false);
        }
    };

    const startDelete = async () => {
        let impact = '';
        try {
            const { data } = await axios.get(`${API}/Teacher/${teacherID}/delete-impact`);
            impact = data.message;
        } catch (e) { /* the dialog still explains what is kept */ }
        setOtpAction({ type: 'delete', payload: null, impact });
    };

    // teacherDetails is shared redux state; only trust it once it is this staff member.
    const isLoaded = !!teacherDetails && teacherDetails._id === teacherID;

    // --- SECTION: Data Fetching & Form Initialization ---
    useEffect(() => { dispatch(getTeacherDetails(teacherID)); }, [dispatch, teacherID]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BASE_URL}/designations`)
            .then(({ data }) => setDesignations(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Designations fetch error:", err.message));
    }, []);

    useEffect(() => {
        const fetchTimings = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/teacherstimings`);
                if (result.data) {
                    setTimings(result.data);
                }
            } catch (err) {
                console.error("Timings fetch error:", err.message);
            } finally {
                setTimingLoader(false);
            }
        };
        fetchTimings();
    }, []);

    // The form is filled from the saved record as soon as it loads. It used to
    // wait for the timings list too, so when /teacherstimings returned nothing
    // every field stayed blank.
    useEffect(() => {
        if (isLoaded) {
            setFormData(buildForm(teacherDetails, designations));
            setIsEditMode(false);
        }
        // designations are applied by the next effect without leaving edit mode
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, teacherDetails]);

    // Older records store only the designation title; once the list arrives the
    // matching designation is pre-selected (unsaved edits are kept).
    useEffect(() => {
        if (isLoaded && designations.length) {
            setFormData((prev) => (prev.designation ? prev : { ...prev, designation: designationIdFor(teacherDetails, designations) }));
        }
    }, [designations, isLoaded, teacherDetails]);

    const selectedTitle = titleOf(formData.designation, designations) || teacherDetails?.role || '';
    const isIntern = isInternTitle(selectedTitle);

    const timingDetails = useMemo(() => {
        const id = teacherDetails?.timing?._id || teacherDetails?.timing;
        return timings.find(t => t._id === id) || null;
    }, [teacherDetails, timings]);

    // --- SECTION: Event Handlers ---
    const handleInputChange = (event) => setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));

    const handleCancel = () => {
        // Discard unsaved edits and go back to the saved values.
        setIsEditMode(false);
        if (isLoaded) setFormData(buildForm(teacherDetails, designations));
    };

    const handleDesignationChange = (event) => {
        const value = event.target.value;
        // Leaving or entering Intern resets the intern type so it is chosen deliberately.
        setFormData((prev) => ({ ...prev, designation: value, internType: isInternTitle(titleOf(value, designations)) ? prev.internType : '' }));
    };

    // Only changed fields are sent, so untouched values are never rewritten.
    const handleUpdateClick = () => {
        const original = buildForm(teacherDetails, designations);
        const current = { ...formData };
        if (isIntern && current.internType === 'unpaid') current.salary = '0';
        const changes = {};
        if (!isIntern) {
            current.internDuration = '';
            current.internDurationUnit = '';
        }
        Object.keys(current).forEach((k) => {
            if (!same(current[k], original[k])) changes[k] = current[k];
        });
        const ruleProblem = staffRuleError({
            designationTitle: selectedTitle, internType: current.internType, salary: current.salary, scheduledCheckIn: current.scheduledCheckIn, scheduledCheckOut: current.scheduledCheckOut,
            internDuration: current.internDuration, internDurationUnit: current.internDurationUnit,
        }, { requireSchedule: false }) || bankDetailsError(current.bankDetails);
        if (ruleProblem) {
            setPopup({ open: true, message: ruleProblem, success: false });
            return;
        }
        if (changes.teachSclasses !== undefined && changes.teachSclasses.length === 0) {
            setPopup({ open: true, message: 'Choose at least one class.', success: false });
            return;
        }
        if (Object.keys(changes).length === 0) {
            setPopup({ open: true, message: 'No changes to save.', success: false });
            return;
        }
        if (changes.name !== undefined && !String(changes.name).trim()) {
            setPopup({ open: true, message: 'Name is required.', success: false });
            return;
        }
        if (changes.email !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(changes.email).trim())) {
            setPopup({ open: true, message: 'Enter a valid email address.', success: false });
            return;
        }
        setOtpAction({ type: 'update', payload: changes });
    };

    const handleOtpSuccess = (result) => {
        const type = otpAction?.type;
        setOtpAction(null);
        if (type === 'delete') {
            navigate('/Admin/teachers', { replace: true });
            return;
        }
        setIsEditMode(false);
        setPopup({ open: true, message: result?.message || 'Details Updated Successfully.', success: true });
        // Reload so the page shows exactly what the server saved.
        dispatch(getTeacherDetails(teacherID));
    };

    if (!isLoaded) {
        if (error && !loading) {
            return (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        {error?.response?.status === 404 ? 'This staff member was not found. It may have been deleted.' : 'Error loading staff details.'}
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate('/Admin/teachers')}>Back to staff</Button>
                </Box>
            );
        }
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar src={teacherDetails?.photo} sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                        {!teacherDetails?.photo && <AccountCircleIcon sx={{ fontSize: '4rem' }} />}
                    </Avatar>
                    <div>
                        <Typography variant="h4" gutterBottom>{teacherDetails?.name || 'Teacher Details'}</Typography>
                        <Typography variant="h6" color="text.secondary">{teacherDetails?.role || 'No designation'}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            {internLabel(teacherDetails) && <Chip size="small" label={`${internLabel(teacherDetails)}${internDurationLabel(teacherDetails) ? ` · ${internDurationLabel(teacherDetails)}` : ''}`} color={teacherDetails.internType === 'unpaid' ? 'default' : 'primary'} />}
                            <Chip size="small" label={teacherDetails?.status === 'withdrawn' ? 'Withdrawn' : 'Active'} color={teacherDetails?.status === 'withdrawn' ? 'warning' : 'success'} variant="outlined" />
                        </Stack>
                    </div>
                </Box>
                {!isEditMode && can(currentUser, 'staff', 'edit') && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        {teacherDetails?.status === 'withdrawn'
                            ? <Button variant="outlined" color="success" onClick={() => setLifecycle({ action: 'reactivate' })}>Reactivate</Button>
                            : <Button variant="outlined" color="warning" onClick={() => setLifecycle({ action: 'withdraw', reason: '' })}>Withdraw</Button>}
                        <Button variant="contained" onClick={() => setIsEditMode(true)}>Edit Details</Button>
                    </Stack>
                )}
            </Paper>
            {teacherDetails?.status === 'withdrawn' && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Withdrawn{teacherDetails.withdrawnAt ? ` on ${new Date(teacherDetails.withdrawnAt).toLocaleDateString()}` : ''}{teacherDetails.withdrawalReason ? ` — ${teacherDetails.withdrawalReason}` : ''}.
                    {' '}Not counted in attendance or dashboards and cannot sign in to the app. All history is kept.
                </Alert>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateClick(); }}>
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Personal Information</Typography></AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <EditableDetailItem label="Name" name="name" value={formData.name || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Email" name="email" value={formData.email || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Father's Name" name="fatherName" value={formData.fatherName || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Father's Occupation" name="occupation" value={formData.occupation || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Gender</Typography>
                                {isEditMode ? (
                                    <FormControl fullWidth size="small">
                                        <Select name="gender" value={formData.gender || ''} onChange={handleInputChange}>
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (<Typography variant="body1" gutterBottom>{formData.gender || "N/A"}</Typography>)}
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Marital Status</Typography>
                                {isEditMode ? (
                                    <FormControl fullWidth size="small">
                                        <Select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleInputChange}>
                                            <MenuItem value="Single">Single</MenuItem>
                                            <MenuItem value="Married">Married</MenuItem>
                                            <MenuItem value="Widow">Widow</MenuItem>
                                            <MenuItem value="Divorced">Divorced</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (<Typography variant="body1" gutterBottom>{formData.maritalStatus || "N/A"}</Typography>)}
                            </Grid>
                            <EditableDetailItem label="CNIC" name="cnic" value={formData.cnic || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Address" name="address" value={formData.address || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Contact & Professional Information</Typography></AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <EditableDetailItem label="Phone" name="phone" value={formData.phone || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Designation</Typography>
                                {isEditMode ? (
                                    <FormControl fullWidth size="small">
                                        <Select name="designation" value={designations.some((d) => d._id === formData.designation) ? formData.designation : ''} onChange={handleDesignationChange} displayEmpty>
                                            <MenuItem value="" disabled><em>Select a designation</em></MenuItem>
                                            {designations.map((d) => <MenuItem key={d._id} value={d._id}>{d.title}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                ) : (<Typography variant="body1" gutterBottom>{selectedTitle || 'N/A'}</Typography>)}
                            </Grid>
                            {isIntern && (
                                <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Internship</Typography>
                                    {isEditMode ? (
                                        <RadioGroup row name="internType" value={formData.internType} onChange={handleInputChange}>
                                            <FormControlLabel value="paid" control={<Radio size="small" />} label="Paid Intern" />
                                            <FormControlLabel value="unpaid" control={<Radio size="small" />} label="Unpaid Intern" />
                                        </RadioGroup>
                                    ) : (<Typography variant="body1" gutterBottom>{formData.internType === 'unpaid' ? 'Unpaid Intern' : formData.internType === 'paid' ? 'Paid Intern' : 'N/A'}</Typography>)}
                                </Grid>
                            )}
                            {isIntern && formData.internType === 'unpaid' ? (
                                <DetailItem label="Salary" value="Unpaid (not included in payroll)" />
                            ) : (
                                <EditableDetailItem label="Salary" name="salary" value={formData.salary || ''} isEditMode={isEditMode} onChange={handleInputChange} type="number" />
                            )}
                            <EditableDetailItem label="Education" name="education" value={formData.education || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            
                            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Timing</Typography>
                                {isEditMode ? (
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Timing</InputLabel>
                                        <Select name="timing" label="Timing" value={formData.timing || ''} onChange={handleInputChange} disabled={timingLoader}>
                                            {timingLoader ? (
                                                <MenuItem disabled value=""><em>Loading...</em></MenuItem>
                                            ) : (
                                                timings.map((t) => (
                                                    <MenuItem key={t._id} value={t._id}>{t.name} </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Typography variant="body1" gutterBottom>
                                        {timingDetails ? `${timingDetails.name}` : "N/A"}
                                    </Typography>
                                )}
                            </Grid>
                            
                            {isEditMode ? (
                                <>
                                    <EditableDetailItem label="Scheduled Check-in" name="scheduledCheckIn" value={formData.scheduledCheckIn || ''} isEditMode onChange={handleInputChange} type="time" />
                                    <EditableDetailItem label="Scheduled Check-out" name="scheduledCheckOut" value={formData.scheduledCheckOut || ''} isEditMode onChange={handleInputChange} type="time" />
                                </>
                            ) : (
                                <>
                                    <DetailItem label="Scheduled Check-in" value={formatTime(formData.scheduledCheckIn)} />
                                    <DetailItem label="Scheduled Check-out" value={formatTime(formData.scheduledCheckOut)} />
                                </>
                            )}
                            {/* The older single time field, shown only for records that have it. */}
                            {teacherDetails?.teacherDateTime && !teacherDetails?.scheduledCheckIn && (
                                <DetailItem label="Specific Time (older record)" value={formatTime(teacherDetails.teacherDateTime)} />
                            )}

                            <Grid item xs={12} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1 }}>Classes taught (sessions & programs)</Typography>
                                {isEditMode ? (
                                    <ClassMultiSelect
                                        classes={classes}
                                        value={formData.teachSclasses || []}
                                        onChange={(ids) => setFormData((prev) => ({ ...prev, teachSclasses: ids }))}
                                        label="Classes taught"
                                        error={(formData.teachSclasses || []).length === 0 ? 'Choose at least one class.' : ''}
                                    />
                                ) : (
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {(formData.teachSclasses || []).length === 0 && <Typography>—</Typography>}
                                        {(formData.teachSclasses || []).map((id) => {
                                            const c = classes.find((x) => x._id === id)
                                                || (teacherDetails?.teachSclasses || []).find((x) => x && x._id === id)
                                                || (teacherDetails?.teachSclass?._id === id ? teacherDetails.teachSclass : null);
                                            return <Chip key={id} color="primary" variant="outlined" label={c ? c.sclassName : 'Unknown class'} />;
                                        })}
                                    </Stack>
                                )}
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Joining, Internship & Bank Account</Typography></AccordionSummary>
                    <AccordionDetails>
                        {isEditMode ? (
                            <StaffExtraFields
                                value={formData}
                                onChange={(next) => setFormData((prev) => ({ ...prev, joiningDate: next.joiningDate, internDuration: next.internDuration, internDurationUnit: next.internDurationUnit, bankDetails: next.bankDetails }))}
                                isIntern={isIntern}
                            />
                        ) : (
                            <Grid container spacing={2}>
                                <DetailItem label="Joining Date" value={formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : ''} />
                                {isIntern && <DetailItem label="Internship Duration" value={internDurationLabel(formData)} />}
                                <DetailItem label="Bank Name" value={formData.bankDetails?.bankName} />
                                <DetailItem label="Account Title" value={formData.bankDetails?.accountTitle} />
                                <DetailItem label="Account Number" value={formData.bankDetails?.accountNumber} />
                                <DetailItem label="IBAN" value={formData.bankDetails?.iban} />
                            </Grid>
                        )}
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Assigned Students ({assigned.length})</Typography></AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            In the staff app, this staff member sees and marks sessions only for these students.
                        </Typography>
                        {assignedDraft ? (
                            <>
                                <PeopleMultiSelect
                                    options={allStudents}
                                    value={assignedDraft}
                                    onChange={setAssignedDraft}
                                    label="Assigned students"
                                    subtitle={(st) => st.rollNum}
                                />
                                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                                    <Button onClick={() => setAssignedDraft(null)} disabled={busy}>Cancel</Button>
                                    <Button variant="contained" onClick={saveAssigned} disabled={busy}>{busy ? <CircularProgress size={20} color="inherit" /> : 'Save assigned students'}</Button>
                                </Stack>
                            </>
                        ) : (
                            <>
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    {assignedError ? <Alert severity="warning">{assignedError}</Alert> : assigned.length === 0 && <Typography color="text.secondary">No students assigned yet.</Typography>}
                                    {assigned.map((st) => (
                                        <Chip key={st._id} label={`${st.name}${st.rollNum ? ` (${st.rollNum})` : ''}`} variant="outlined"
                                            color={st.status === 'withdrawn' ? 'default' : 'primary'} onClick={() => navigate(`/Admin/students/student/${st._id}`)} />
                                    ))}
                                </Stack>
                                {can(currentUser, 'staff', 'edit') && <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setAssignedDraft(assigned.map((st) => String(st._id)))}>Manage assigned students</Button>}
                            </>
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

            {!isEditMode && can(currentUser, 'staff', 'delete') && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="error" onClick={startDelete}>Delete Staff Member</Button>
                </Box>
            )}
            <Popup open={popup.open} message={popup.message} success={popup.success} onClose={() => setPopup((p) => ({ ...p, open: false }))} />

            <OtpActionDialog
                open={!!otpAction}
                onClose={() => setOtpAction(null)}
                onSuccess={handleOtpSuccess}
                adminId={currentUser?._id}
                actionType={otpAction?.type}
                targetType="teacher"
                targetId={teacherID}
                targetName={teacherDetails?.name}
                payload={otpAction?.payload}
                impact={otpAction?.impact}
            />

            <Dialog open={!!lifecycle} onClose={() => !busy && setLifecycle(null)} fullWidth maxWidth="xs">
                <DialogTitle>{lifecycle?.action === 'withdraw' ? `Withdraw ${teacherDetails?.name}?` : `Reactivate ${teacherDetails?.name}?`}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {lifecycle?.action === 'withdraw'
                            ? 'They are signed out of the staff app and left out of attendance and dashboard totals. Salary, attendance and session history is kept, and they can be reactivated later.'
                            : 'They will be active again and can sign in to the staff app.'}
                    </DialogContentText>
                    {lifecycle?.action === 'withdraw' && (
                        <TextField fullWidth label="Reason (optional)" value={lifecycle.reason} inputProps={{ maxLength: 300 }}
                            onChange={(e) => setLifecycle((l) => ({ ...l, reason: e.target.value }))} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLifecycle(null)} disabled={busy}>Cancel</Button>
                    <Button variant="contained" color={lifecycle?.action === 'withdraw' ? 'warning' : 'success'} onClick={runLifecycle} disabled={busy}>
                        {busy ? <CircularProgress size={20} color="inherit" /> : (lifecycle?.action === 'withdraw' ? 'Withdraw' : 'Reactivate')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherDetails;