import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteUser, getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import {
    Box, Button, Card, CardContent, CircularProgress, Container, Paper, Typography, Grid
} from '@mui/material';
import Popup from '../../../components/Popup';
import axios from 'axios';

const ViewStudent = () => {
    // --- SECTION: Core Component State & Hooks ---
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, loading, error, response } = useSelector((state) => state.user);
    const studentID = params.id;
    const address = "Student";

    // --- SECTION: State for Asynchronous Class Data ---
    const [classDetails, setClassDetails] = useState([]);
    const [classDetailsLoading, setClassDetailsLoading] = useState(false);
    const [classDetailsError, setClassDetailsError] = useState(null);

    // --- SECTION: UI State & Local Form State ---
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');

    // --- SECTION: Data Fetching Effects ---

    // Effect to fetch the main student details
    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    // Effect to fetch details for all enrolled classes once student details are available
    useEffect(() => {
        if (userDetails && userDetails.className && userDetails.className.length > 0) {
            const fetchAllClassDetails = async () => {
                setClassDetailsLoading(true);
                setClassDetailsError(null);

                // Create an array of promises for each class ID
                const promises = userDetails.className.map(id =>
                    axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/${id}`)
                );

                try {
                    const results = await Promise.all(promises);
                    // Extract the data from each response
                    const fetchedClasses = results.map(result => result.data);
                    setClassDetails(fetchedClasses);
                } catch (err) {
                    console.error("Failed to fetch class details", err);
                    setClassDetailsError("Could not load class details. Please try again.");
                } finally {
                    setClassDetailsLoading(false);
                }
            };

            fetchAllClassDetails();
        }
    }, [userDetails]);

    // Effect to populate local form state when userDetails changes
    useEffect(() => {
        if (userDetails) {
            setName(userDetails.name || '');
            setRollNum(userDetails.rollNum || '');
        }
    }, [userDetails]);

    // --- SECTION: Event Handlers ---

    const deleteHandler = () => {
        setMessage("Sorry, the delete function has been disabled for now.");
        setShowPopup(true);
    };

    // --- SECTION: Main Component Render ---

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        console.log(error);
        return (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                Error loading student details.
            </Typography>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Student Details
                </Typography>
                <Typography variant="h6">Name: {userDetails?.name}</Typography>
                <Typography variant="body1">Roll Number: {userDetails?.rollNum}</Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    School: {userDetails?.school?.schoolName}
                </Typography>

                <Button variant="contained" color="error" onClick={deleteHandler}>
                    Delete Student
                </Button>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Enrolled Classes
                </Typography>
                {classDetailsLoading ? (
                    <CircularProgress />
                ) : classDetailsError ? (
                    <Typography color="error">{classDetailsError}</Typography>
                ) : (
                    <Grid container spacing={2}>
                        {classDetails.map((sClass) => (
                            <Grid item xs={12} sm={6} key={sClass._id}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {sClass.sclassName}
                                        </Typography>
                                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                            ID: {sClass._id}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Timing:</strong> {sClass.timingSlot || 'N/A'} ({sClass.timingType || 'N/A'})
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Fee:</strong> Rs. {sClass.sclassFee || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Created On:</strong> {new Date(sClass.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ViewStudent;