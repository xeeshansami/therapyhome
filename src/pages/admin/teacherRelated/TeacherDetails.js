import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import {
    Box, Button, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, TextField,
    FormControl, Select, MenuItem, Avatar, InputLabel,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Popup from '../../../components/Popup';
import axios from 'axios';

// Helper components remain unchanged...
const DetailItem = ({ label, value }) => (<Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography><Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography></Grid>);
const EditableDetailItem = ({ label, value, isEditMode, onChange, name, type = 'text' }) => (<Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>{isEditMode ? (<TextField fullWidth variant="outlined" size="small" value={value} onChange={onChange} name={name} type={type} />) : (<Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography>)}</Grid>);

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
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({});

    // --- State for Timings ---
    const [timings, setTimings] = useState([]);
    const [timingLoader, setTimingLoader] = useState(true);
    // ✅ NEW: State to hold the full timing object for display purposes.
    const [timingDetails, setTimingDetails] = useState(null);

    // --- State for Multi-Step Confirmation Dialog ---
    const [openDialog, setOpenDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const [dialogStep, setDialogStep] = useState('password');
    const [dialogLoader, setDialogLoader] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogError, setDialogError] = useState("");

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

    // ✅ UPDATED: This effect now populates the form AND finds the full timing object for display.
    useEffect(() => {
        if (teacherDetails && timings.length > 0) {
            // This handles if teacherDetails.timing is an object or just an ID string
            const timingId = teacherDetails.timing?._id || teacherDetails.timing;

            // Find the full timing object from the timings list
            const currentTimingObject = timings.find(t => t._id === timingId);
            setTimingDetails(currentTimingObject);

            setFormData({
                name: teacherDetails.name || '',
                email: teacherDetails.email || '',
                phone: teacherDetails.phone || '',
                address: teacherDetails.address || '',
                emergencyContact: teacherDetails.emergencyContact || '',
                salary: teacherDetails.salary || '',
                gender: teacherDetails.gender || '',
                maritalStatus: teacherDetails.maritalStatus || '',
                cnic: teacherDetails.cnic || '',
                education: teacherDetails.education || '',
                fatherName: teacherDetails.fatherName || '',
                occupation: teacherDetails.occupation || '',
                timing: timingId || '', // Ensure the ID is stored in formData for the dropdown
            });
        }
    }, [teacherDetails, timings]); // Reruns when either teacher details or the timings list is ready

    // --- SECTION: Event Handlers ---
    const handleInputChange = (event) => setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));

    const handleCancel = () => {
        setIsEditMode(false);
        if (teacherDetails) {
            const timingId = teacherDetails.timing?._id || teacherDetails.timing;
            setFormData({
                name: teacherDetails.name || '',
                email: teacherDetails.email || '',
                phone: teacherDetails.phone || '',
                address: teacherDetails.address || '',
                emergencyContact: teacherDetails.emergencyContact || '',
                salary: teacherDetails.salary || '',
                gender: teacherDetails.gender || '',
                maritalStatus: teacherDetails.maritalStatus || '',
                cnic: teacherDetails.cnic || '',
                education: teacherDetails.education || '',
                fatherName: teacherDetails.fatherName || '',
                occupation: teacherDetails.occupation || '',
                timing: timingId || '',
            });
        }
    };

    // --- SECTION: Dialog and Action Logic (Unchanged) ---
    const handleOpenDialog = (action) => {
        setActionToConfirm(action);
        setDialogStep('password');
        setDialogMessage("");
        setDialogError("");
        setPassword('');
        setOtp('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => setOpenDialog(false);

    const handlePasswordConfirm = async () => {
        setDialogLoader(true);
        setDialogError("");
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/verify-password-send-otp`, {
                adminId: currentUser._id,
                password: password,
            });
            setDialogMessage(`OTP sent to ${currentUser.email}. Please check your email.`);
            setDialogStep('otp');
        } catch (error) {
            setDialogError(error.response?.data?.message || "Password verification failed.");
        } finally {
            setDialogLoader(false);
        }
    };

    const handleOtpConfirm = async () => {
        setDialogLoader(true);
        setDialogError("");
        try {
            const actionPayload = {
                type: actionToConfirm,
                targetId: teacherID,
                payload: actionToConfirm === 'update' ? formData : null,
            };
            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/verify-otp-execute-action`, {
                adminId: currentUser._id,
                otp: otp,
                action: actionPayload,
                actiontype: "teacher",
            });

            setMessage(result.data.message);
            setShowPopup(true);
            handleCloseDialog();

            if (actionToConfirm === 'delete') {
                navigate('/Admin/teachers');
            } else {
                setIsEditMode(false);
                dispatch(getTeacherDetails(teacherID));
            }

        } catch (error) {
            setDialogError(error.response?.data?.message || "OTP verification failed.");
        } finally {
            setDialogLoader(false);
        }
    };

    if (loading && !teacherDetails) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

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

            <form onSubmit={(e) => { e.preventDefault(); handleOpenDialog('update'); }}>
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
                                                    <MenuItem key={t._id} value={t._id}>{t.name} ({t.startTime} - {t.endTime})</MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    // ✅ UPDATED: Display timing details from the resolved state object.
                                    <Typography variant="body1" gutterBottom>
                                        {timingDetails ? `${timingDetails.name} (${timingDetails.startTime} - ${timingDetails.endTime})` : "N/A"}
                                    </Typography>
                                )}
                            </Grid>
                            
                            <DetailItem label="Assigned Class" value={teacherDetails?.teachSclass?.sclassName} />
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {isEditMode && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">Update Details</Button>
                    </Box>
                )}
            </form>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="error" onClick={() => handleOpenDialog('delete')}>Delete Teacher</Button>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    {dialogStep === 'password' && (
                        <>
                            <DialogContentText>To proceed, please enter your admin password for verification.</DialogContentText>
                            <TextField autoFocus margin="dense" id="password" label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} error={!!dialogError} helperText={dialogError} onKeyPress={(e) => e.key === 'Enter' && handlePasswordConfirm()} />
                        </>
                    )}
                    {dialogStep === 'otp' && (
                        <>
                            <DialogContentText sx={{ color: 'green', mb: 2 }}>{dialogMessage}</DialogContentText>
                            <DialogContentText>Enter the OTP you received in your email.</DialogContentText>
                            <TextField autoFocus margin="dense" id="otp" label="Enter OTP" type="text" fullWidth value={otp} onChange={(e) => setOtp(e.target.value)} error={!!dialogError} helperText={dialogError} onKeyPress={(e) => e.key === 'Enter' && handleOtpConfirm()} />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
                    {dialogStep === 'password' && (
                        <Button onClick={handlePasswordConfirm} color="primary" disabled={dialogLoader}>
                            {dialogLoader ? <CircularProgress size={24} /> : 'Verify & Send OTP'}
                        </Button>
                    )}
                    {dialogStep === 'otp' && (
                        <Button onClick={handleOtpConfirm} color="primary" disabled={dialogLoader}>
                            {dialogLoader ? <CircularProgress size={24} /> : 'Verify & Confirm Action'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherDetails;
