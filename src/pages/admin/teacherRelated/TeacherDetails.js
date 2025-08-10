import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import {
    Box, Button, Card, CardContent, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, TextField,
    FormControl, InputLabel, Select, MenuItem, Avatar
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Popup from '../../../components/Popup';
import axios from 'axios';

// Helper component for displaying non-editable details
const DetailItem = ({ label, value }) => (
    <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
        <Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography>
    </Grid>
);

// Helper component for displaying and editing text fields
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
            />
        ) : (
            <Typography variant="body1" gutterBottom>{String(value) || "N/A"}</Typography>
        )}
    </Grid>
);

const TeacherDetails = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { teacherDetails, loading, error } = useSelector((state) => state.teacher);
    const teacherID = params.id;

    // --- SECTION: UI & Form State ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // State to hold the form data for editing
    const [formData, setFormData] = useState({});

    // --- SECTION: Data Fetching Effect ---

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    useEffect(() => {
        if (teacherDetails) {
            // Initialize form data when teacherDetails are loaded or updated
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
            });
        }
    }, [teacherDetails]);

    // --- SECTION: Event Handlers ---

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setIsEditMode(false);
        // Reset form data to original teacherDetails
        if (teacherDetails) {
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
            });
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        setLoader(true);

        try {
            // Use a PUT request for updating
            const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Teacher/${teacherID}`, formData);

            if (result.status === 200) {
                setMessage("Teacher details updated successfully!");
                setShowPopup(true);
                setIsEditMode(false);
                dispatch(getTeacherDetails(teacherID)); // Re-fetch data
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
        setMessage("Sorry, the delete function is not available for teachers at the moment.");
        setShowPopup(true);
    };

    // --- SECTION: Main Component Render ---

    if (loading && !teacherDetails) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>Error loading teacher details.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar 
                        src={teacherDetails?.photo} 
                        sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                    >
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

            <form onSubmit={handleUpdate}>
                {/* --- Accordion for Personal Information --- */}
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Personal Information</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <EditableDetailItem label="Name" name="name" value={formData.name || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Email" name="email" value={formData.email || ''} isEditMode={isEditMode} onChange={handleInputChange} />
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
                                ) : (
                                    <Typography variant="body1" gutterBottom>{formData.maritalStatus || "N/A"}</Typography>
                                )}
                            </Grid>
                             <EditableDetailItem label="CNIC" name="cnic" value={formData.cnic || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                             <EditableDetailItem label="Address" name="address" value={formData.address || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                
                {/* --- Accordion for Contact & Professional Info --- */}
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Contact & Professional Information</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <EditableDetailItem label="Phone" name="phone" value={formData.phone || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact || ''} isEditMode={isEditMode} onChange={handleInputChange} />
                            <EditableDetailItem label="Salary" name="salary" value={formData.salary || ''} isEditMode={isEditMode} onChange={handleInputChange} type="number" />
                            <DetailItem label="Assigned Class" value={teacherDetails?.teachSclass?.sclassName} />
                        </Grid>
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
                    Delete Teacher
                </Button>
            </Box>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default TeacherDetails;