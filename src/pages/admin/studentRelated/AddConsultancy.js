import React, { useState, useEffect } from 'react';
import { Box, Checkbox, TextField, Button, Typography, Paper, FormControlLabel, Grid, FormGroup, FormLabel, RadioGroup, Radio, FormControl, CircularProgress } from '@mui/material';
import { Select, MenuItem, InputLabel } from '@mui/material';
import logo from "../../../assets/logo.png"; // Assuming you have a logo image
// import { consultancyRegister } from '../../../redux/userRelated/userHandle'; // Not used in the provided snippet
// import { useDispatch, useSelector } from 'react-redux'; // Not used in the provided snippet
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InvoiceDialog from './../../../components/InvoiceDialog'; // adjust path as needed

const AddConsultancy = () => {
    const navigate = useNavigate();
    // const dispatch = useDispatch(); // Not used
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    // const [phone, setPhone] = useState(''); // Redundant if maxLength is used and validation targets formData
    const [selectedTherapy, setSelectedTherapy] = useState('');
    const [cnicError, setCNICError] = useState('');
    // const [cnic, setCNIC] = useState(''); // Redundant

    const [generatedRollNum, setGeneratedRollNum] = useState('Loading...');
    const [rollNumError, setRollNumError] = useState('');


    const [feeDetails, setFeeDetails] = useState({
        admissionFee: 5000,
        securityDeposit: 5000,
        consultancy: 1000,
        totalAmount: 11000,
    });

    useEffect(() => {
        const { admissionFee, securityDeposit, consultancy } = feeDetails;
        const total =
            Number(admissionFee || 0) +
            Number(securityDeposit || 0) +
            Number(consultancy || 0);

        setFeeDetails(prev => ({
            ...prev,
            totalAmount: total
        }));
    }, [feeDetails.admissionFee, feeDetails.securityDeposit, feeDetails.consultancy]);

    // Fetch the next roll number when the component mounts
    useEffect(() => {
        const fetchNextRollNum = async () => {
            try {
                setRollNumError(''); // Clear previous errors
                // This endpoint needs to be created on your backend
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/GenerateNextRollNum`);
                if (response.data && response.data.rollNum) {
                    setGeneratedRollNum(response.data.rollNum);
                } else {
                    // Fallback if backend doesn't return expected format or if there's an issue
                    setGeneratedRollNum('THS001'); // Default or indicate an issue
                    console.warn("Could not fetch next roll number, or format was unexpected. Defaulting or showing error.");
                    setRollNumError('Could not generate roll number automatically. Defaulting to THS001.');
                }
            } catch (error) {
                console.error("Error fetching next roll number:", error);
                setGeneratedRollNum('Error'); // Show an error state
                setRollNumError('Failed to fetch roll number. Please check network or try again.');
            }
        };
        fetchNextRollNum();
    }, []);


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

    const [formData, setFormData] = useState({
        student: {
            name: '',
            age: '',
            dob: '',
            gender: '' // Set initial to empty string for placeholder to work
        },
        medicalHistory: {
            diagnosis: false,
            diagnosisDetails: '',
            therapies: false,
            therapiesDetails: '',
            medication: false,
            medicationDetails: ''
        },
        therapiesSeeking: {
            speech: false,
            behavior: false,
            occupational: false,
            remedial: false,
            additional: false,
            specific: ''
        },
        school: {
            attends: false,
            details: ''
        },
        parent: {
            name: '',
            parentsContact: '', // Field name used in validation and payload
            parentsCNIC: '',    // Field name used in validation and payload
            profession: '',
            address: ''
        },
        reference: { // This section was in initial formData but not used in inputs/payload
            type: '',
            details: ''
        },
        // Therapy specific questions
        speechQuestions: { q1: '', q2: '', q3: '' },
        behaviorQuestions: { q1: '', q2: '', q3: '' },
        occupationalQuestions: { q1: '', q2: '' },
        remedialQuestions: { q1: '', q2: '' },
        additionalQuestions: { q1: '', q2: '' },
        acceptedTerms: false, // Added for terms and conditions
    });

    const handlePopupConfirm = () => {
        setShowPopup(false);
        // Assuming invoiceData is set correctly before this point
        // navigate('/Admin/Invoice'); // Original navigation
        setShowInvoice(true); // Show invoice dialog instead of navigating away immediately
    };
    const handleTopLevelCheckboxChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.checked
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        // Terms acceptance already checked in validateForm

        if (generatedRollNum === 'Loading...' || generatedRollNum === 'Error' || rollNumError) {
            alert('Roll number is not properly generated. Please wait or refresh.');
            return;
        }

        const { student, medicalHistory, therapiesSeeking, school, parent, speechQuestions, behaviorQuestions, occupationalQuestions, remedialQuestions, additionalQuestions } = formData;
        const selectedTherapyObject = therapyFees.find(
            fee => fee.label === selectedTherapy
        );

        const payload = {
            name: student.name,
            dob: student.dob,
            gender: student.gender,
            age: student.age,
            rollNum: generatedRollNum, // Include the generated roll number
            feePaymentDate: new Date(),
            paidFee:true,
            diagnosis: medicalHistory.diagnosis,
            diagnosisDetails: medicalHistory.diagnosis ? medicalHistory.diagnosisDetails : '', // Send undefined if not applicable
            therapies: medicalHistory.therapies, // This is the boolean from checkbox
            therapiesDetails: medicalHistory.therapies ? medicalHistory.therapiesDetails : '', // This is the text detail
            medication: medicalHistory.medication,
            medicationDetails: medicalHistory.medication ? medicalHistory.medicationDetails : '',

            // Therapies seeking booleans
            speechTherapy: therapiesSeeking.speech, // Align with merged schema boolean fields
            behaviorTherapy: therapiesSeeking.behavior,
            occupationalTherapy: therapiesSeeking.occupational,
            remedialTherapy: therapiesSeeking.remedial,
            // 'additional' might map to a specific field or be part of 'specificLearningDisabilitiesSupport'
            // For now, let's assume 'specific' text field covers details for 'additional' if checked.
            specificLearningDisabilitiesSupport: therapiesSeeking.additional, // Example mapping
            specificTherapiesDetails: therapiesSeeking.specific, // Was 'specific'
            studentEmail:"info@gmail.com",
            attendsSchoolElsewhere: school.attends,
            schoolElsewhereDetails: school.attends ? school.details : '',
            "sclassName": "6841d62692080ba4520a3a66",
            "school": "684166055d02df2c8772e55a",
            parentName: parent.name, // This should be parent.name from form
            // fatherName: parent.name, // If parent.name is specifically father's name, otherwise distinguish
            parentsContact: parent.parentsContact,
            parentsCNIC: parent.parentsCNIC,
            parentProfession: parent.profession,
            parentAddress: parent.address,
            // referenceType: formData.reference.type, // If reference fields are used
            // referenceDetails: formData.reference.details,

            // Fee details
            admissionFee: feeDetails.admissionFee,
            securityDeposit: feeDetails.securityDeposit,
            consultancyFeeAmount: feeDetails.consultancy, // Align with merged schema
            totalFee: feeDetails.totalAmount, // Align with merged schema (totalFee or netTotalFee)

            therapyPlan: selectedTherapyObject ? { // Ensure selectedTherapyObject exists
                label: selectedTherapyObject.label,
                perSessionCost: selectedTherapyObject.perSession,
                perMonthCost: selectedTherapyObject.perMonth,
                notes: selectedTherapyObject.note,
            } : '',

            // Include therapy-specific question answers if needed by backend
            speechQuestions,
            behaviorQuestions,
            occupationalQuestions,
            remedialQuestions,
            additionalQuestions,
        };

        console.log("Submitting payload:", payload);
        setLoader(true);
        try {
            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/StudentConsultancy`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            // debugger; // Keep for debugging if needed
            if (result.data.status === "00") {
                setMessage("Student consultancy added successfully! Please generate invoice.");
                setInvoiceData(result.data.data); // Assuming backend returns the full student data including the saved rollNum
                setIsSuccess(true);
                // setShowInvoice(true); // Show invoice directly after successful submission
                setShowPopup(true); // Show success popup first, then invoice via popup confirm
            } else {
                setMessage("Form submission failed: " + (result.data.message || "Unknown error from server."));
                setIsSuccess(false);
                setShowPopup(true);
            }
        } catch (error) {
            debugger
            setMessage("Server Error: " + (error.response?.data?.message +" Server" || error.message +" Exception" || "Network error."));
            setIsSuccess(false);
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    }

    const handleChange = (section, field) => (e) => {
        const { value, type } = e.target;

        if (section === 'parent' && field === 'parentsContact') {
            if (value && !value.startsWith('03')) {
                setPhoneError('Phone number must start with "03"');
            } else if (value && value.length > 11) {
                // Prevent further input if length exceeds 11
                return;
            }
            else {
                setPhoneError('');
            }
        }

        if (section === 'parent' && field === 'parentsCNIC') {
            if (value && value.length > 13) {
                // Prevent further input if length exceeds 13
                return;
            }
            if (!value) {
                setCNICError('CNIC number must be entered');
            } else {
                setCNICError('');
            }
        }

        // For age field, allow only numbers and max length 2
        if (section === 'student' && field === 'age') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: numericValue.slice(0, 2) }
            }));
            return; // Return early after handling age specifically
        }


        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleCheckbox = (section, field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: e.target.checked }
        }));
    };

    const isEmpty = (value) => value === null || value === undefined || value.toString().trim() === '';

    const validateForm = () => {
        const { student, parent, medicalHistory, therapiesSeeking, school, acceptedTerms } = formData;

        if (isEmpty(student.name) || isEmpty(student.age) || isEmpty(student.dob) || isEmpty(student.gender)) {
            alert('Please complete all student details (Name, Age, DOB, Gender).');
            return false;
        }
        if (isEmpty(parent.name) || isEmpty(parent.parentsContact) || isEmpty(parent.parentsCNIC) || isEmpty(parent.profession) || isEmpty(parent.address)) {
            alert('Please complete all parent/guardian details.');
            return false;
        }
        if (!parent.parentsContact.startsWith('03') || parent.parentsContact.length !== 11) {
            alert('Parent contact must start with 03 and be 11 digits.');
            setPhoneError('Parent contact must start with 03 and be 11 digits.');
            return false;
        } else {
            setPhoneError('');
        }
        if (parent.parentsCNIC.length !== 13) {
            alert('Parent CNIC must be 13 digits.');
            setCNICError('Parent CNIC must be 13 digits.');
            return false;
        } else {
            setCNICError('');
        }
        if (medicalHistory.diagnosis && isEmpty(medicalHistory.diagnosisDetails)) {
            alert('Please provide diagnosis details if "Doctor diagnosed any condition" is checked.');
            return false;
        }
        if (medicalHistory.therapies && isEmpty(medicalHistory.therapiesDetails)) {
            alert('Please provide previous therapies details if "Taken any therapies before" is checked.');
            return false;
        }
        if (medicalHistory.medication && isEmpty(medicalHistory.medicationDetails)) {
            alert('Please provide medication details if "Child currently on any medication" is checked.');
            return false;
        }
        const anyTherapySelected = Object.values(therapiesSeeking).some(value => typeof value === 'boolean' ? value : !isEmpty(value)); // Check boolean flags and 'specific' text
        if (!anyTherapySelected && isEmpty(therapiesSeeking.specific)) { // If no checkbox true and specific is empty
            // Check if at least one therapy checkbox is true
            const therapyCheckboxes = ['speech', 'behavior', 'occupational', 'remedial', 'additional'];
            const atLeastOneTherapyChecked = therapyCheckboxes.some(therapy => therapiesSeeking[therapy]);
            if (!atLeastOneTherapyChecked) {
                alert('Please select at least one therapy from the checkboxes.');
                return false;
            }
        }
        if (school.attends && isEmpty(school.details)) {
            alert('Please provide school details if "Child attend school" is checked.');
            return false;
        }
        if (isEmpty(selectedTherapy)) {
            alert('Please select a therapy plan from the dropdown.');
            return false;
        }
        if (!acceptedTerms) {
            alert('You must accept the Terms & Conditions.');
            return false;
        }
        return true;
    };

    return (
        <Box sx={{ padding: { xs: 1, sm: 2, md: 3 }, maxWidth: 800, margin: 'auto' }}>
            <Paper elevation={3} sx={{ padding: { xs: 1, sm: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box component="img" src={logo} alt="Logo" sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, mr: { sm: 2 }, mb: { xs: 1, sm: 0 } }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', color: 'primary.main', borderBottom: '4px solid', borderColor: 'primary.light', fontSize: { xs: '20px', sm: '25px' }, pb: 0.5, textAlign: 'center' }}>
                        THERAPY HOME Consultancy Form
                    </Typography>
                </Box>

                {/* Generated Roll Number Display */}
                <TextField
                    fullWidth
                    label="Generated Roll Number"
                    value={generatedRollNum}
                    InputProps={{
                        readOnly: true,
                        startAdornment: generatedRollNum === 'Loading...' ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null,
                    }}
                    error={!!rollNumError}
                    helperText={rollNumError}
                    sx={{ mb: 2 }}
                    variant="filled"
                />

                {/* Student Details */}
                <Section title="Student Details">
                    <TextField fullWidth label="Full Name" sx={{ mb: 2 }} onChange={handleChange('student', 'name')} value={formData.student.name} />
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Age"
                                type="text" // Changed to text to use custom replace logic
                                value={formData.student.age}
                                onChange={handleChange('student', 'age')}
                                inputProps={{ maxLength: 2 }} // Visual length limit
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                onChange={handleChange('student', 'dob')}
                                value={formData.student.dob}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel id="gender-select-label">Gender</InputLabel>
                                <Select
                                    labelId="gender-select-label"
                                    value={formData.student.gender}
                                    label="Gender"
                                    onChange={handleChange('student', 'gender')}
                                >
                                    <MenuItem value="" disabled><em>Select Gender</em></MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Section>

                {/* Medical History Section */}
                <Section title="Medical History">
                    <Question
                        label="1. Did a doctor diagnose any condition?"
                        checked={formData.medicalHistory.diagnosis}
                        onChange={handleCheckbox('medicalHistory', 'diagnosis')}
                        details={formData.medicalHistory.diagnosisDetails}
                        onDetailsChange={handleChange('medicalHistory', 'diagnosisDetails')}
                    />
                    <Question
                        label="2. Have you taken any therapies before?"
                        checked={formData.medicalHistory.therapies}
                        onChange={handleCheckbox('medicalHistory', 'therapies')}
                        details={formData.medicalHistory.therapiesDetails}
                        onDetailsChange={handleChange('medicalHistory', 'therapiesDetails')}
                    />
                    <Question
                        label="3. Is the child currently on any medication?"
                        checked={formData.medicalHistory.medication}
                        onChange={handleCheckbox('medicalHistory', 'medication')}
                        details={formData.medicalHistory.medicationDetails}
                        onDetailsChange={handleChange('medicalHistory', 'medicationDetails')}
                    />
                </Section>

                <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>Consultant Recommendation:</Typography>
                <Section title="Therapies Seeking">
                    <Typography variant="body1" gutterBottom>
                        4. Which therapies are you seeking for?
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        {['Speech', 'Behavior', 'Occupational', 'Remedial', 'Additional'].map((therapy) => (
                            <Grid item xs={6} sm={4} md={2.4} key={therapy}> {/* Adjusted for 5 items */}
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.therapiesSeeking[therapy.toLowerCase()]}
                                            onChange={handleCheckbox('therapiesSeeking', therapy.toLowerCase())}
                                        />
                                    }
                                    label={`${therapy} Therapy`}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    <TextField
                        fullWidth
                        label="Any specific requirements for therapies (e.g., details for 'Additional')"
                        value={formData.therapiesSeeking.specific}
                        onChange={handleChange('therapiesSeeking', 'specific')}
                        multiline
                        rows={3}
                    />
                </Section>

                {/* Conditional Therapy Questions Sections */}
                {formData.therapiesSeeking.speech && (
                    <TherapyQuestionSection title="Speech Therapy Questions" questions={formData.speechQuestions} sectionName="speechQuestions" onChange={setFormData}
                        questionTexts={{ q1: "1. Does the child have any difficulty pronouncing words?", q2: "2. Is there any stuttering or fluency problem?", q3: "3. Does the child follow and understand simple instruction?" }} />
                )}
                {formData.therapiesSeeking.behavior && (
                    <TherapyQuestionSection title="Behavior Therapy Questions" questions={formData.behaviorQuestions} sectionName="behaviorQuestions" onChange={setFormData}
                        questionTexts={{ q1: "1. Does the child have any behavior concerns like TANTRUMS, AGGRESSION, ANXIETY?", q2: "2. Has the child been diagnosed with AUTISM, ADHD, or any other developmental disorder?", q3: "3. Is the child facing social interaction challenges?" }} />
                )}
                {formData.therapiesSeeking.occupational && (
                    <TherapyQuestionSection title="Occupational Therapy Questions" questions={formData.occupationalQuestions} sectionName="occupationalQuestions" onChange={setFormData}
                        questionTexts={{ q1: "1. Does the child have any difficulties with daily activities like dressing, feeding, swallowing, and motor coordination?", q2: "2. Does the child have any sensory issues?" }} />
                )}
                {formData.therapiesSeeking.remedial && (
                    <TherapyQuestionSection title="Remedial Therapy Questions" questions={formData.remedialQuestions} sectionName="remedialQuestions" onChange={setFormData}
                        questionTexts={{ q1: "1. Are there any difficulties in learning, reading, writing & remembering?", q2: "2. Is the child receiving any special education services?" }} />
                )}
                {formData.therapiesSeeking.additional && (
                    <TherapyQuestionSection title="Additional Program Therapy Questions" questions={formData.additionalQuestions} sectionName="additionalQuestions" onChange={setFormData}
                        questionTexts={{ q1: "1. Inclusive Education Program (I.E.P)?", q2: "2. Fun & Learn (F&L)?" }} />
                )}


                <Section title="Other Information">
                    <Question
                        label="1. Does the child attend school elsewhere?"
                        checked={formData.school.attends}
                        onChange={handleCheckbox('school', 'attends')}
                        details={formData.school.details}
                        onDetailsChange={handleChange('school', 'details')}
                        detailsLabel="If yes, please provide school name and class."
                    />
                </Section>

                <Section title="Parent/Guardian Details">
                    <TextField fullWidth label="Full Name" sx={{ mb: 2 }} onChange={handleChange('parent', 'name')} value={formData.parent.name} />
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField fullWidth required label="Contact" onChange={handleChange('parent', 'parentsContact')}
                                value={formData.parent.parentsContact}
                                inputProps={{ maxLength: 11, type: "tel" }}
                                error={Boolean(phoneError)}
                                helperText={phoneError} placeholder='03XXXXXXXXX' />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField fullWidth required label="CNIC" placeholder='4240123456789' type="tel"
                                value={formData.parent.parentsCNIC}
                                error={Boolean(cnicError)}
                                inputProps={{ maxLength: 13 }}
                                helperText={cnicError}
                                onChange={handleChange('parent', 'parentsCNIC')} />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <TextField fullWidth label="Profession" onChange={handleChange('parent', 'profession')} value={formData.parent.profession} />
                        </Grid>
                    </Grid>
                    <TextField fullWidth multiline rows={3} label="Complete Address" sx={{ mb: 2 }} onChange={handleChange('parent', 'address')} value={formData.parent.address} />

                    {/* Reference Section - Simplified */}
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Reference (How did you hear about us?)</Typography>
                    <TextField fullWidth label="Reference Details (e.g., Online, Doctor Name, Other)"
                        onChange={handleChange('reference', 'details')} value={formData.reference.details} />
                </Section>

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
                                <Grid item xs={12} sm={4}><TextField fullWidth label="Consultancy Charges" type="number" value={feeDetails.consultancy} onChange={(e) => setFeeDetails({ ...feeDetails, consultancy: e.target.value })} /></Grid>
                            </Grid>
                            <TextField fullWidth label="Total One-Time Charges" type="number" value={feeDetails.totalAmount} InputProps={{ readOnly: true }} variant="filled" />
                        </>
                    )}
                </Section>

                <FormControlLabel
                    control={<Checkbox
                        checked={formData.acceptedTerms || false} // Ensure it's controlled
                        onChange={handleTopLevelCheckboxChange('acceptedTerms')} // Corrected onChange
                        name="acceptedTerms"
                    />}
                    label={<>I agree to the{' '}<Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => window.open("/terms", "_blank")}>Terms & Conditions</Typography> *</>}
                    sx={{ mt: 2, mb: 2 }}
                />

                <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2, py: 1.5 }} onClick={handleSubmit} disabled={loader}>
                    {loader ? <CircularProgress size={24} color="inherit" /> : "Submit Form & Proceed"}
                </Button>

                {showPopup && (
                    <div className="custom-popup-overlay" style={popupOverlayStyle}>
                        <div className="custom-popup" style={popupStyle}>
                            <h2 style={{ color: isSuccess ? 'green' : 'red' }}>{isSuccess ? "Success!" : "Error"}</h2>
                            <p>{message}</p>
                            <Button variant="contained" onClick={isSuccess ? handlePopupConfirm : () => setShowPopup(false)}>
                                {isSuccess ? "Generate Invoice" : "Close"}
                            </Button>
                        </div>
                    </div>
                )}
                <InvoiceDialog open={showInvoice} onClose={() => setShowInvoice(false)} data={invoiceData} />
            </Paper>
        </Box>
    );
};

