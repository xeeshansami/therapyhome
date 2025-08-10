import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteUser, getUserDetails } from '../../../redux/userRelated/userHandle';
import {
    Box, Button, Card, CardContent, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, Chip, TextField, Stack,
    FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Popup from '../../../components/Popup';
import axios from 'axios';

// Helper component for displaying details
const DetailItem = ({ label, value }) => (
    <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
        <Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography>
    </Grid>
);

// Helper component for editing text fields
const EditableDetailItem = ({ label, value, isEditMode, onChange, name, type = 'text' }) => (
    <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
        {isEditMode ? (
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={value}
                onChange={onChange}
                name={name}
                type={type}
                // For date picker
                InputLabelProps={type === 'date' ? { shrink: true } : undefined}
            />
        ) : (
            <Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography>
        )}
    </Grid>
);


const ViewStudent = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, loading, error } = useSelector((state) => state.user);
    const studentID = params.id;

    // --- SECTION: UI & Form State ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // State to hold the form data for editing
    const [formData, setFormData] = useState({});

    // --- SECTION: State for Asynchronous Class Data ---
    const [classDetails, setClassDetails] = useState([]);
    const [classDetailsLoading, setClassDetailsLoading] = useState(false);
    const [classDetailsError, setClassDetailsError] = useState(null);

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Helper function to format date string to YYYY-MM-DD for date input
    const toInputDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // --- SECTION: Data Fetching Effects ---

    useEffect(() => {
        dispatch(getUserDetails(studentID, "Student"));
    }, [dispatch, studentID]);

    useEffect(() => {
        if (userDetails) {
            // Initialize form data when userDetails are loaded or updated
            setFormData({
                name: userDetails.name || '',
                rollNum: userDetails.rollNum || '',
                gender: userDetails.gender || '',
                age: userDetails.age || '',
                dob: userDetails.dob?.$date ? toInputDate(userDetails.dob.$date) : '',
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

            // Fetch class details if available
            if (userDetails.className && userDetails.className.length > 0) {
                const fetchAllClassDetails = async () => {
                    setClassDetailsLoading(true);
                    setClassDetailsError(null);
                    const classIDs = userDetails.className.map(c => c.$oid || c);
                    const promises = classIDs.map(id =>
                        axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${id}`)
                    );
                    try {
                        const results = await Promise.all(promises);
                        setClassDetails(results.map(result => result.data));
                    } catch (err) {
                        console.error("Failed to fetch class details", err);
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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDayChange = (event) => {
        const { name, checked } = event.target;
        setFormData(prev => {
            const days = checked
                ? [...prev.days, name]
                : prev.days.filter(day => day !== name);
            return { ...prev, days };
        });
    };

    const handleCancel = () => {
        setIsEditMode(false);
        // Reset form data to original userDetails
        if (userDetails) {
            setFormData({
                name: userDetails.name || '',
                rollNum: userDetails.rollNum || '',
                gender: userDetails.gender || '',
                age: userDetails.age || '',
                dob: userDetails.dob?.$date ? toInputDate(userDetails.dob.$date) : '',
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
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        setLoader(true);

        const dataToSubmit = new FormData();
        // Append all form data fields
        for (const key in formData) {
            if (key === 'days') {
                dataToSubmit.append(key, JSON.stringify(formData[key]));
            } else {
                dataToSubmit.append(key, formData[key]);
            }
        }

        try {
            // Use a PUT request for updating
            const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Student/${studentID}`, dataToSubmit);

            if (result.data.status === "00") {
                setMessage("Student details updated successfully!");
                setShowPopup(true);
                setIsEditMode(false);
                dispatch(getUserDetails(studentID, "Student")); // Re-fetch data
            } else {
                setMessage("Update failed: " + (result.data.message || "Unknown error."));
                setShowPopup(true);
            }
        } catch (error) {
            setMessage("Update failed: " + (error.response?.data?.message || error.message));
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    const deleteHandler = () => {
        setMessage("Sorry, the delete function has been disabled for now.");
        setShowPopup(true);
    };

    // --- SECTION: Main Component Render ---

    if (loading && !userDetails) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>Error loading student details.</Typography>;
    }

    const renderBoolean = (value) => (value ? 'Yes' : 'No');
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // Check if the date string is already in YYYY-MM-DD format from the input
        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return new Date(year, month - 1, day).toLocaleDateString('en-GB');
        }
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h4" gutterBottom>{userDetails?.name || 'Student Details'}</Typography>
                    <Typography variant="h6" color="text.secondary">Roll No: {userDetails?.rollNum}</Typography>
                </div>
                {!isEditMode && (
                    <Button variant="contained" onClick={() => setIsEditMode(true)}>Edit Details</Button>
                )}
            </Paper>

            <form onSubmit={handleUpdate}>
                {/* --- Accordion for Student Profile --- */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Student Profile</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <EditableDetailItem label="Name" name="name" value={formData.name || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <DetailItem label="Roll Number" value={userDetails?.rollNum} />
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
                                ) : (
                                    <Typography variant="body1" gutterBottom>{formData.gender || "N/A"}</Typography>
                                )}
                            </Grid>
                            <EditableDetailItem label="Age" name="age" value={formData.age || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Date of Birth" name="dob" value={formData.dob || ''} isEditMode={isEditMode} onChange={handleInputChange} type="date" />
                            <EditableDetailItem label="Reference" name="reference" value={formData.reference || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* --- Accordion for Parent & Contact Information --- */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Parent & Contact Information</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <EditableDetailItem label="Parent's Name" name="parentName" value={formData.parentName || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Parent's Contact" name="parentContact" value={formData.parentContact || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Parent's CNIC" name="parentCNIC" value={formData.parentCNIC || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Parent's Profession" name="parentProfession" value={formData.parentProfession || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Home Address" name="parentAddress" value={formData.parentAddress || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Parent's Gender</Typography>
                                {isEditMode ? (
                                    <FormControl fullWidth size="small">
                                        <Select name="parentGender" value={formData.parentGender || ''} onChange={handleInputChange}>
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Typography variant="body1" gutterBottom>{formData.parentGender || "N/A"}</Typography>
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Marital Status</Typography>
                                {isEditMode ? (
                                    <FormControl fullWidth size="small">
                                        <Select name="parentMaritalStatus" value={formData.parentMaritalStatus || ''} onChange={handleInputChange}>
                                            <MenuItem value="Single">Single</MenuItem>
                                            <MenuItem value="Married">Married</MenuItem>
                                            <MenuItem value="Widow">Widow</MenuItem>
                                            <MenuItem value="Divorced">Divorced</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Typography variant="body1" gutterBottom>{formData.parentMaritalStatus || "N/A"}</Typography>
                                )}
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* --- Accordion for Enrolled Courses & Schedule --- */}
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Enrolled Courses & Schedule</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <DetailItem label="Consultancy Date" value={userDetails?.consultancyDate} />
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Scheduled Days</Typography>
                                {isEditMode ? (
                                    <FormGroup row>
                                        {weekdays.map(day => (
                                            <FormControlLabel
                                                key={day}
                                                control={<Checkbox checked={formData.days?.includes(day) || false} onChange={handleDayChange} name={day} />}
                                                label={day}
                                            />
                                        ))}
                                    </FormGroup>
                                ) : (
                                    <Typography variant="body1" gutterBottom>{userDetails?.days?.join(', ') || "N/A"}</Typography>
                                )}
                            </Grid>
                        </Grid>
                        <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Class Details:</Typography>
                        {classDetailsLoading ? <CircularProgress /> : classDetailsError ? <Typography color="error">{classDetailsError}</Typography> : (
                            <Grid container spacing={2}>
                                {classDetails.map((sClass) => (
                                    <Grid item xs={12} md={6} key={sClass._id}>
                                        <Card variant="outlined"><CardContent>
                                            <Typography variant="h6">{sClass.sclassName}</Typography>
                                            <DetailItem label="Timing" value={`${sClass.timingSlot} (${sClass.timingType})`} />
                                            <DetailItem label="Fee" value={`Rs. ${sClass.sclassFee}`} />
                                        </CardContent></Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </AccordionDetails>
                </Accordion>

                {/* Other accordions remain view-only */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Medical & Academic History</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <DetailItem label="Doctor's Diagnosis?" value={renderBoolean(userDetails?.doctorDiagnosisCondition)} />
                            {userDetails?.doctorDiagnosisCondition && <DetailItem label="Diagnosis Details" value={userDetails?.doctorDiagnosisDetails} />}
                            <DetailItem label="Taken Therapies Before?" value={renderBoolean(userDetails?.takingTherapiesBefore)} />
                            {userDetails?.takingTherapiesBefore && <DetailItem label="Previous Therapy Details" value={userDetails?.therapiesBeforeDetails} />}
                            <DetailItem label="Currently on Medication?" value={renderBoolean(userDetails?.onMedication)} />
                            {userDetails?.onMedication && <DetailItem label="Medication Details" value={userDetails?.medicationDetails} />}
                            <DetailItem label="Child Attends School?" value={renderBoolean(userDetails?.childAttendsSchool)} />
                            {userDetails?.childAttendsSchool && <DetailItem label="School Details" value={userDetails?.schoolDetails} />}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Therapies Seeking</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {userDetails?.therapiesSeeking?.map(therapy => <Chip key={therapy} label={therapy} />)}
                        </Box>
                        <DetailItem label="Specific Details" value={userDetails?.therapiesSeekingSpecific} />
                    </AccordionDetails>
                </Accordion>

                {isEditMode && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={loader}>
                            {loader ? <CircularProgress size={24} color="inherit" /> : 'Update Details'}
                        </Button>
                    </Box>
                )}
            </form>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="error" onClick={deleteHandler}>
                    Delete Student
                </Button>
            </Box>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ViewStudent;
