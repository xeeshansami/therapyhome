import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, IconButton, InputAdornment } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import axios from 'axios';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Box, FormControlLabel, ListItemText, FormGroup, Checkbox, Typography, TextField, Button, Grid, Paper, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const AddStudent = ({ situation }) => {
    const [searchContact, setSearchContact] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [days, setSelectedDays] = useState([]);
    const [feeStructure, setFeeStructureDays] = useState([]);
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const feeStructureOptions = ['Daily', 'Weekly', 'Monthly'];

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const userState = useSelector(state => state.user);
    const { status, currentUser, response } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [selectedClassTiming, setSelectedClassTiming] = useState('');
    const [daySelectionError, setDaySelectionError] = useState(false);
    const [feeStructureError, setFeeStructureError] = useState(false);
    const [timeError, setTimeError] = useState(false);

    const [name, setName] = useState('');
    const [parentsName, setparentsName] = useState('');

    const [rollNum, setRollNum] = useState('');
    const [rollNumLoading, setRollNumLoading] = useState(false);
    const [rollNumError, setRollNumError] = useState('');
     const [phoneError, setPhoneError] = useState('');
    const [setBtnName, setButtonName] = useState('');
    const [setStdUpdateName, setUpdateName] = useState('');
    const [parentsContact, setPNum] = useState('');
    const [address, setAddress] = useState('');
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [generatedInvoiceNo, setGeneratedInvoiceNo] = useState('Loading...');
    const [invoiceNoError, setInvoiceNoError] = useState('');

    const [selectedClassDetails, setSelectedClassDetails] = useState('');
    const [sclassName, setSclassName] = useState('');

    const adminID = currentUser._id;
    const role = "Student";
    const attendance = [];

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [feeDetails, setFeeDetails] = useState({
        admissionFee: 5000,
        securityDeposit: 5000,
        otherCharges: 0,
        totalAmount: 10000,
    });

    // --- NEW STATE FOR MONTHLY FEE ---
    const [monthlyFee, setMonthlyFee] = useState(0);
    const fetchNextInvoiceNo = async (result, totalAmount, formattedDateTime) => {
        try {
            setLoader(true);
            setInvoiceNoError(''); // Clear previous errors
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/invoices/next-number`);
            if (response.data && response.data.invoiceNum) {
                setGeneratedInvoiceNo(response.data.invoiceNum);
                handleSaveFee(result, totalAmount, formattedDateTime, response.data.invoiceNum);
            } else {
                setGeneratedInvoiceNo('THS16072025-01'); // Default fallback
                console.warn("Could not fetch invoice number, defaulting.");
                setInvoiceNoError('Could not generate invoice number automatically.');
            }
        } catch (error) {
            console.error("Error fetching next invoice number:", error);
            setGeneratedInvoiceNo('Error');
            setInvoiceNoError('Failed to fetch invoice number.');
        } finally {
            setLoader(false);
        }
    };
    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const handleChange = (event) => {
        const { target: { value } } = event;
        setSelectedClasses(typeof value === 'string' ? value.split(',') : value);
    };

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    useEffect(() => {
        if (selectedClasses.length > 0) {
            const details = sclassesList
                .filter(sclass => selectedClasses.includes(sclass._id))
                .map(sclass => `${sclass.sclassName} - Fee: ${sclass.sclassFee} - Type: ${sclass.timingType} - Slot: ${sclass.timingSlot}`)
                .join('\n');
            setSelectedClassDetails(details);
        } else {
            setSelectedClassDetails('');
        }
    }, [selectedClasses, sclassesList]);

    // --- EFFECT TO CALCULATE ONE-TIME CHARGES ---
    useEffect(() => {
        const { admissionFee, securityDeposit, otherCharges } = feeDetails;
        const total = Number(admissionFee || 0) + Number(securityDeposit || 0) + Number(otherCharges || 0);
        setFeeDetails(prev => ({ ...prev, totalAmount: total }));
    }, [feeDetails.admissionFee, feeDetails.securityDeposit, feeDetails.otherCharges]);

    // --- EFFECT TO CALCULATE MONTHLY FEE FROM CLASSES ---
    useEffect(() => {
        const classFeesTotal = sclassesList
            .filter(sclass => selectedClasses.includes(sclass._id))
            .reduce((sum, currentClass) => sum + (Number(currentClass.sclassFee) || 0), 0);
        setMonthlyFee(classFeesTotal);
    }, [selectedClasses, sclassesList]);

    const handleGenerateRollNumClick = async () => {
        setRollNumLoading(true);
        setRollNumError('');
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/GenerateNextRollNum`);
            if (response.data && response.data.rollNum) {
                setButtonName("Add Student");
                setUpdateName("Add New Student");
                setRollNum(response.data.rollNum);
            } else {
                setRollNumError('Failed to parse roll number from server.');
            }
        } catch (error) {
            setRollNumError(error.response?.data?.message || 'Network error during roll number generation.');
        } finally {
            setRollNumLoading(false);
        }
    };

    const getCurrentDateTimeFormatted = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        debugger
        if (!name || !parentsName || !parentsContact || !address) {
            setMessage("Please fill all required student and parent fields.");
            setShowPopup(true);
            return;
        }
        if (!rollNum) {
            setRollNumError("Roll number is required. Please generate one.");
            setMessage("Please generate a Roll Number.");
            setShowPopup(true);
            return;
        }
        if (selectedClasses.length === 0) {
            setMessage("Please select at least one class.");
            setShowPopup(true);
            return;
        }
        if (days.length === 0) {
            setDaySelectionError(true);
            setMessage("Please select at least one day.");
            setShowPopup(true);
            return;
        }
        if (feeStructure.length === 0) {
            setFeeStructureError(true);
            setMessage("Please select a fee structure.");
            setShowPopup(true);
            return;
        }
        const formattedDateTime = getCurrentDateTimeFormatted();
        const formDataToSubmit = new FormData();
        debugger
        formDataToSubmit.append('name', name);
        formDataToSubmit.append('parentsName', parentsName);
        formDataToSubmit.append('rollNum', rollNum);
        formDataToSubmit.append('parentsContact', parentsContact);
        formDataToSubmit.append('parentAddress', address);
        if (selectedClasses.length > 0) {
            formDataToSubmit.append('sclassName', selectedClasses[0]);
        }
        selectedClasses.forEach(id => {
            formDataToSubmit.append('className[]', id);
        });
        formDataToSubmit.append('admissionDate', formattedDateTime);
        formDataToSubmit.append('adminID', adminID);
        formDataToSubmit.append('role', role);
        formDataToSubmit.append("days", JSON.stringify(days));
        formDataToSubmit.append("feeStructure", JSON.stringify(feeStructure));
        formDataToSubmit.append('admissionFee', feeDetails.admissionFee);
        formDataToSubmit.append('securityDeposit', feeDetails.securityDeposit);
        formDataToSubmit.append('otherCharges', feeDetails.otherCharges);
        formDataToSubmit.append('totalFee', feeDetails.totalAmount); // This is one-time fee
        formDataToSubmit.append('monthlyFee', monthlyFee); // This is the new monthly fee

        if (selectedFile) {
            formDataToSubmit.append('medicalReportPath', selectedFile);
        }

        setLoader(true);
        try {
            debugger
            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, formDataToSubmit);
            if (result.data.status === "00") {
                await fetchNextInvoiceNo(result.data.data, feeDetails.totalAmount, formattedDateTime);
                setMessage(result.data.message);
                setIsSuccess(true);
                setShowPopup(true);
            } else {
                debugger
                setMessage("Student addition failed: " + (result.data.message || "Unknown error."));
                setIsSuccess(false);
                setShowPopup(true);
            }
        } catch (error) {
            debugger
            setMessage("Student addition failed: " + (error.response?.data?.message || error.message));
            setIsSuccess(false);
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    const handlePopupConfirm = () => {
        setShowPopup(false);
    };

    const handleClearSearch = () => {
        setSearchContact('');
        setSearchResults([]);
    };

    const handleSearch = async () => {
        if (!searchContact) {
            setMessage("Please enter a contact number to search");
            setShowPopup(true);
            return;
        }
        setSearchLoading(true);
        try {
            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/getConsStudents`, { parentsContact: searchContact });
            if (result.data && result.data.length > 0) {
                setSearchResults(result.data);
            } else {
                setMessage("No students found with this contact number");
                setShowPopup(true);
                setSearchResults([]);
            }
        } catch (error) {
            setMessage("Error searching for students: " + (error.response?.data?.message || error.message));
            setShowPopup(true);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSaveFee = (selectedStudent, consultancy, date, invoiceNo) => {
        debugger
        const fields = {
            adminID: '68795ab802f2887382d217b0',
            attendance: [],
            parentsName: selectedStudent.parentsName,
            name: selectedStudent.name,
            parentsContact: selectedStudent.parentsContact,
            isPaid: "1",
            role: 'Student',
            invoiceID: invoiceNo,
            rollNum: selectedStudent.rollNum,
            date: date,
            netTotalFee: consultancy,
            paidFee: consultancy,
            sclassName: selectedStudent.sclassName || '',
            isConsultancyOrIsRegistrationOrMonthly: '1',
            school: selectedStudent.school || '',
        };

        axios.post(`${process.env.REACT_APP_BASE_URL}/StudentFeeReg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => {
            })
            .catch(error => {
                debugger
                setShowPopup(false);
                setIsSuccess(false);
                setMessage('Error saving fee details:', error);
                console.error('Error saving fee details:', error);
            });
    };


    const handleSelectStudent = (student) => {
        setName(student.name || '');
        setparentsName(student.parentsName || '');
        setRollNum(student.rollNum || '');
        setPNum(student.parentsContact || '');
        setAddress(student.parentAddress || '');
        setButtonName("Update Student");
        setUpdateName("Update Student");
        setSelectedDays([]);
        setFeeStructureDays([]);
        setSelectedClasses([]);
        setSelectedFile(null);
        setRollNumError('');
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
        } else if (status === 'failed' || status === 'error') {
            setMessage(response || "Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, dispatch]);

    const handleCheckboxChange = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
        if (day.length > 0) setDaySelectionError(false);
    };

    const handleFeeStructureChange = (feeOption) => {
        setFeeStructureDays([feeOption]);
        if (feeOption) setFeeStructureError(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setMessage(file ? `Selected file: ${file.name}` : "");
    };

    return (
        <>
            <Box sx={{ padding: { xs: 2, md: 4 } }}>
                <Paper elevation={3} sx={{ padding: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Search Existing Consultant Students</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            label="Parent's Contact Number"
                            variant="outlined"
                            value={searchContact}
                            onChange={(e) => setSearchContact(e.target.value)}
                            sx={{ flexGrow: 1, minWidth: '200px' }}
                        />
                        <Button variant="contained" onClick={handleSearch} disabled={searchLoading} sx={{ height: '56px' }}>
                            {searchLoading ? <CircularProgress size={24} /> : 'Search'}
                        </Button>
                        <Button variant="outlined" onClick={handleClearSearch} disabled={searchLoading} sx={{ height: '56px' }}>
                            Clear
                        </Button>
                    </Box>

                    {searchResults.length > 0 && (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student Name</TableCell>
                                        <TableCell>Parent's Name</TableCell>
                                        <TableCell>Contact</TableCell>
                                        <TableCell>Roll No.</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {searchResults.map((student) => (
                                        <TableRow hover key={student._id}>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.parentsName}</TableCell>
                                            <TableCell>{student.parentsContact}</TableCell>
                                            <TableCell>{student.rollNum}</TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small" onClick={() => handleSelectStudent(student)}>Select</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                <Paper elevation={3} sx={{ padding: { xs: 2, md: 4 } }}>
                    <Typography variant="h5" align="left" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {setStdUpdateName === "Update Student" ? setStdUpdateName : "Add New Student"}
                    </Typography>
                    <form onSubmit={submitHandler}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth required label="Student Name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
                                <TextField fullWidth required label="Father's/Parent's Name" variant="outlined" value={parentsName} onChange={(e) => setparentsName(e.target.value)} sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                    <TextField fullWidth required label="Roll Number" variant="outlined" value={rollNum} error={!!rollNumError} helperText={rollNumError || "Click button to generate if new student."} InputProps={{ readOnly: true }} sx={{ mr: 1, flexGrow: 1 }} />
                                    <Button variant="contained" onClick={handleGenerateRollNumClick} disabled={rollNumLoading} startIcon={rollNumLoading ? <CircularProgress size={20} color="inherit" /> : <AutorenewIcon />} sx={{ height: '56px' }}>
                                        {rollNumLoading ? "..." : "Generate"}
                                    </Button>
                                </Box>
                                {situation === "Student" && (
                                    <>
                                        <FormControl fullWidth required sx={{ mb: 2 }}>
                                            <InputLabel id="multi-class-label">Class</InputLabel>
                                            <Select
                                                labelId="multi-class-label"
                                                multiple
                                                value={selectedClasses}
                                                onChange={handleChange}
                                                renderValue={(selected) => sclassesList.filter(item => selected.includes(item._id)).map(item => item.sclassName).join(', ')}
                                            >
                                                {sclassesList.length > 0 ? (
                                                    sclassesList.map((classItem) => (
                                                        <MenuItem key={classItem._id} value={classItem._id}>
                                                            <Checkbox checked={selectedClasses.includes(classItem._id)} />
                                                            <ListItemText primary={`${classItem.sclassName} (Fee: ${classItem.sclassFee})`} />
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>No classes available</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>

                                        {selectedClassDetails && (
                                            <TextField
                                                fullWidth
                                                label="Selected Class Details"
                                                multiline
                                                rows={selectedClasses.length}
                                                value={selectedClassDetails}
                                                InputProps={{ readOnly: true }}
                                                variant="outlined"
                                                sx={{ mb: 2 }}
                                            />
                                        )}
                                    </>
                                )}
                                <TextField fullWidth required label="Parent Contact" variant="outlined" type="tel" value={parentsContact} onChange={(e) => {
                                    let value = e.target.value.replace(/[^0-9]/g, ''); // Only numbers

                                    if (value.length > 11) {
                                        value = value.slice(0, 11); // Max 11 digits
                                    }

                                    // Optional: validation logic if you want to show errors
                                    if (value && !value.startsWith('03')) {
                                        setPhoneError('Phone number must start with "03"');
                                    } else if (value.length === 11) {
                                        setPhoneError('');
                                    }

                                    setPNum(value); // Update parent contact state
                                }} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} placeholder="03XXXXXXXXX" />
                                <TextField fullWidth required label="Address" variant="outlined" multiline rows={3} value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mb: 2 }} />

                                <Section title="Fee Details">
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth label="Admission Fees" type="number" value={feeDetails.admissionFee} onChange={(e) => setFeeDetails({ ...feeDetails, admissionFee: e.target.value })} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth label="Security Deposit" type="number" value={feeDetails.securityDeposit} onChange={(e) => setFeeDetails({ ...feeDetails, securityDeposit: e.target.value })} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth label="Other Charges" type="number" value={feeDetails.otherCharges} onChange={(e) => setFeeDetails({ ...feeDetails, otherCharges: e.target.value })} />
                                        </Grid>
                                    </Grid>
                                    <TextField fullWidth label="Admission Fee Total" type="number" value={feeDetails.totalAmount} InputProps={{ readOnly: true }} variant="filled" sx={{ mb: 2 }} />
                                    <TextField fullWidth label="Monthly Program/Session Fee (from classes)" type="number" value={monthlyFee} InputProps={{ readOnly: true }} variant="filled" />
                                </Section>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Select Days *</Typography>
                                    <FormGroup row>
                                        {weekdays.map((day) => (
                                            <FormControlLabel key={day} control={<Checkbox checked={days.includes(day)} onChange={() => handleCheckboxChange(day)} />} label={day} />
                                        ))}
                                    </FormGroup>
                                    {daySelectionError && <Typography color="error" variant="caption">Please select at least one day.</Typography>}
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Select Fee Structure *</Typography>
                                    <FormGroup row>
                                        {feeStructureOptions.map((option) => (
                                            <FormControlLabel key={option} control={<Checkbox checked={feeStructure.includes(option)} onChange={() => handleFeeStructureChange(option)} />} label={option} />
                                        ))}
                                    </FormGroup>
                                    {feeStructureError && <Typography color="error" variant="caption">Please select a fee structure.</Typography>}
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Upload Student Medical Report (Optional)</Typography>
                                    <Button variant="contained" component="label" fullWidth>Upload File <input type="file" hidden onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" /></Button>
                                    {selectedFile && <Typography variant="body2" sx={{ mt: 1 }}>Selected: {selectedFile.name}</Typography>}
                                </Box>
                            </Grid>
                        </Grid>
                        <Button fullWidth onClick={submitHandler} type="submit" variant="contained" color="primary" disabled={loader} sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}>
                            {loader ? <CircularProgress size={24} color="inherit" /> : setBtnName ? setBtnName : 'Add Student'}
                        </Button>
                    </form>
                </Paper>
            </Box>
            {showPopup && (
                <div className="custom-popup-overlay" style={popupOverlayStyle}>
                    <div className="custom-popup" style={popupStyle}>
                        <h2 style={{ color: isSuccess ? 'green' : 'red' }}>{isSuccess ? "Success!" : "Error"}</h2>
                        <p>{message}</p>
                        <Button variant="contained" onClick={isSuccess ? handlePopupConfirm : () => setShowPopup(false)}>
                            {isSuccess ? "Done" : "Close"}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

const Section = ({ title, children }) => (
    <Box component="fieldset" sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 3 }}>
        <Typography component="legend" variant="h6" sx={{ px: 1, fontWeight: 'bold', color: 'primary.main' }}>
            {title}
        </Typography>
        {children}
    </Box>
);

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
    zIndex: 1300, // Ensure it's above MUI Dialog by default
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

export default AddStudent;
