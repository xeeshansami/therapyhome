import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InvoiceDialog from '../../components/InvoiceDialog'; // adjust path as needed
const AdminFees = () => {
  const formatTherapyFee = (amount) => {
    return amount ? `Rs. ${amount.toLocaleString()}` : 'N/A';
  };
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [isMonthlyFee, setIsMonthlyFee] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [state, setState] = useState({
    name: '',
    studentData: [],
    filteredData: [],
    error: '',
    errors: {},
    loading: false,
    openModal: false,
    selectedStudent: null,
    feeDetails: {
      date: new Date().toISOString().split('T')[0],
      paid: '',
      remark: '',
      totalFee: '',
      consultantFee: '',
      netAmount: '',
      paidFee: '',
      balance: ''
    }
  });

  const handleMonthlyFeeToggle = (event) => {
    const checked = event.target.checked;
    setIsMonthlyFee(checked);

    if (checked) {
      try {
        const plan = JSON.parse(state.selectedStudent?.therapyPlan || '{}');
        const perMonthCost = plan?.perMonthCost || 0;

        setState(prev => ({
          ...prev,
          feeDetails: {
            ...prev.feeDetails,
            netAmount: perMonthCost,
          },
        }));
      } catch (e) {
        console.error("Invalid therapyPlan JSON", e);
      }
    } else {
      // Reset or apply your own logic for netAmount here
      const admissionFee = 0; // replace with your default calculation if needed
      setState(prev => ({
        ...prev,
        feeDetails: {
          ...prev.feeDetails,
          netAmount: state.selectedStudent.totalFee,
        },
      }));
    }
  };
  const handleSearch = async () => {
    setState(prev => ({ ...prev, loading: true, error: '', studentData: [], filteredData: [] }));
    try {
      const payload = {
        id: "684166055d02df2c8772e55a",
        name: state.name,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/students/search`, payload
      );
      if (response.data?.length > 0) {
        debugger
        setState(prev => ({
          ...prev,
          studentData: response.data,
          filteredData: response.data,
          error: '',
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          studentData: [],
          filteredData: [],
          error: 'No students found with that name',
          loading: false
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        studentData: [],
        filteredData: [],
        error: 'Error fetching student data',
        loading: false
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  const handleOpenModal = (student) => {
    setState(prev => ({
      ...prev,
      openModal: true,
      selectedStudent: student,
      feeDetails: {
        ...prev.feeDetails,
        date: new Date().toISOString().split('T')[0],
        totalFee: student.totalFee,
        netAmount: student.totalFee,
        balance: student.totalFee
      }
    }));
  };

  const handleCallConsultancy = () => {
    navigate("/Admin/addConsultancy");
  };

  const handleSaveFee = () => {
    debugger
    const { feeDetails, selectedStudent } = state;
    const errors = {};

    if (!feeDetails.paid || feeDetails.paid < 0) {
        errors.paid = 'Paid Fee cannot be empty or negative';
    }
    if (feeDetails.paid > feeDetails.netAmount) {
        errors.paid = 'Paid Fee cannot be greater than Net Amount';
    }

    if (Object.keys(errors).length > 0) {
        setState(prev => ({ ...prev, errors }));
        return;
    }
    debugger
    const fields = {
        address: selectedStudent.address,
        adminID: '684166055d02df2c8772e55a',
        fatherName: selectedStudent.fatherName,
        name: selectedStudent.name,
        parentsContact: selectedStudent.parentsContact,
        isPaid: "1",
        role: 'Student',
        rollNum: selectedStudent.rollNum,
        date: feeDetails.date,
        netTotalFee: feeDetails.netAmount,
        paidFee: feeDetails.paid,
        sclassName: selectedStudent.sclassName,
        studentEmail: selectedStudent.studentEmail,
        isConsultancyOrIsRegistrationOrMonthly: isMonthlyFee?'2':'1',
    };

    axios.post(`${process.env.REACT_APP_BASE_URL}/StudentFeeReg`, fields, {
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        console.log('Fee details saved:', response.data);

        // Assuming the StudentFeeReg API response.data.data contains the rollNum
        const registeredStudentRollNum = response.data.rollNum; 

        if (registeredStudentRollNum) {
            // Step 2: Call the getSingleStudent API
            axios.get(`${process.env.REACT_APP_BASE_URL}/SingleStudent/${registeredStudentRollNum}`)
                .then(singleStudentResponse => {
                    if (singleStudentResponse.data && singleStudentResponse.data.length > 0) {
                        const fetchedStudentData = singleStudentResponse.data[0]; // Assuming it returns an array
                        
                        // Step 3: Merge the data
                        // Merge the fee registration response data with the fetched student data
                        const mergedInvoiceData = {
                            ...response.data, // Data from fee registration (e.g., receipt ID, fee specific details)
                            ...fetchedStudentData, // Full student details from SingleStudent API
                            // You can add more specific merging logic if needed, e.g.,
                            // overwrite existing fields from fee registration if fetchedStudentData is more up-to-date
                            // For example:
                            // name: fetchedStudentData.name,
                            // sclassName: fetchedStudentData.sclassName,
                            // etc.
                        };
                        debugger
                        setInvoiceData(mergedInvoiceData);
                        setShowPopup(true);
                        setIsSuccess(true);
                        setMessage("Fee Invoice Generated, Please Check Invoice Portal");
                        setState(prev => ({ ...prev, errors: {}, openModal: false }));

                    } else {
                        // Handle case where SingleStudent API finds no student
                        console.warn("SingleStudent API found no data for rollNum:", registeredStudentRollNum);
                        setInvoiceData(response.data.data); // Use only fee registration data as fallback
                        setShowPopup(true);
                        setIsSuccess(true);
                        setMessage("Fee Invoice Generated (partial data), Please Check Invoice Portal");
                        setState(prev => ({ ...prev, errors: {}, openModal: false }));
                    }
                })
                .catch(error => {
                    console.error('Error fetching single student details:', error);
                    // Fallback: If SingleStudent API fails, still proceed with initial fee data
                    setInvoiceData(response.data.data); 
                    setShowPopup(true);
                    setIsSuccess(true);
                    setMessage("Fee Invoice Generated (API error for full data), Please Check Invoice Portal");
                    setState(prev => ({ ...prev, errors: {}, openModal: false }));
                });
        } else {
            // If rollNum is not available from the first API, proceed with only its data
            console.warn("RollNum not available from StudentFeeReg response. Proceeding with limited data.");
            setInvoiceData(response.data.data);
            setShowPopup(true);
            setIsSuccess(true);
            setMessage("Fee Invoice Generated, Please Check Invoice Portal");
            setState(prev => ({ ...prev, errors: {}, openModal: false }));
        }
    })
    .catch(error => {
        setShowPopup(false);
        setIsSuccess(false);
        setMessage('Error saving fee details: ' + (error.response?.data?.message || error.message)); // More robust error message
        console.error('Error saving fee details:', error);
    });
};
  const handlePopupConfirm = () => {
    setShowPopup(false);
    // Assuming invoiceData is set correctly before this point
    // navigate('/Admin/Invoice'); // Original navigation
    setShowInvoice(true); // Show invoice dialog instead of navigating away immediately
  };
  const handleCloseModal = () => {
    setState(prev => ({ ...prev, error: '', openModal: false }));
  };


  const handleFeeDetailChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    setState(prev => {
      const updatedFeeDetails = { ...prev.feeDetails, [name]: numericValue };

      if (name === 'paid') {
        updatedFeeDetails.balance = updatedFeeDetails.netAmount - numericValue;
      }

      return { ...prev, feeDetails: updatedFeeDetails };
    });
  };

  const fetchAllStudents = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/AllStudents/684166055d02df2c8772e55a`
      );
      debugger
      setState(prev => ({
        ...prev,
        studentData: response.data,
        filteredData: response.data,
        loading: false,
        error: ''
      }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Error fetching all students data' }));
    }
  };

  const formatFee = (fee) => {
    if (!fee || fee === 'null' || fee === '') {
      return <span>0 <span style={{ color: 'green' }}>PKR</span></span>;
    }
    return <span>{fee} <span style={{ color: 'green' }}>PKR</span></span>;
  };

  return (
    <div style={{ maxWidth: '100%', margin: 'auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Student Fee Portal
      </Typography>

      <div style={{ display: 'flex', gap: '15px' }}>
        <TextField
          label="Search By Student Name"
          variant="outlined"
          value={state.name}
          onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
          onKeyPress={handleKeyPress}
          fullWidth
          margin="normal"
          InputProps={{
            style: {
              height: '56px',
            },
          }}
        />
      </div>

      {state.error && !state.loading && <div style={{ color: 'red', marginTop: '10px' }}>{state.error}</div>}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button
          variant="contained"
          disabled={state.loading}
          onClick={handleSearch}
          color="primary"
          startIcon={<SearchIcon />}
        >
          {state.loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
        </Button>

        <Button
          variant="contained"
          onClick={fetchAllStudents}
          color="primary"
          startIcon={<VisibilityIcon />}
        >
          Show All Students
        </Button>
      </div>

      {/* Outer conditional: Check if it's NOT in consultancy mode OR if there's data to show */}
      {!state.isConsultancyMode ? (
        // Case: Not in consultancy mode, display non-consultant students
        state.filteredData.filter(student => !student.isConsultantStudent).length > 0 ? (
          <TableContainer component={Paper} style={{ marginTop: '20px', border: '1px solid #ccc' }}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: '#f4f4f4' }}>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Roll Number</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Father's Name</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Parent Contact</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Fee Structure</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Days</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Per Monthly Fee</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Per Session Fee</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Admission Fees</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.filteredData.filter(student => !student.isConsultantStudent).map((student) => (
                  <TableRow key={student._id}>
                    <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>{student.rollNum}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.name}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.fatherName}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.parentsContact}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.feeStructure.join(', ')}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.days.join(', ')}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>
                      {student.therapyPlan ? JSON.parse(student.therapyPlan).perMonthCost : 'N/A'}
                    </TableCell>
                    <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>
                      {student.therapyPlan ? JSON.parse(student.therapyPlan).perSessionCost : 'N/A'}
                    </TableCell>
                    <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>
                      {formatFee(student.totalFee)}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={2}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenModal(student)}
                          disabled={student.status === 'Paid'}
                        >
                          Fee Issue
                        </Button>
                        {/* The commented-out button is kept as is */}
                        {/* <Button
                    variant="contained"
                    color="success"
                    onClick={handleCallConsultancy}
                    disabled={student.status === 'Paid'}
                  >
                    Consultancy
                  </Button> */}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Case: No non-consultant students found
          <Typography variant="h6" style={{ marginTop: '20px', textAlign: 'center' }}>
            No record found
          </Typography>
        )
      ) : (
        // Case: state.isConsultancyMode is true (always show "No record found" in this mode)
        <Typography variant="h6" style={{ marginTop: '20px', textAlign: 'center' }}>
          No record found
        </Typography>
      )}

      <Dialog open={state.openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Fee Report for {state.selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Student Info</Typography>
            <TextField label="Name" value={state.selectedStudent?.name || ''} fullWidth disabled />
            <TextField label="Father's Name" value={state.selectedStudent?.fatherName || ''} fullWidth disabled />
            <TextField label="Class" value={state.selectedStudent?.sclassName?.sclassName || ''} fullWidth disabled />
            <Typography variant="h6" style={{ marginTop: 20 }}>Fee Info</Typography>

            <FormControlLabel
              control={
                <Checkbox checked={isMonthlyFee} onChange={handleMonthlyFeeToggle} />
              }
              label="Monthly Fee"
            />

            <TextField
              label="Date"
              type="date"
              name="date"
              value={state.feeDetails.date}
              onChange={handleFeeDetailChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Paid Fee"
              type="number"
              name="paid"
              value={state.feeDetails.paid}
              onChange={handleFeeDetailChange}
              fullWidth
              error={!!state.errors.paid}
              helperText={state.errors.paid}
            />


            <TextField
              label="Net Amount"
              variant="outlined"
              value={state.feeDetails.netAmount}
              fullWidth
              disabled
              style={{ backgroundColor: '#f1f1f1', fontWeight: 'bold' }}
            />

            <TextField
              label="Balance"
              variant="outlined"
              value={state.feeDetails.balance}
              fullWidth
              disabled
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">Cancel</Button>
          <Button onClick={handleSaveFee} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      <InvoiceDialog open={showInvoice} onClose={() => setShowInvoice(false)} data={invoiceData} />
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
    </div>
  );
};

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

export default AdminFees;