import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getClassDetails } from '../../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import {
    CircularProgress, Box, TextField, InputAdornment, Button, Typography, Paper, Grid, Avatar,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const AddTeacher = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    // Data from previous page
    const { designationID, designationTitle } = location.state || {};

    const classID = params.id === 'noclass' ? null : params.id;

    // Form input states
    const [fatherName, setFatherName] = useState('');
    const [occupation, setOccupation] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [education, setEducation] = useState('');
    const [salary, setSalary] = useState('');
    const [photo, setPhoto] = useState('');
    const [gender, setGender] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');
    const [cnic, setCnic] = useState('');

    // State for fetched data and UI control
    const [classDetails, setClassDetails] = useState(null);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [timing, setTiming] = useState('');
    const [timings, setTimings] = useState([]);
    const [timingLoader, setTimingLoader] = useState(true);
    
    // 1. ADD NEW STATE FOR THE TIME PICKER
    const [selectedTime, setSelectedTime] = useState('');

    const { currentUser } = useSelector(state => state.user);
    // Form validation states
    const [phoneError, setPhoneError] = useState('');
    const [emergencyError, setEmergencyError] = useState('');
    const [cnicError, setCnicError] = useState('');

    // Redux state
    const { status, response, error } = useSelector(state => state.user);

    // Effect to fetch Timings
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

    // Effect to fetch Class Details (only if a real classID was passed)
    useEffect(() => {
        if (classID) {
            const fetchClassDetails = async () => {
                try {
                    const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${classID}`);
                    if (result.data) {
                        setClassDetails(result.data);
                        dispatch(getClassDetails(result.data));
                    }
                } catch (err) {
                    setMessage("Error: Could not load class details. " + err.message);
                    setIsSuccess(false);
                    setShowPopup(true);
                }
            };
            fetchClassDetails();
        }
    }, [classID, dispatch]);

    useEffect(() => {
        if (status === 'succeeded') {
            setMessage(response.message);
            setIsSuccess(true);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage(response || error || "An error occurred. Please try again.");
            setIsSuccess(false);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, response, error]);

    // Handlers for image, phone, emergency contact, and CNIC
    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
        try {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result);
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error("Error during image compression: ", error);
            setMessage("Failed to compress image.");
            setIsSuccess(false);
            setShowPopup(true);
        }
    };
    const handlePhoneChange = (event) => {
        const newPhone = event.target.value;
        if (newPhone.length <= 11) setPhone(newPhone);
        setPhoneError(newPhone && !newPhone.startsWith('03') ? 'Phone number must start with "03"' : '');
    };
    const handleEmergencyChange = (event) => {
        const newEmergency = event.target.value;
        if (newEmergency.length <= 11) setEmergencyContact(newEmergency);
        setEmergencyError(newEmergency && !newEmergency.startsWith('03') ? 'Emergency contact must start with "03"' : '');
    };
    const handleCnicChange = (event) => {
        const numericValue = event.target.value.replace(/[^\d]/g, '');
        if (numericValue.length > 13) return;
        let formattedCnic = numericValue;
        if (numericValue.length > 5) formattedCnic = `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
        if (numericValue.length > 12) formattedCnic = `${numericValue.slice(0, 5)}-${numericValue.slice(5, 12)}-${numericValue.slice(12)}`;
        setCnic(formattedCnic);
        setCnicError(numericValue.length > 0 && numericValue.length < 13 ? "CNIC must be 13 digits long." : "");
    };

    const isFormValid = () => {
        const cnicDigits = cnic.replace(/[^\d]/g, '');
        return (
            !phoneError && !emergencyError && !cnicError &&
            phone.length === 11 && emergencyContact.length === 11 && cnicDigits.length === 13 &&
            photo && gender && maritalStatus && designationID &&
            education && fatherName && occupation && timing &&
            selectedTime
        );
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        const fields = {
            name, email, phone, address, emergencyContact, education, salary,
            photo, gender, maritalStatus, cnic, fatherName, occupation, timing,
            designation: designationID,
            role: designationTitle,
            school: currentUser?._id,
            teachSclass: classID ?? "68b7dbc567099ec00b0cd82e",
            teacherDateTime: selectedTime,
        };
        dispatch(registerUser(fields, "Teacher"));
    };

    const handlePopupConfirm = () => {
        setShowPopup(false);
        dispatch(underControl());
        if (isSuccess) {
            navigate("/Admin/teachers");
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="left" gutterBottom>Add New Staff Member</Typography>
                <Box sx={{ mb: 2, textAlign: 'left' }}>
                    <Typography variant="h6">
                        {classID ? (
                            <>Class: <Box component="span" sx={{ fontWeight: 'bold' }}>{classDetails?.sclassName}</Box></>
                        ) : (
                            <>Designation: <Box component="span" sx={{ fontWeight: 'bold' }}>{designationTitle}</Box></>
                        )}
                    </Typography>
                </Box>
                <form onSubmit={submitHandler}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                <Avatar src={photo} sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}>
                                    {!photo && <AccountCircleIcon sx={{ fontSize: '5rem' }} />}
                                </Avatar>
                                <input accept="image/*" style={{ display: 'none' }} id="upload-photo-input" type="file" onChange={handleImageChange} required />
                                <label htmlFor="upload-photo-input">
                                    <Button variant="contained" component="span">Upload Photo*</Button>
                                </label>
                                {!photo && <Typography color="error" variant="caption" mt={1}>Photo is required</Typography>}
                            </Box>
                            
                            {/* Form fields */}
                            <FormControl fullWidth required sx={{ mb: 2 }}>
                                <InputLabel>Timing</InputLabel>
                                <Select label="Timing" value={timing} onChange={(e) => setTiming(e.target.value)} disabled={timingLoader}>
                                    {timingLoader ? (
                                        <MenuItem disabled value=""><em>Loading...</em></MenuItem>
                                    ) : (
                                        timings.map((t) => (
                                            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            
                            {/* 2. ADD THE TIME PICKER TEXTFIELD */}
                            <TextField
                                label="Select Time"
                                type="time"
                                fullWidth
                                required
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                sx={{ mb: 2 }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField label="Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
                            <TextField label="Father's Name" fullWidth required value={fatherName} onChange={(e) => setFatherName(e.target.value)} sx={{ mb: 2 }} />
                            <TextField label="Father's Occupation" fullWidth required value={occupation} onChange={(e) => setOccupation(e.target.value)} sx={{ mb: 2 }} />
                            <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
                            <FormControl fullWidth required sx={{ mb: 2 }}>
                                <InputLabel>Gender</InputLabel>
                                <Select label="Gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth required sx={{ mb: 2 }}>
                                <InputLabel>Marital Status</InputLabel>
                                <Select label="Marital Status" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                                    <MenuItem value="Single">Single</MenuItem>
                                    <MenuItem value="Married">Married</MenuItem>
                                    <MenuItem value="Widow">Widow</MenuItem>
                                    <MenuItem value="Divorced">Divorced</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="CNIC" placeholder="XXXXX-XXXXXXX-X" type="tel" fullWidth required value={cnic} onChange={handleCnicChange} sx={{ mb: 2 }} inputProps={{ maxLength: 15 }} error={!!cnicError} helperText={cnicError} />
                            <TextField label="Phone#" type="tel" fullWidth required value={phone} onChange={handlePhoneChange} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} error={!!phoneError} helperText={phoneError} />
                            <TextField label="Emergency Contact#" type="tel" fullWidth required value={emergencyContact} onChange={handleEmergencyChange} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} error={!!emergencyError} helperText={emergencyError} />
                            <TextField label="Address" fullWidth required value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mb: 2 }} />
                            <TextField label="Education" fullWidth required value={education} onChange={(e) => setEducation(e.target.value)} sx={{ mb: 2 }} />
                            <TextField label="Salary" type="number" fullWidth required value={salary} onChange={(e) => setSalary(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">Rs:</InputAdornment>, endAdornment: <InputAdornment position="end">PKR</InputAdornment> }} />
                            
                            <Button type="submit" variant="contained" color="primary" fullWidth disabled={!isFormValid() || loader}>
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Staff Member'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {showPopup && (
                <div className="custom-popup-overlay" style={popupOverlayStyle}>
                    <div className="custom-popup" style={popupStyle}>
                        <h2 style={{ color: isSuccess ? 'green' : 'red' }}>{isSuccess ? "Success!" : "Error"}</h2>
                        <p>{message}</p>
                        <Button variant="contained" onClick={isSuccess ? handlePopupConfirm : () => setShowPopup(false)}>
                            {isSuccess ? "Done" : "Close"}
                        </Button>
                    </div>
                </div>
            )}
        </Box>
    );
};

// Basic styles for the popup (can be moved to a CSS file)
const popupOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1300,
};

const popupStyle = {
    background: 'white',
    padding: '20px 40px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    minWidth: '300px',
    maxWidth: '500px',
};

export default AddTeacher;