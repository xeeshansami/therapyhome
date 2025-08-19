import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const classID = params.id;

    // State for new Designation field
    const [designation, setDesignation] = useState('');
    const [designations, setDesignations] = useState([]);
    const [designationLoader, setDesignationLoader] = useState(true);

    // Form input states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [education, setEducation] = useState('');
    const [salary, setSalary] = useState('');
    // const [password, setPassword] = useState(''); // --- 1. Removed password state ---
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

    // Form validation states
    const [phoneError, setPhoneError] = useState('');
    const [emergencyError, setEmergencyError] = useState('');
    const [cnicError, setCnicError] = useState('');

    // Redux state
    const { status, response, error } = useSelector(state => state.user);

    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/designations`);
                if (result.data) {
                    setDesignations(result.data);
                }
            } catch (err) {
                setMessage("Error: Could not load designations. " + err.message);
                setIsSuccess(false);
                setShowPopup(true);
            } finally {
                setDesignationLoader(false);
            }
        };
        fetchDesignations();
    }, []);

    useEffect(() => {
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
    }, [classID, dispatch]);

    // --- 2. Fixed useEffect logic to prevent popup on load ---
    useEffect(() => {
        // This effect now only runs when the 'status' changes to success or error after a submission
        if (status === 'succeeded') {
            setMessage(response || "Teacher has been added successfully!");
            setIsSuccess(true);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage(response || error || "An error occurred. Please try again.");
            setIsSuccess(false);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, response, error, navigate]);


    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error("Error during image compression: ", error);
            setMessage("Failed to compress image. Please try another file.");
            setIsSuccess(false);
            setShowPopup(true);
        }
    };

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

    const handleCnicChange = (event) => {
        const value = event.target.value;
        const numericValue = value.replace(/[^\d]/g, '');

        if (numericValue.length > 13) {
            return;
        }

        let formattedCnic = numericValue;
        if (numericValue.length > 5) {
            formattedCnic = `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
        }
        if (numericValue.length > 12) {
            formattedCnic = `${numericValue.slice(0, 5)}-${numericValue.slice(5, 12)}-${numericValue.slice(12)}`;
        }

        setCnic(formattedCnic);

        if (numericValue.length > 0 && numericValue.length < 13) {
            setCnicError("CNIC must be 13 digits long.");
        } else {
            setCnicError("");
        }
    };

    const isFormValid = () => {
        const cnicDigits = cnic.replace(/[^\d]/g, '');
        return (
            !phoneError &&
            !emergencyError &&
            !cnicError &&
            phone.length === 11 &&
            emergencyContact.length === 11 &&
            cnicDigits.length === 13 &&
            photo && gender && maritalStatus && designation
        );
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);

        const fields = {
            name, email, phone, address, emergencyContact, education, salary, // Removed password
            photo,
            gender,
            maritalStatus,
            cnic,
            designation,
            role: "Teacher",
            school: classDetails?.school,
            teachSclass: classDetails?._id,
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                    <Avatar
                                        src={photo}
                                        sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}
                                    >
                                        {!photo && <AccountCircleIcon sx={{ fontSize: '5rem' }} />}
                                    </Avatar>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="upload-photo-input"
                                        type="file"
                                        onChange={handleImageChange}
                                        required
                                    />
                                    <label htmlFor="upload-photo-input">
                                        <Button variant="contained" component="span">
                                            Upload Photo*
                                        </Button>
                                    </label>
                                    {!photo && <Typography color="error" variant="caption" mt={1}>Photo is required</Typography>}
                                </Box>

                                <FormControl fullWidth required sx={{ mb: 2 }}>
                                    <InputLabel id="designation-select-label">Designation</InputLabel>
                                    <Select
                                        labelId="designation-select-label"
                                        value={designation}
                                        label="Designation"
                                        onChange={(e) => setDesignation(e.target.value)}
                                        disabled={designationLoader}
                                    >
                                        {designationLoader ? (
                                            <MenuItem disabled value=""><em>Loading...</em></MenuItem>
                                        ) : (
                                            designations.map((des) => (
                                                <MenuItem key={des._id} value={des._id}>
                                                    {des.title}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                                
                                <TextField label="Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
                                <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />

                                <FormControl fullWidth required sx={{ mb: 2 }}>
                                    <InputLabel id="gender-select-label">Gender</InputLabel>
                                    <Select
                                        labelId="gender-select-label"
                                        value={gender}
                                        label="Gender"
                                        onChange={(e) => setGender(e.target.value)}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                
                                <FormControl fullWidth required sx={{ mb: 2 }}>
                                    <InputLabel id="marital-status-select-label">Marital Status</InputLabel>
                                    <Select
                                        labelId="marital-status-select-label"
                                        value={maritalStatus}
                                        label="Marital Status"
                                        onChange={(e) => setMaritalStatus(e.target.value)}
                                    >
                                        <MenuItem value="Single">Single</MenuItem>
                                        <MenuItem value="Married">Married</MenuItem>
                                        <MenuItem value="Widow">Widow</MenuItem>
                                        <MenuItem value="Divorced">Divorced</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                
                                <TextField
                                    label="CNIC"
                                    placeholder="XXXXX-XXXXXXX-X"
                                    type="tel"
                                    fullWidth
                                    required
                                    value={cnic}
                                    onChange={handleCnicChange}
                                    sx={{ mb: 2 }}
                                    inputProps={{ maxLength: 15 }}
                                    error={!!cnicError}
                                    helperText={cnicError}
                                />
                                
                                <TextField label="Phone#" type="tel" fullWidth required value={phone} onChange={handlePhoneChange} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} error={!!phoneError} helperText={phoneError} />
                                <TextField label="Emergency Contact#" type="tel" fullWidth required value={emergencyContact} onChange={handleEmergencyChange} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} error={!!emergencyError} helperText={emergencyError} />
                                <TextField label="Address" fullWidth required value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mb: 2 }} />
                                <TextField label="Education" fullWidth required value={education} onChange={(e) => setEducation(e.target.value)} sx={{ mb: 2 }} />
                                <TextField label="Salary" type="number" fullWidth required value={salary} onChange={(e) => setSalary(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">Rs:</InputAdornment>, endAdornment: <InputAdornment position="end">PKR</InputAdornment> }} />
                                
                                {/* --- 3. Removed password TextField from the form --- */}
                                {/* <TextField label="Password" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} /> */}

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
};

const popupOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1300,
};
const popupStyle = {
    background: 'white', padding: '20px 40px', borderRadius: '8px',
    textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    minWidth: '300px', maxWidth: '500px',
};


export default AddTeacher;