import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import {
    Box, Button, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, TextField,
    FormControl, Select, MenuItem, Avatar, InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Popup from '../../../components/Popup';
import OtpActionDialog from '../../../components/OtpActionDialog';
import axios from 'axios';

// Shows "N/A" for null/undefined/empty instead of the literal text "undefined".
const show = (value) => (value === null || value === undefined || value === '' ? 'N/A' : String(value));

const DetailItem = ({ label, value }) => (<Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography><Typography variant="body1" gutterBottom>{show(value)}</Typography></Grid>);
const EditableDetailItem = ({ label, value, isEditMode, onChange, name, type = 'text' }) => (<Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>{isEditMode ? (<TextField fullWidth variant="outlined" size="small" value={value} onChange={onChange} name={name} type={type} InputLabelProps={type === 'time' ? { shrink: true } : {}} />) : (<Typography variant="body1" gutterBottom>{show(value)}</Typography>)}</Grid>);

// The single source for the editable form, used on load and on Cancel.
const buildForm = (t) => ({
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
});

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

    // --- State for Timings ---
    const [timings, setTimings] = useState([]);
    const [timingLoader, setTimingLoader] = useState(true);

    // --- OTP-verified update/delete ---
    const [otpAction, setOtpAction] = useState(null); // { type, payload }

    // teacherDetails is shared redux state; only trust it once it is this staff member.
    const isLoaded = !!teacherDetails && teacherDetails._id === teacherID;

    // --- SECTION: Data Fetching & Form Initialization ---
    useEffect(() => { dispatch(getTeacherDetails(teacherID)); }, [dispatch, teacherID]);

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
            setFormData(buildForm(teacherDetails));
            setIsEditMode(false);
        }
    }, [isLoaded, teacherDetails]);

    const timingDetails = useMemo(() => {
        const id = teacherDetails?.timing?._id || teacherDetails?.timing;
        return timings.find(t => t._id === id) || null;
    }, [teacherDetails, timings]);

    // --- SECTION: Event Handlers ---
    const handleInputChange = (event) => setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));

    const handleCancel = () => {
        // Discard unsaved edits and go back to the saved values.
        setIsEditMode(false);
        if (isLoaded) setFormData(buildForm(teacherDetails));
    };

    // Only changed fields are sent, so untouched values are never rewritten.
    const handleUpdateClick = () => {
        const original = buildForm(teacherDetails);
        const changes = {};
        Object.keys(formData).forEach((k) => {
            if (String(formData[k] ?? '') !== String(original[k] ?? '')) changes[k] = formData[k];
        });
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
                        <Typography variant="h6" color="text.secondary">{teacherDetails?.role}</Typography>
                    </div>
                </Box>
                {!isEditMode && (
                    <Button variant="contained" onClick={() => setIsEditMode(true)}>Edit Details</Button>
                )}
            </Paper>

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
                            <EditableDetailItem label="Salary" name="salary" value={formData.salary || ''} isEditMode={isEditMode} onChange={handleInputChange} type="number" />
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
                            
                            {/* ✅ 3. ADD THE NEW EDITABLE ITEM FOR teacherDateTime */}
                            <EditableDetailItem
                                label="Specific Time"
                                name="teacherDateTime"
                                value={formData.teacherDateTime || ''}
                                isEditMode={isEditMode}
                                onChange={handleInputChange}
                                type="time"
                            />

                            <DetailItem label="Assigned Class" value={teacherDetails?.teachSclass?.sclassName} />
                        </Grid>
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
                    <Button variant="contained" color="error" onClick={() => setOtpAction({ type: 'delete', payload: null })}>Delete Teacher</Button>
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
            />
        </Container>
    );
};

export default TeacherDetails;