// Helper component for sections to maintain consistency
const Section = ({ title, children }) => (
    <Box component="fieldset" sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 3 }}>
        <Typography component="legend" variant="h6" sx={{ px: 1, fontWeight: 'bold', color: 'primary.main' }}>
            {title}
        </Typography>
        {children}
    </Box>
);

// Helper component for checkbox questions with conditional details TextField
const Question = ({ label, checked, onChange, details, onDetailsChange, detailsLabel = "If yes, please provide details:" }) => (
    <Box sx={{ mb: 2 }}>
        <FormControlLabel control={<Checkbox checked={checked} onChange={onChange} />} label={label} />
        {checked && (
            <TextField fullWidth multiline rows={2} label={detailsLabel} sx={{ mt: 1 }} value={details} onChange={onDetailsChange} variant="outlined" size="small" />
        )}
    </Box>
);

// Helper component for therapy-specific radio button questions
const TherapyQuestionSection = ({ title, questions, sectionName, onChange, questionTexts }) => (
    <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2} sx={{ mb: 2, backgroundColor: '#fcfcfc' }}>
        <Typography variant="h6" fontWeight="500" sx={{ mb: 1, color: 'secondary.main' }}>{title}</Typography>
        {Object.keys(questionTexts).map((key) => (
            <FormControl key={key} fullWidth sx={{ mt: 1.5, mb: 1 }}>
                <FormLabel component="legend" sx={{ fontSize: '0.9rem', color: '#555' }}>{questionTexts[key]}</FormLabel>
                <RadioGroup row value={questions?.[key] || ""}
                    onChange={(e) => onChange(prev => ({ ...prev, [sectionName]: { ...prev[sectionName], [key]: e.target.value } }))}
                >
                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                    {/* Add 'Sometimes' or 'Not Applicable' if needed */}
                </RadioGroup>
            </FormControl>
        ))}
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


export default AddConsultancy;
