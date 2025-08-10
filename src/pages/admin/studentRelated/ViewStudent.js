import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteUser, getUserDetails } from '../../../redux/userRelated/userHandle';
import {
    Box, Button, Card, CardContent, CircularProgress, Container, Paper, Typography, Grid,
    Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Popup from '../../../components/Popup';
import axios from 'axios';

// Helper component to display key-value pairs cleanly
const DetailItem = ({ label, value }) => (
    <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
        <Typography variant="body1" gutterBottom>{value || "N/A"}</Typography>
    </Grid>
);

const ViewStudent = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, loading, error } = useSelector((state) => state.user);

    const studentID = params.id;

    // --- SECTION: State for Asynchronous Class Data ---
    const [classDetails, setClassDetails] = useState([]);
    const [classDetailsLoading, setClassDetailsLoading] = useState(false);
    const [classDetailsError, setClassDetailsError] = useState(null);

    // --- SECTION: UI State ---
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // --- SECTION: Data Fetching Effects ---

    // Effect to fetch the main student details
    useEffect(() => {
        dispatch(getUserDetails(studentID, "Student"));
    }, [dispatch, studentID]);

    // Effect to fetch details for all enrolled classes once student details are available
    useEffect(() => {
        if (userDetails && userDetails.className && userDetails.className.length > 0) {
            const fetchAllClassDetails = async () => {
                setClassDetailsLoading(true);
                setClassDetailsError(null);

                // Correctly extract the ID string from each object in the className array
                const classIDs = userDetails.className.map(c => c.$oid || c);

                const promises = classIDs.map(id =>
                    axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${id}`)
                );

                try {
                    const results = await Promise.all(promises);
                    const fetchedClasses = results.map(result => result.data);
                    setClassDetails(fetchedClasses);
                } catch (err) {
                    console.error("Failed to fetch class details", err);
                    setClassDetailsError("Could not load class details.");
                } finally {
                    setClassDetailsLoading(false);
                }
            };

            fetchAllClassDetails();
        }
    }, [userDetails]);


    // --- SECTION: Event Handlers ---

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

    // Helper function to render boolean values as 'Yes' or 'No'
    const renderBoolean = (value) => (value ? 'Yes' : 'No');
    
    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" gutterBottom>{userDetails?.name || 'Student Details'}</Typography>
                <Typography variant="h6" >Roll No: {userDetails?.rollNum}</Typography>
            </Paper>

            {/* --- Accordion for Student Profile --- */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Student Profile</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <DetailItem label="Age" value={userDetails?.age} />
                        <DetailItem label="Gender" value={userDetails?.gender} />
                        <DetailItem label="Date of Birth" value={formatDate(userDetails?.dob?.$date)} />
                        <DetailItem label="Reference" value={userDetails?.reference} />
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
                        <DetailItem label="Parent's Name" value={userDetails?.parentName} />
                        <DetailItem label="Parent's Contact" value={userDetails?.parentContact} />
                        <DetailItem label="Parent's CNIC" value={userDetails?.parentCNIC} />
                        <DetailItem label="Parent's Profession" value={userDetails?.parentProfession} />
                        <DetailItem label="Home Address" value={userDetails?.parentAddress} />
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
                        <DetailItem label="Scheduled Days" value={userDetails?.days?.join(', ')} />
                    </Grid>
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Class Details:</Typography>
                    {classDetailsLoading ? (
                        <CircularProgress />
                    ) : classDetailsError ? (
                        <Typography color="error">{classDetailsError}</Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {classDetails.map((sClass) => (
                                <Grid item xs={12} md={6} key={sClass._id}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6">{sClass.sclassName}</Typography>
                                            <DetailItem label="Timing" value={`${sClass.timingSlot} (${sClass.timingType})`} />
                                            <DetailItem label="Fee" value={`Rs. ${sClass.sclassFee}`} />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* --- Accordion for Medical & Academic History --- */}
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
            
            {/* --- Accordion for Therapies Seeking --- */}
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
