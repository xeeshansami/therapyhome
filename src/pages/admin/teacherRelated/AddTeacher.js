import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassDetails } from '../../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, Box, TextField, InputAdornment, Button, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';

const AddTeacher = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const classID = params.id;

    // Form input states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [education, setEducation] = useState('');
    const [salary, setSalary] = useState('');
    const [password, setPassword] = useState('');

    // State for fetched data and UI control
    const [classDetails, setClassDetails] = useState(null);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Form validation states
    const [phoneError, setPhoneError] = useState('');
    const [emergencyError, setEmergencyError] = useState('');

    // Redux state
    const { status, response, error } = useSelector(state => state.user);

    // --- 1. useEffect for LOADING INITIAL DATA ---
    // This hook runs only when the page loads to get class details.
    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${classID}`);
                debugger
                if (result.data) {
                    setClassDetails(result.data);
                    dispatch(getClassDetails(result.data));
                }
            } catch (err) {
                // Only show a popup if there's an error FETCHING the initial data
                setMessage("Error: Could not load class details. " + err.message);
                setIsSuccess(false);
                setShowPopup(true);
            }
        };
        fetchClassDetails();
    }, [classID, dispatch]);

    // --- 2. useEffect for HANDLING FORM SUBMISSION RESULT ---
    // This hook listens for the Redux status and shows a popup AFTER submitting.
    useEffect(() => {
        debugger
        if (classDetails) {
            setMessage("Teacher has been added successfully!");
            setIsSuccess(true);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'failed') {
            setMessage(response);
            setIsSuccess(false);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error. Please try again.");
            setIsSuccess(false);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, response, error]);

    const handlePhoneChange = (event) => {
        const newPhone = event.target.value;
        if (newPhone.length <= 11) {
            setPhone(newPhone);
        }
        if (newPhone && !newPhone.startsWith('03')) {
            setPhoneError('Phone number must start with "03"');
        } else {
            setPhoneError('');
        }
    };

    const handleEmergencyChange = (event) => {
        const newEmergency = event.target.value;
        if (newEmergency.length <= 11) {
            setEmergencyContact(newEmergency);
        }
        if (newEmergency && !newEmergency.startsWith('03')) {
            setEmergencyError('Emergency contact must start with "03"');
        } else {
            setEmergencyError('');
        }
    };

    const isFormValid = () => {
        return !phoneError && !emergencyError && phone.length === 11 && emergencyContact.length === 11;
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);

        // --- 3. Construct the 'fields' object right before dispatching ---
        // This ensures it has the latest data from classDetails.
        const fields = {
            name, email, password, phone, address, emergencyContact, education, salary, 
            role: "Teacher",
            school: classDetails?.school,
            teachSclass: classDetails?._id, 
        };

        dispatch(registerUser(fields, "Teacher"));
    };

    const handlePopupConfirm = () => {
        setShowPopup(false);
        // Reset Redux status AFTER handling the popup
        dispatch(underControl());
        if (isSuccess) {
            navigate("/Admin/teachers");
        }
    };

    return (
        <>
            <Box sx={{ padding: 4 }}>
                <Paper elevation={3} sx={{ padding: 4 }}>
                    <Typography variant="h4" align="left" gutterBottom>Add Teacher</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{ marginBottom: 2, textAlign: 'left' }}>
                                <Typography variant="h6">
                                    Class: <Box component="span" sx={{ fontWeight: 'bold' }}>{classDetails?.sclassName}</Box>
                                </Typography>
                            </Box>
                            <form className="registerForm" onSubmit={submitHandler}>
                                {/* All your TextField components remain the same */}
                                <TextField label="Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
                                <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
                                <TextField label="Phone#" type="tel" fullWidth required value={phone} onChange={handlePhoneChange} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} error={!!phoneError} helperText={phoneError} />
                                <TextField label="Emergency Contact#" type="tel" fullWidth required value={emergencyContact} onChange={handleEmergencyChange} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} error={!!emergencyError} helperText={emergencyError} />
                                <TextField label="Address" fullWidth required value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mb: 2 }} />
                                <TextField label="Education" fullWidth required value={education} onChange={(e) => setEducation(e.target.value)} sx={{ mb: 2 }} />
                                <TextField label="Salary" type="number" fullWidth required value={salary} onChange={(e) => setSalary(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">Rs:</InputAdornment>, endAdornment: <InputAdornment position="end">PKR</InputAdornment> }} />
                                <TextField label="Password" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
                                
                                <Button className="registerButton" type="submit" disabled={!isFormValid() || loader} variant="contained" color="primary" fullWidth>
                                    {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Teacher'}
                                </Button>
                            </form>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
            {showPopup && (
                <div style={popupOverlayStyle}>
                    <div style={popupStyle}>
                        <h2 style={{ color: isSuccess ? 'green' : 'red' }}>{isSuccess ? "Success!" : "Error"}</h2>
                        <p>{message}</p>
                        <Button variant="contained" onClick={handlePopupConfirm}>
                            {isSuccess ? "OK" : "Close"}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

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