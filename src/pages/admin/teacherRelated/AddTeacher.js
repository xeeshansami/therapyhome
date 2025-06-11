import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, Box, TextField, InputAdornment, Button, Typography, Paper, Grid } from '@mui/material';

const AddTeacher = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const subjectID = params.id;

    const { status, response, error } = useSelector(state => state.user);
    const { subjectDetails } = useSelector((state) => state.sclass);

    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
    }, [dispatch, subjectID]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [education, setEducation] = useState('');
    const [salary, setSalary] = useState('');
    const [password, setPassword] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const [phoneError, setPhoneError] = useState('');
    const [emergencyError, setEmergencyError] = useState('');

    const role = "Teacher";
    const school = subjectDetails?.school;
    const teachSubject = subjectDetails?._id;
    const teachSclass = subjectDetails?.sclassName?._id;

    const fields = { name, email, password, phone, address, emergencyContact, education, salary, role, school, teachSubject, teachSclass };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(registerUser(fields, role));
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate("/Admin/teachers");
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    const handlePhoneChange = (event) => {
        const newPhone = event.target.value;
        if (newPhone.length <= 11) {
            setPhone(newPhone);
        }

        // Validate phone number to start with '03'
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

        // Validate emergency contact number to start with '03'
        if (newEmergency && !newEmergency.startsWith('03')) {
            setEmergencyError('Emergency contact must start with "03"');
        } else {
            setEmergencyError('');
        }
    };

    const isFormValid = () => {
        return !phoneError && !emergencyError && phone.length === 11 && emergencyContact.length === 11;
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
                                    Subject: <Box component="span" sx={{ fontWeight: 'bold' }}>{subjectDetails?.subName}</Box>
                                </Typography>
                                <Typography variant="h6">
                                    Class: <Box component="span" sx={{ fontWeight: 'bold' }}>{subjectDetails?.sclassName?.sclassName}</Box>
                                </Typography>
                            </Box>
                            <form className="registerForm" onSubmit={submitHandler}>
                                <TextField
                                    className="registerInput"
                                    label="Name"
                                    variant="outlined"
                                    fullWidth
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }} // Add margin to input fields
                                />

                                <TextField
                                    className="registerInput"
                                    label="Email"
                                    variant="outlined"
                                    type="email"
                                    fullWidth
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }} // Add margin to input fields
                                />

                                <TextField
                                    className="registerInput"
                                    label="Phone#"
                                    variant="outlined"
                                    placeholder='03XXXXXXXXX'
                                    type="tel"
                                    fullWidth
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    required
                                    sx={{ marginBottom: 2 }}
                                    inputProps={{ maxLength: 11 }}
                                    error={Boolean(phoneError)}
                                    helperText={phoneError}
                                />
                                <TextField
                                    className="registerInput"
                                    label="Emergency Contact#"
                                    variant="outlined"
                                    placeholder='03XXXXXXXXX'
                                    type="tel"
                                    fullWidth
                                    value={emergencyContact}
                                    onChange={handleEmergencyChange}
                                    required
                                    sx={{ marginBottom: 2 }}
                                    inputProps={{ maxLength: 11 }}
                                    error={Boolean(emergencyError)}
                                    helperText={emergencyError}
                                />
                                <TextField
                                    className="registerInput"
                                    label="Address"
                                    variant="outlined"
                                    placeholder='xyz, Karachi, Pakistan'
                                    type="text"
                                    fullWidth
                                    value={address}
                                    onChange={(event) => setAddress(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }}
                                />

                                <TextField
                                    className="registerInput"
                                    label="Education"
                                    variant="outlined"
                                    placeholder='Qualification'
                                    type="text"
                                    fullWidth
                                    value={education}
                                    onChange={(event) => setEducation(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }}
                                />

                                <TextField
                                    className="registerInput"
                                    label="Salary"
                                    variant="outlined"
                                    placeholder='10000*'
                                    type="number"
                                    fullWidth
                                    value={salary}
                                    onChange={(event) => setSalary(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Rs:</InputAdornment>,
                                        endAdornment: <InputAdornment position="end">PKR</InputAdornment>,
                                    }}
                                />

                                <TextField
                                    className="registerInput"
                                    label="Password"
                                    variant="outlined"
                                    type="password"
                                    fullWidth
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }}
                                />

                                <Button
                                    className="registerButton"
                                    type="submit"
                                    disabled={!isFormValid() || loader} // Disable if form is not valid
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                >
                                    {loader ? <CircularProgress size={24} color="inherit" /> : 'Add'}
                                </Button>
                            </form>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
}

export default AddTeacher;
