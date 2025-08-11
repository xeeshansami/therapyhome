import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import {
    Box, Button, Card, CardContent, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, Chip, TextField, Stack,
    FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Popup from '../../../components/Popup';
import axios from 'axios';

// Helper components
const DetailItem = ({ label, value }) => ( <Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography><Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography></Grid> );
const EditableDetailItem = ({ label, value, isEditMode, onChange, name, type = 'text' }) => ( <Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>{isEditMode ? ( <TextField fullWidth variant="outlined" size="small" value={value} onChange={onChange} name={name} type={type} InputLabelProps={type === 'date' ? { shrink: true } : undefined} /> ) : ( <Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography> )}</Grid> );

const ViewStudent = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, loading, error } = useSelector((state) => state.user);
    const { currentUser } = useSelector((state) => state.user); // Get logged-in admin
    const studentID = params.id;

    // --- SECTION: UI & Form State ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({});

    // --- SECTION: State for Asynchronous Class Data ---
    const [classDetails, setClassDetails] = useState([]);
    const [classDetailsLoading, setClassDetailsLoading] = useState(false);
    const [classDetailsError, setClassDetailsError] = useState(null);

    // --- NEW: State for Multi-Step Confirmation Dialog ---
    const [openDialog, setOpenDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [actionToConfirm, setActionToConfirm] = useState(null); // 'update' or 'delete'
    const [dialogStep, setDialogStep] = useState('password'); // 'password', 'otp'
    const [dialogLoader, setDialogLoader] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogError, setDialogError] = useState("");

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const toInputDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';

    // --- SECTION: Data Fetching Effects ---
    useEffect(() => {
        dispatch(getUserDetails(studentID, "Student"));
    }, [dispatch, studentID]);

    useEffect(() => {
        if (userDetails) {
            setFormData({
                name: userDetails.name || '',
                rollNum: userDetails.rollNum || '',
                gender: userDetails.gender || '',
                age: userDetails.age || '',
                dob: userDetails.dob ? toInputDate(userDetails.dob) : '', // <-- FIXED
                reference: userDetails.reference || '',
                parentName: userDetails.parentName || '',
                parentContact: userDetails.parentContact || '',
                parentCNIC: userDetails.parentCNIC || '',
                parentProfession: userDetails.parentProfession || '',
                parentAddress: userDetails.parentAddress || '',
                parentGender: userDetails.parentGender || '',
                parentMaritalStatus: userDetails.parentMaritalStatus || '',
                days: userDetails.days || [],
            });

            if (userDetails.className && userDetails.className.length > 0) {
                const fetchAllClassDetails = async () => {
                    setClassDetailsLoading(true);
                    const classIDs = userDetails.className.map(c => c.$oid || c);
                    const promises = classIDs.map(id => axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${id}`));
                    try {
                        const results = await Promise.all(promises);
                        setClassDetails(results.map(result => result.data));
                    } catch (err) {
                        setClassDetailsError("Could not load class details.");
                    } finally {
                        setClassDetailsLoading(false);
                    }
                };
                fetchAllClassDetails();
            }
        }
    }, [userDetails]);

    // --- SECTION: Event Handlers ---
    const handleInputChange = (event) => setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    const handleDayChange = (event) => {
        const { name, checked } = event.target;
        setFormData(prev => ({ ...prev, days: checked ? [...prev.days, name] : prev.days.filter(day => day !== name) }));
    };
    const handleCancel = () => { setIsEditMode(false); /* Reset form data... */ };

    // --- SECTION: Dialog and Action Logic ---
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
                targetId: studentID,
                payload: actionToConfirm === 'update' ? formData : null,
            };
            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/verify-otp-execute-action`, {
                adminId: currentUser._id,
                otp: otp,
                action: actionPayload,
                actiontype: "student",
            });

            setMessage(result.data.message);
            setShowPopup(true);
            handleCloseDialog();

            if (actionToConfirm === 'delete') {
                navigate('/Admin/students');
            } else {
                setIsEditMode(false);
                dispatch(getUserDetails(studentID, "Student"));
            }
        } catch (error) {
            setDialogError(error.response?.data?.message || "OTP verification failed.");
        } finally {
            setDialogLoader(false);
        }
    };

    if (loading && !userDetails) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>Error loading student details.</Typography>;
    
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h4" gutterBottom>{userDetails?.name || 'Student Details'}</Typography>
                    <Typography variant="h6" color="text.secondary">Roll No: {userDetails?.rollNum}</Typography>
                </div>
                {!isEditMode && <Button variant="contained" onClick={() => setIsEditMode(true)}>Edit Details</Button>}
            </Paper>

            <form onSubmit={(e) => { e.preventDefault(); handleOpenDialog('update'); }}>
                {/* Accordions for student details */}
                <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Student Profile</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><EditableDetailItem label="Name" name="name" value={formData.name || ''} isEditMode={isEditMode} onChange={handleInputChange} /><DetailItem label="Roll Number" value={userDetails?.rollNum} /><Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Gender</Typography>{isEditMode ? (<FormControl fullWidth size="small"><Select name="gender" value={formData.gender || ''} onChange={handleInputChange}><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl>) : (<Typography variant="body1" gutterBottom>{formData.gender || "N/A"}</Typography>)}</Grid><EditableDetailItem label="Age" name="age" value={formData.age || ''} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Date of Birth" name="dob" value={formData.dob || ''} isEditMode={isEditMode} onChange={handleInputChange} type="date" /><EditableDetailItem label="Reference" name="reference" value={formData.reference || ''} isEditMode={isEditMode} onChange={handleInputChange} /></Grid></AccordionDetails></Accordion>
                <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Parent & Contact Information</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><EditableDetailItem label="Parent's Name" name="parentName" value={formData.parentName || ''} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Parent's Contact" name="parentContact" value={formData.parentContact || ''} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Parent's CNIC" name="parentCNIC" value={formData.parentCNIC || ''} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Parent's Profession" name="parentProfession" value={formData.parentProfession || ''} isEditMode={isEditMode} onChange={handleInputChange} /><EditableDetailItem label="Home Address" name="parentAddress" value={formData.parentAddress || ''} isEditMode={isEditMode} onChange={handleInputChange} /><Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Parent's Gender</Typography>{isEditMode ? (<FormControl fullWidth size="small"><Select name="parentGender" value={formData.parentGender || ''} onChange={handleInputChange}><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl>) : (<Typography variant="body1" gutterBottom>{formData.parentGender || "N/A"}</Typography>)}</Grid><Grid item xs={12} sm={6} sx={{ mb: 2 }}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Marital Status</Typography>{isEditMode ? (<FormControl fullWidth size="small"><Select name="parentMaritalStatus" value={formData.parentMaritalStatus || ''} onChange={handleInputChange}><MenuItem value="Single">Single</MenuItem><MenuItem value="Married">Married</MenuItem><MenuItem value="Widow">Widow</MenuItem><MenuItem value="Divorced">Divorced</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl>) : (<Typography variant="body1" gutterBottom>{formData.parentMaritalStatus || "N/A"}</Typography>)}</Grid></Grid></AccordionDetails></Accordion>
                <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Enrolled Courses & Schedule</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><DetailItem label="Consultancy Date" value={userDetails?.consultancyDate} /><Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Scheduled Days</Typography>{isEditMode ? (<FormGroup row>{weekdays.map(day => (<FormControlLabel key={day} control={<Checkbox checked={formData.days?.includes(day) || false} onChange={handleDayChange} name={day} />} label={day} />))}</FormGroup>) : (<Typography variant="body1" gutterBottom>{userDetails?.days?.join(', ') || "N/A"}</Typography>)}</Grid></Grid><Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Class Details:</Typography>{classDetailsLoading ? <CircularProgress /> : classDetailsError ? <Typography color="error">{classDetailsError}</Typography> : (<Grid container spacing={2}>{classDetails.map((sClass) => (<Grid item xs={12} md={6} key={sClass._id}><Card variant="outlined"><CardContent><Typography variant="h6">{sClass.sclassName}</Typography><DetailItem label="Timing" value={`${sClass.timingSlot} (${sClass.timingType})`} /><DetailItem label="Fee" value={`Rs. ${sClass.sclassFee}`} /></CardContent></Card></Grid>))}</Grid>)}</AccordionDetails></Accordion>
                {/* Other accordions... */}

                {isEditMode && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={dialogLoader}>
                            {dialogLoader ? <CircularProgress size={24} color="inherit" /> : 'Update Details'}
                        </Button>
                    </Box>
                )}
            </form>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="error" onClick={() => handleOpenDialog('delete')}>
                    Delete Student
                </Button>
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

export default ViewStudent;
