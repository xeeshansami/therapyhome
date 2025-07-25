import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, IconButton, InputAdornment } from '@mui/material'; // Added IconButton
import AutorenewIcon from '@mui/icons-material/Autorenew'; // Icon for generate button
import { underControl } from '../../../redux/userRelated/userSlice';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import axios from 'axios';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

import { Box, FormControlLabel, ListItemText, FormGroup, Checkbox, Typography, TextField, Button, Grid, Paper, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';


const AddStudent = ({ situation }) => {
    const [searchContact, setSearchContact] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    // const [showResults, setShowResults] = useState(false); // This state was not actively used to hide/show table, table visibility is based on searchResults.length
    const [selectedFile, setSelectedFile] = useState(null);
    const [days, setSelectedDays] = useState([]);
    const [feeStructure, setFeeStructureDays] = useState([]); // Note: feeStrucutre (array) vs feeStructure (state variable)
    const [selectedTime, setSelectedTime] = useState({ hour: '', minute: '', period: 'AM' });
    const [selectedTherapy, setSelectedTherapy] = useState('');
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const feeStructureOptions = ['Daily', 'Weekly', 'Monthly']; // Renamed from feeStrucutre for clarity
    const timeSlots = [
        "09:00 AM - 06:00 PM",
        "10:00 AM - 05:00 PM",
        "11:00 AM - 04:00 PM",
        "12:00 PM - 06:00 PM",
        "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
        "05:00 PM - 06:00 PM",
    ];
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

    // Roll Number specific states
    const [rollNum, setRollNum] = useState(''); // This will hold the generated or selected student's roll number
    const [rollNumLoading, setRollNumLoading] = useState(false);
    const [rollNumError, setRollNumError] = useState('');
    const [setBtnName, setButtonName] = useState('');
    const [setStdUpdateName, setUpdateName] = useState('');
    // const [studentConsultancy, setStudentConsultancy] = useState(''); // This state was set but not used elsewhere in the form submission or display logic
    const [parentsContact, setPNum] = useState('');
    const [address, setAddress] = useState('');
    const [fee, setFees] = useState('');
    const [selectedClasses, setSelectedClasses] = useState([]);

    const [password, setPassword] = useState(''); // Password field is commented out in JSX
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');

    const adminID = currentUser._id;
    const role = "Student";
    const attendance = []; // This is static, usually attendance is dynamic

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false); // This is for form submission loader
    const classTimings = [
        '08:00AM to 01:00PM',
        '09:00AM to 02:00PM',
        '10:00AM to 03:00PM',
        '11:00AM to 04:00PM',
        '12:00PM to 05:00PM',
        '01:00PM to 06:00PM',
        '02:00PM to 07:00PM',
        '03:00PM to 08:00PM',
        '04:00PM to 09:00PM',
    ];
    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;

        // MUI may pass string if autofill is used
        setSelectedClasses(typeof value === 'string' ? value.split(',') : value);
    };
    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            if (selectedClass) { // Ensure selectedClass is found
                setClassName(selectedClass.sclassName);
                setSclassName(selectedClass._id);
            }
        }
    };

    const HourMinut = selectedTime.hour && selectedTime.minute ? `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}` : "";

    // const fields = { name, rollNum, password, sclassName, adminID, role, attendance, days, feeStructure, HourMinut, parentsName, parentsContact, address, fee, studentEmail };
    // 'fields' object is not directly used for FormData, values are appended individually.
    const [feeDetails, setFeeDetails] = useState({
        admissionFee: 5000,
        securityDeposit: 5000,
        otherCharges: 0,
        totalAmount: 11000,
    });

    useEffect(() => {
        const { admissionFee, securityDeposit, otherCharges } = feeDetails;
        const total =
            Number(admissionFee || 0) +
            Number(securityDeposit || 0) +
            Number(otherCharges || 0);

        setFeeDetails(prev => ({
            ...prev,
            totalAmount: total
        }));
    }, [feeDetails.admissionFee, feeDetails.securityDeposit, feeDetails.otherCharges]);

    const therapyFees = [
        {
            label: "Single Therapy (8 sessions or less)",
            perSession: 1500,
            perMonth: 12000,
        },
        {
            label: "Two or More Therapies (16 sessions or more)",
            perSession: 1200,
            perMonth: 19200,
        },
        {
            label: "Three Therapies (24 sessions or more)",
            perSession: 1125,
            perMonth: 27000,
            note: "(Includes other programs like IEP or F&L. 1000 per session charge)"
        }
    ];
    const handleGenerateRollNumClick = async () => {
        setRollNumLoading(true);
        setRollNumError('');
        try {
            // Ensure this endpoint exists on your backend and returns { rollNum: "THSXXX" }
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/GenerateNextRollNum`);
            if (response.data && response.data.rollNum) {
                setButtonName("Add Student");
                setUpdateName("Add New Student");
                setRollNum(response.data.rollNum);
            } else {
                setRollNumError('Failed to parse roll number from server.');
                console.warn("Roll number format from server was unexpected.");
            }
        } catch (error) {
            console.error("Error generating roll number:", error);
            setRollNumError(error.response?.data?.message || 'Network error or server issue during roll number generation.');
        } finally {
            setRollNumLoading(false);
        }
    };
    const getCurrentDateTimeFormatted = () => {
        const now = new Date();

        const day = now.getDate();
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();

        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        // Pad single digits with a leading zero
        const pad = (num) => num < 10 ? '0' + num : num;

        return `${pad(day)}-${month}-${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
    };
    const submitHandler = async (event) => {
        event.preventDefault();
        debugger
        // console.log(selectedFile) // For debugging file selection
        // Basic Validations
        if (!name || !parentsName || !parentsContact || !address || !feeDetails.totalAmount) {
            setMessage("Please fill all required fields before submitting.");
            setShowPopup(true);
            return;
        }
        if (!rollNum) { // Check if roll number is generated/present
            setRollNumError("Roll number is required. Please generate one.");
            setMessage("Please generate a Roll Number.");
            setShowPopup(true);
            return;
        } else {
            setRollNumError(""); // Clear error if roll number is present
        }
        if (!selectedClasses || selectedClasses.length === 0) {
            setMessage("Please select at least one class.");
            setShowPopup(true);
            return;
        }
        if (days.length === 0) {
            setDaySelectionError(true);
            setMessage("Please select at least one day.");
            setShowPopup(true);
            return;
        } else {
            setDaySelectionError(false);
        }
        if (feeStructure.length === 0) { // feeStructure is the state for selected fee options
            setFeeStructureError(true);
            setMessage("Please select a fee structure.");
            setShowPopup(true);
            return;
        } else {
            setFeeStructureError(false);
        }
        if (selectedClassTiming=='') {
            setTimeError(true);
            setMessage("Please select a valid time.");
            setShowPopup(true);
            return;
        } else {
            setTimeError(false);
        }
        const selectedTherapyObject = therapyFees.find(
            fee => fee.label === selectedTherapy
        );
        debugger
        const formattedDateTime = getCurrentDateTimeFormatted();
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('name', name);
        formDataToSubmit.append('parentsName', parentsName);
        formDataToSubmit.append('rollNum', rollNum); // Use the state variable 'rollNum'
        formDataToSubmit.append('parentsContact', parentsContact);
        formDataToSubmit.append('parentAddress', address);
        if (selectedClasses.length > 0) {
            formDataToSubmit.append('sclassName', selectedClasses[0]);
        }
        formDataToSubmit.append('admissionDate', formattedDateTime);
        formDataToSubmit.append('adminID', adminID);
        formDataToSubmit.append('role', role);
        formDataToSubmit.append("attendance", JSON.stringify(attendance)); // attendance is an empty array
        formDataToSubmit.append("days", JSON.stringify(days)); // Changed from selectedDays
        formDataToSubmit.append("feeStructure", JSON.stringify(feeStructure)); // Changed from feeStructureDays
        formDataToSubmit.append('admissionFee', feeDetails.admissionFee); // Changed from 'time'
        formDataToSubmit.append('securityDeposit', feeDetails.securityDeposit); // Changed from 'time'
        formDataToSubmit.append('otherCharges', feeDetails.otherCharges); // Changed from 'time'
        formDataToSubmit.append('totalFee', feeDetails.totalAmount); // Changed from 'time'
        formDataToSubmit.append('selectedClassTiming', selectedClassTiming); // Changed from 'time'
        formDataToSubmit.append('therapyPlan', JSON.stringify(selectedTherapyObject) ? JSON.stringify({ // Ensure selectedTherapyObject exists
            label: selectedTherapyObject.label,
            perSessionCost: selectedTherapyObject.perSession,
            perMonthCost: selectedTherapyObject.perMonth,
            notes: selectedTherapyObject.note,
        }) : ''); // Changed from 'time'
        // Fee details
        if (selectedFile) {
            formDataToSubmit.append('medicalReportPath', selectedFile); // Changed 'file' to 'medicalReportPath' to match schema
        }

        setLoader(true);
        try {
            debugger
            console.log("formDataToSubmit", formDataToSubmit);

            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, formDataToSubmit, {
                // headers: { 'Content-Type': 'application/json' },
            });
            debugger
            if (result.data.status === "00") {
                setMessage(result.data.message);
                setIsSuccess(true);
                setShowPopup(true); // Show success popup first, then invoice via popup confirm
            } else {
                setMessage("Student added failed: " + (result.data.message || "Unknown error from server."));
                setIsSuccess(false);
                setShowPopup(true);
            }
        } catch (error) {
            debugger
            setMessage("Student added failed: " + (error.response?.data?.message || error.message || "Network error."));
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
        // setShowResults(false); // Not needed if visibility is based on searchResults.length
    };

    const handleSearch = async () => {
        if (!searchContact) {
            setMessage("Please enter a contact number to search");
            setShowPopup(true);
            return;
        }
        setSearchLoading(true);
        try {
            // Ensure this endpoint exists and is a POST request if sending body
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
            console.error("Search error:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectStudent = (student) => {
        setName(student.name || '');
        setparentsName(student.parentsName || student.parentsName || ''); // Prefer parentsName if available
        setRollNum(student.rollNum || ''); // Populate rollNum, will be read-only
        // setStudentConsultancy(student.isConsultantStudent || false); // State not used elsewhere
        setPNum(student.parentsContact || student.parentsContact || '');
        setAddress(student.parentAddress || student.address || '');
        setFees(student.totalFee || student.fee || ''); // Prefer totalFee if available from consultancy schema
        setButtonName("Update Student");
        setUpdateName("Update Student");
        // Clear other fields or set them as needed
        setSelectedDays([]);
        setFeeStructureDays([]);
        setSelectedTime({ hour: '', minute: '', period: 'AM' });
        setSclassName('');
        setClassName('');
        setSelectedFile(null);
        setRollNumError(''); // Clear roll num error when a student is selected
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            // navigate(-1); // Uncomment if navigation is desired after successful addition
        } else if (status === 'failed' || status === 'error') {
            setMessage(response || "Network Error"); // response is from userState
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, dispatch]);

    const handleCheckboxChange = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((selectedDay) => selectedDay !== day) : [...prev, day]
        );
        if (days.length > 0) setDaySelectionError(false);
    };

    const handleFeeStructureChange = (feeOption) => { // Renamed from handleCheckboxChange2
        setFeeStructureDays([feeOption]); // Allow only one selection
        debugger
        if (feeStructure.length > 0) setFeeStructureError(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage(`Selected file: ${file.name}`); // Provide feedback about selected file
        } else {
            setSelectedFile(null);
            setMessage("");
        }
    };

    const handleTimeChange = (event) => {
        const { name, value } = event.target;
        setSelectedTime((prev) => ({ ...prev, [name]: value }));
        if (selectedTime.hour && selectedTime.minute) setTimeError(false);
    };

    return (
        <>
            <Box sx={{ padding: { xs: 2, md: 4 } }}>
                <Paper elevation={3} sx={{ padding: { xs: 2, md: 3 }, marginBottom: 3 }}>
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
                        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
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
                                        <TableRow hover key={student._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.parentsName || student.parentsName}</TableCell>
                                            <TableCell>{student.parentsContact || student.parentsContact}</TableCell>
                                            <TableCell>{student.rollNum}</TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small" onClick={() => handleSelectStudent(student)}> Select </Button>
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
                    <form onSubmit={submitHandler}> {/* Use form tag for semantics and default browser behaviors */}
                        <Grid container spacing={3}>
                            {/* Left Column for Form Fields */}
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth required className="registerInput" label="Student Name" variant="outlined" value={name} onChange={(event) => setName(event.target.value)} sx={{ mb: 2 }} />
                                <TextField fullWidth required className="registerInput" label="Father's/Parent's Name" variant="outlined" value={parentsName} onChange={(event) => setparentsName(event.target.value)} sx={{ mb: 2 }} />

                                {/* Roll Number with Generate Button */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        className="registerInput"
                                        label="Roll Number"
                                        variant="outlined"
                                        value={rollNum}
                                        error={!!rollNumError}
                                        helperText={rollNumError || "Click button to generate if new student."}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        sx={{ mr: 1, flexGrow: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleGenerateRollNumClick}
                                        disabled={rollNumLoading}
                                        startIcon={rollNumLoading ? <CircularProgress size={20} color="inherit" /> : <AutorenewIcon />}
                                        sx={{ height: '56px' }} // Match TextField height
                                    >
                                        {rollNumLoading ? "..." : "Generate"}
                                    </Button>
                                </Box>

                                {situation === "Student" && (
                                    <FormControl fullWidth required sx={{ mb: 2 }}>
                                        <InputLabel id="multi-class-label">Class</InputLabel>
                                        <Select
                                            labelId="multi-class-label"
                                            multiple
                                            value={selectedClasses}
                                            onChange={handleChange}
                                            renderValue={(selected) =>
                                                sclassesList
                                                    .filter((item) => selected.includes(item._id))
                                                    .map((item) => item.sclassName)
                                                    .join(', ')
                                            }
                                        >
                                            {sclassesList && sclassesList.length > 0 ? (
                                                sclassesList.map((classItem) => (
                                                    <MenuItem key={classItem._id} value={classItem._id}>
                                                        <Checkbox checked={selectedClasses.includes(classItem._id)} />
                                                        <ListItemText primary={classItem.sclassName} />
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No classes available</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>

                                )}
                                <TextField fullWidth required className="registerInput" label="Parent Contact" variant="outlined" type="tel" value={parentsContact} onChange={(event) => setPNum(event.target.value)} sx={{ mb: 2 }} inputProps={{ maxLength: 11 }} placeholder="03XXXXXXXXX" />
                                <TextField fullWidth required className="registerInput" label="Address" variant="outlined" multiline rows={3} value={address} onChange={(event) => setAddress(event.target.value)} sx={{ mb: 2 }} />
                                <Section title="Therapy Plan Fee Structure">
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="therapy-select-label">Select Therapy Plan *</InputLabel>
                                        <Select
                                            labelId="therapy-select-label"
                                            id="therapy-select"
                                            value={selectedTherapy}
                                            label="Select Therapy Plan *"
                                            onChange={(e) => setSelectedTherapy(e.target.value)}
                                        >
                                            {therapyFees.map((option, index) => (
                                                <MenuItem key={index} value={option.label}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {selectedTherapy && therapyFees.find(fee => fee.label === selectedTherapy) && (
                                        <>
                                            <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mb: 2, backgroundColor: '#f9f9f9' }}>
                                                {therapyFees
                                                    .filter(fee => fee.label === selectedTherapy)
                                                    .map((fee, index) => (
                                                        <div key={index}>
                                                            <Typography variant="subtitle1"><strong>Per Session:</strong> PKR {fee.perSession}/-</Typography>
                                                            <Typography variant="subtitle1"><strong>Per Month:</strong> PKR {fee.perMonth}/-</Typography>
                                                            {fee.note && <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>{fee.note}</Typography>}
                                                        </div>
                                                    ))}
                                            </Box>
                                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                                <Grid item xs={12} sm={4}><TextField fullWidth label="Admission Fees" type="number" value={feeDetails.admissionFee} onChange={(e) => setFeeDetails({ ...feeDetails, admissionFee: e.target.value })} /></Grid>
                                                <Grid item xs={12} sm={4}><TextField fullWidth label="Security Deposit" type="number" value={feeDetails.securityDeposit} onChange={(e) => setFeeDetails({ ...feeDetails, securityDeposit: e.target.value })} /></Grid>
                                                <Grid item xs={12} sm={4}><TextField fullWidth label="Other Charges" type="number" value={feeDetails.otherCharges} onChange={(e) => setFeeDetails({ ...feeDetails, otherCharges: e.target.value })} /></Grid>
                                            </Grid>
                                            <TextField fullWidth label="Total One-Time Charges" type="number" value={feeDetails.totalAmount} InputProps={{ readOnly: true }} variant="filled" />
                                        </>
                                    )}
                                </Section>
                                {/* Password field is commented out in original code
                                <TextField fullWidth required className="registerInput" label="Password" variant="outlined" type="password" value={password} onChange={(event) => setPassword(event.target.value)} sx={{ mb: 2 }} />
                                */}
                            </Grid>

                            {/* Right Column for Days, Time, Fee Structure, File Upload */}
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
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Student Classes Timing *
                                    </Typography>
                                    <FormControl fullWidth variant="outlined" required>
                                        <InputLabel id="class-time-label">Class Timing</InputLabel>
                                        <Select
                                            labelId="class-time-label"
                                            name="classTiming"
                                            value={selectedClassTiming}
                                            onChange={(e) => setSelectedClassTiming(e.target.value)}
                                            label="Class Timing"
                                        >
                                            <MenuItem value=""><em>Select Timing</em></MenuItem>
                                            {classTimings.map((time, idx) => (
                                                <MenuItem key={idx} value={time}>{time}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {timeError && (
                                        <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                                            Please select a class timing.
                                        </Typography>
                                    )}
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
                                    <Button variant="contained" component="label" fullWidth> Upload File <input type="file" hidden onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" /> </Button>
                                    {selectedFile && <Typography variant="body2" sx={{ mt: 1 }}>Selected: {selectedFile.name}</Typography>}
                                </Box>
                            </Grid>
                        </Grid>
                        <Button fullWidth className="registerButton" onClick={submitHandler} type="submit" variant="contained" color="primary" disabled={loader} sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}>
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
