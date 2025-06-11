import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, Box, Grid, Paper, Typography, TextField, Button } from '@mui/material';
import Popup from '../../../components/Popup';

const AddNotice = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, response } = useSelector(state => state.user);
    const { currentUser } = useSelector(state => state.user);

    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [date, setDate] = useState('');
    const adminID = currentUser._id;

    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const fields = { title, details, date, adminID };
    const address = "Notice";

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === 'added') {
            navigate('/Admin/notices');
            dispatch(underControl());
        } else if (status === 'error') {
            setMessage(response || "Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, dispatch]);

    return (
        <>
            <Box sx={{ padding: 4 }}>
                <Paper elevation={3} sx={{ padding: 4 }}>
                    <Typography variant="h4" align="left" gutterBottom>Add Notice</Typography>
                    <form className="registerForm" onSubmit={submitHandler}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    className="registerInput"
                                    label="Title"
                                    variant="outlined"
                                    fullWidth
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }} // Add margin to input fields
                                />
                                <TextField
                                    className="registerInput"
                                    label="Details"
                                    variant="outlined"
                                    fullWidth
                                    value={details}
                                    onChange={(event) => setDetails(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }} // Add margin to input fields
                                />
                                <TextField
                                    className="registerInput"
                                    label="Date"
                                    variant="outlined"
                                    type="date"
                                    fullWidth
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    required
                                    sx={{ marginBottom: 2 }} // Add margin to input fields
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    className="registerButton"
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loader}
                                    fullWidth
                                >
                                    {loader ? <CircularProgress size={24} color="inherit" /> : 'Add'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default AddNotice;
