import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Button, Card, CardContent, CircularProgress, Container, FormControl,
    Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography
} from '@mui/material';
import { getClassDetails } from "../../../redux/sclassRelated/sclassHandle";
import Popup from "../../../components/Popup";

const DetailItem = ({ label, value }) => (
    <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
            {label}
        </Typography>
        <Typography variant="body1" gutterBottom>
            {(value === 0 || value) ? String(value) : "N/A"}
        </Typography>
    </Grid>
);

const ClassDetails = () => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sclassDetails, loading, error } = useSelector((state) => state.sclass);
    const classID = params.id;

    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ sclassName: '', sclassFee: '', timingType: '', timingSlot: '' });
    const [saving, setSaving] = useState(false);

    // Timing dropdowns use the same endpoints as AddClass.
    const [types, setTypes] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
    }, [dispatch, classID]);

    if (error) {
        console.log(error);
    }

    // Seed the edit form from whatever the API returned.
    useEffect(() => {
        if (sclassDetails) {
            setFormData({
                sclassName: sclassDetails.sclassName || '',
                sclassFee: sclassDetails.sclassFee || '',
                timingType: sclassDetails.timingType || '',
                timingSlot: sclassDetails.timingSlot || '',
            });
        }
    }, [sclassDetails]);

    useEffect(() => {
        if (!isEditMode) return;
        const fetchTypes = async () => {
            setLoadingTypes(true);
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/timing-types`);
                setTypes(res.data || []);
            } catch (err) {
                console.error("Failed to fetch timing types:", err);
                setTypes([]);
            } finally {
                setLoadingTypes(false);
            }
        };
        fetchTypes();
    }, [isEditMode]);

    useEffect(() => {
        if (!isEditMode || !formData.timingType) {
            setSlots([]);
            return;
        }
        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/timing-slots/${formData.timingType}`);
                setSlots(res.data || []);
            } catch (err) {
                console.error("Failed to fetch timing slots:", err);
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [isEditMode, formData.timingType]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => {
            // Changing the type invalidates a slot picked under the old type.
            if (name === 'timingType') {
                return { ...prev, timingType: value, timingSlot: '' };
            }
            return { ...prev, [name]: value };
        });
    };

    const resetForm = () => {
        if (sclassDetails) {
            setFormData({
                sclassName: sclassDetails.sclassName || '',
                sclassFee: sclassDetails.sclassFee || '',
                timingType: sclassDetails.timingType || '',
                timingSlot: sclassDetails.timingSlot || '',
            });
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        resetForm();
    };

    const handleSave = async () => {
        if (!formData.sclassName || !formData.sclassFee) {
            setIsSuccess(false);
            setMessage("Class name and fee are required.");
            setShowPopup(true);
            return;
        }

        setSaving(true);
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/Sclass/${classID}`, {
                sclassName: formData.sclassName,
                sclassFee: formData.sclassFee,
                timingType: formData.timingType,
                timingSlot: formData.timingSlot,
            }, { headers: { 'Content-Type': 'application/json' } });

            setIsSuccess(true);
            setMessage("Class updated successfully.");
            setShowPopup(true);
            setIsEditMode(false);
            dispatch(getClassDetails(classID, "Sclass"));
        } catch (err) {
            setIsSuccess(false);
            setMessage(err.response?.data?.message || "Failed to update the class.");
            setShowPopup(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Container sx={{ mt: 3, mb: 4 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h5">Class Details</Typography>
                        {!isEditMode ? (
                            <Button variant="contained" onClick={() => setIsEditMode(true)}>
                                Edit
                            </Button>
                        ) : (
                            <Stack direction="row" spacing={1}>
                                <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button variant="contained" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "Save"}
                                </Button>
                            </Stack>
                        )}
                    </Stack>

                    <Card variant="outlined">
                        <CardContent>
                            {isEditMode ? (
                                <Stack spacing={3}>
                                    <TextField
                                        label="Session/Program Name"
                                        name="sclassName"
                                        value={formData.sclassName}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Fee of Session/Program"
                                        name="sclassFee"
                                        type="number"
                                        value={formData.sclassFee}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel id="timing-type-label">Shift / Timing Type</InputLabel>
                                        <Select
                                            labelId="timing-type-label"
                                            label="Shift / Timing Type"
                                            name="timingType"
                                            value={formData.timingType}
                                            onChange={handleChange}
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
                                    <FormControl fullWidth disabled={!formData.timingType || loadingSlots}>
                                        <InputLabel id="timing-slot-label">Available Slot</InputLabel>
                                        <Select
                                            labelId="timing-slot-label"
                                            label="Available Slot"
                                            name="timingSlot"
                                            value={formData.timingSlot}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>
                                                    {loadingSlots ? 'Loading...' : !formData.timingType ? 'Select a type first' : 'Select a Slot'}
                                                </em>
                                            </MenuItem>
                                            {/* Keep the saved slot selectable even if it is no longer offered. */}
                                            {formData.timingSlot && !slots.some((s) => s.slot === formData.timingSlot) && (
                                                <MenuItem value={formData.timingSlot}>{formData.timingSlot}</MenuItem>
                                            )}
                                            {slots.map((item, index) => (
                                                <MenuItem key={index} value={item.slot}>
                                                    {item.slot}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            ) : (
                                <Grid container spacing={2}>
                                    <DetailItem label="Class Name" value={sclassDetails && sclassDetails.sclassName} />
                                    <DetailItem label="Fee of Session/Program" value={sclassDetails && sclassDetails.sclassFee} />
                                    <DetailItem label="Shift / Timing Type" value={sclassDetails && sclassDetails.timingType} />
                                    <DetailItem label="Slot" value={sclassDetails && sclassDetails.timingSlot} />
                                </Grid>
                            )}
                        </CardContent>
                    </Card>

                    <Box sx={{ mt: 3 }}>
                        <Button variant="text" onClick={() => navigate("/Admin/classes")}>
                            Back to Classes
                        </Button>
                    </Box>
                </Paper>
            </Container>

            <Popup open={showPopup} message={message} success={isSuccess} onClose={() => setShowPopup(false)} />
        </>
    );
};

export default ClassDetails;
