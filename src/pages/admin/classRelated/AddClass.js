import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { BlueButton } from "../../../components/buttonStyles";
import Classroom from "../../../assets/classroom.png";
import styled from "styled-components";
import { FormControl, InputLabel, Select, MenuItem, Typography, Paper } from '@mui/material';
import axios from 'axios';

const AddClass = () => {
    // State for the main form
    const [sclassName, setSclassName] = useState("");
    const [sclassFee, setSclassFee] = useState("");

    // State for the first dropdown (Types)
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [loadingTypes, setLoadingTypes] = useState(false);

    // State for the second dropdown (Timings)
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;
    const adminID = currentUser._id;
    const address = "Sclass";

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // 1. Fetch all timing types when the component first loads
    useEffect(() => {
        const fetchTypes = async () => {
            setLoadingTypes(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/timing-types`);
                setTypes(response.data);
            } catch (error) {
                console.error("Failed to fetch types:", error);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchTypes();
    }, []); // Empty dependency array ensures this runs only once

    // 2. Fetch timing slots whenever `selectedType` changes
    useEffect(() => {
        if (!selectedType) {
            setSlots([]);
            setSelectedSlot('');
            return;
        }

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSlots([]);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/timing-slots/${selectedType}`);
                setSlots(response.data);
            } catch (error) {
                console.error("Failed to fetch timing slots:", error);
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [selectedType]);

    const submitHandler = (event) => {
        event.preventDefault();

        // --- VALIDATION FOR ALL FIELDS ---
        if (!sclassName || !sclassFee || !selectedType || !selectedSlot) {
            let missingField = "";
            if (!sclassName) missingField = "Session/Program Name";
            else if (!sclassFee) missingField = "Fee";
            else if (!selectedType) missingField = "Timing Type";
            else if (!selectedSlot) missingField = "Available Slot";
            
            setMessage(`Please fill all required fields. Missing: ${missingField}`);
            setShowPopup(true);
            return;
        }
        
        // --- API PAYLOAD WITH TIMING DATA ---
        const fields = {
            sclassName,
            sclassFee,
            timingType: selectedType,
            timingSlot: selectedSlot,
            adminID,
        };

        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    const handlePopupConfirm = () => {
        setShowPopup(false);
        dispatch(underControl());
        navigate(-1);
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            setIsSuccess(true);
            setShowPopup(true);
            setMessage("Class has been added successfully");
            setLoader(false);
        } else if (status === 'failed') {
            setIsSuccess(false);
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setIsSuccess(false);
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch, tempDetails]);

    return (
        <>
            <StyledContainer>
                <StyledBox>
                    <Stack sx={{ alignItems: 'center', mb: 3 }}>
                        <img src={Classroom} alt="classroom" style={{ width: '80%' }} />
                    </Stack>
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                label="Create a Session/Program"
                                variant="outlined"
                                value={sclassName}
                                onChange={(event) => setSclassName(event.target.value)}
                                required
                            />
                            <TextField
                                label="Fee of this session"
                                variant="outlined"
                                type="number"
                                value={sclassFee}
                                onChange={(event) => setSclassFee(event.target.value)}
                                required
                            />

                            <Paper elevation={2} sx={{ p: 2, mt: 2, border: '1px solid #eee' }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Select Timing Options</Typography>
                                <Stack spacing={3}>
                                    <FormControl fullWidth required>
                                        <InputLabel id="timing-type-label">Timing Type</InputLabel>
                                        <Select
                                            labelId="timing-type-label"
                                            value={selectedType}
                                            label="Timing Type"
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            disabled={loadingTypes}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>{loadingTypes ? 'Loading...' : 'Select a Type'}</em>
                                            </MenuItem>
                                            {types.map((type) => (
                                                <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth required disabled={!selectedType || loadingSlots}>
                                        <InputLabel id="timing-slot-label">Available Slots</InputLabel>
                                        <Select
                                            labelId="timing-slot-label"
                                            value={selectedSlot}
                                            label="Available Slots"
                                            onChange={(e) => setSelectedSlot(e.target.value)}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>
                                                    {loadingSlots ? 'Loading...' : !selectedType ? 'Select a type first' : 'Select a Slot'}
                                                </em>
                                            </MenuItem>
                                            {slots.map((item, index) => (
                                                <MenuItem key={index} value={item.slot}>
                                                    {item.slot}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            </Paper>

                            <BlueButton
                                fullWidth
                                size="large"
                                sx={{ mt: 3 }}
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Create"}
                            </BlueButton>
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </Stack>
                    </form>
                </StyledBox>
            </StyledContainer>
            {showPopup && (
                <div className="custom-popup-overlay" style={popupOverlayStyle}>
                    <div className="custom-popup" style={popupStyle}>
                        <h2 style={{ color: isSuccess ? 'green' : 'red' }}>{isSuccess ? "Success!" : "Error"}</h2>
                        <p>{message}</p>
                        <Button variant="contained" onClick={isSuccess ? handlePopupConfirm : () => setShowPopup(false)}>
                            {isSuccess ? "OK" : "Close"}
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}

export default AddClass;

const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledBox = styled(Box)`
  max-width: 550px;
  padding: 50px 3rem 50px;
  margin-top: 1rem;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #ccc;
  border-radius: 4px;
`;

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
