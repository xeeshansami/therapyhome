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
  Box,
  // Make sure to import FormControl and FormLabel if you use them
  FormControl,
  FormLabel
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
  const [generatedInvoiceNo, setGeneratedInvoiceNo] = useState('Loading...');
  const [invoiceNoError, setInvoiceNoError] = useState('');
  const [loader, setLoader] = useState(false);
  const [state, setState] = useState({
    name: '',
    rollNum: '',         // Added for Roll Number search
    parentsContact: '',  // Added for Parents Contact search
    showNameSearch: true,     // New: Controls visibility of Name search field
    showRollNumSearch: false, // New: Controls visibility of Roll Number search field
    showParentsContactSearch: false, // New: Controls visibility of Parents Contact search field
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
  const fetchNextInvoiceNo = async () => {
    try {
      setLoader(true);
      setInvoiceNoError(''); // Clear previous errors
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/invoices/next-number`);
      if (response.data && response.data.invoiceNum) {
        setGeneratedInvoiceNo(response.data.invoiceNum);
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

  // New handler for checkbox changes
  const handleCheckboxChange = (field) => (event) => {
    const checked = event.target.checked;
    setState(prev => {
      const newState = {
        ...prev,
        [`show${field}Search`]: checked // Toggle the visibility state (e.g., showNameSearch)
      };
      // If a checkbox is unchecked, clear the corresponding input field's value
      if (!checked) {
        if (field === 'Name') newState.name = '';
        if (field === 'RollNum') newState.rollNum = '';
        if (field === 'ParentsContact') newState.parentsContact = '';
      }
      return newState;
    });
  };

  const handleSearch = async () => {
        setState(prev => ({ ...prev, loading: true, error: '', studentData: [], filteredData: [] }));
        
        const { searchBy, name, rollNum, parentsContact } = state;
        const payload = { id: "684166055d02df2c8772e55a" };
        let searchValue = '';

        // Determine which value to use based on the selected filter
        if (searchBy === 'Name') {
            payload.name = name;
            searchValue = name;
        } else if (searchBy === 'RollNum') {
            payload.rollNum = rollNum;
            searchValue = rollNum;
        } else if (searchBy === 'ParentsContact') {
            payload.parentsContact = parentsContact;
            searchValue = parentsContact;
        }

        if (!searchValue.trim()) {
            setState(prev => ({ ...prev, error: 'Please enter a value to search.', loading: false }));
            return;
        }

        try {
            // Replace mockApi with your actual axios.post call
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/students/search`, payload);
            
            if (response.data?.length > 0) {
                const sortedData = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setState(prev => ({ ...prev, studentData: sortedData, filteredData:sortedData, error: '', loading: false }));
            } else {
                setState(prev => ({ ...prev, studentData: [], filteredData: [], error: 'No students found matching the criteria.', loading: false }));
            }
        } catch (err) {
            setState(prev => ({ ...prev, studentData: [], filteredData: [], error: 'Error fetching student data.', loading: false }));
        }
    };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenModal = async (student) => {
    await fetchNextInvoiceNo();
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

  const handleSaveFee = async () => {
    // debugger // Keep or remove debugger as needed
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

    // debugger // Keep or remove debugger as needed
    const fields = {
      address: selectedStudent.address,
      adminID: '684166055d02df2c8772e55a',
      parentsName: selectedStudent.parentsName,
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
      isConsultancyOrIsRegistrationOrMonthly: isMonthlyFee ? '2' : '1',
      invoiceID: generatedInvoiceNo, // Use the schema's field name 'invoiceID'
    };
    debugger
    axios.post(`${process.env.REACT_APP_BASE_URL}/StudentFeeReg`, fields, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        console.log('Fee details saved:', response.data);
        debugger
        const registeredStudentRollNum = response.data.rollNum;

        if (registeredStudentRollNum) {
          axios.get(`${process.env.REACT_APP_BASE_URL}/SingleStudent/${registeredStudentRollNum}`)
            .then(singleStudentResponse => {
              if (singleStudentResponse.data && singleStudentResponse.data.length > 0) {
                const fetchedStudentData = singleStudentResponse.data[0];
                const mergedInvoiceData = {
                  ...response.data,
                  ...fetchedStudentData,
                };
                // debugger // Keep or remove debugger as needed
                setInvoiceData(mergedInvoiceData);
                setShowPopup(true);
                setIsSuccess(true);
                setMessage("Fee Invoice Generated, Please Check Invoice Portal");
                setState(prev => ({ ...prev, errors: {}, openModal: false }));

              } else {
                console.warn("SingleStudent API found no data for rollNum:", registeredStudentRollNum);
                setInvoiceData(response.data.data);
                setShowPopup(true);
                setIsSuccess(true);
                setMessage("Fee Invoice Generated (partial data), Please Check Invoice Portal");
                setState(prev => ({ ...prev, errors: {}, openModal: false }));
              }
            })
            .catch(error => {
              console.error('Error fetching single student details:', error);
              setInvoiceData(response.data.data);
              setShowPopup(true);
              setIsSuccess(true);
              setMessage("Fee Invoice Generated (API error for full data), Please Check Invoice Portal");
              setState(prev => ({ ...prev, errors: {}, openModal: false }));
            });
        } else {
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
        setMessage('Error saving fee details: ' + (error.response?.data?.message || error.message));
        console.error('Error saving fee details:', error);
      });
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    setShowInvoice(true);
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
 // New handler for the single-select checkbox group
    const handleFilterChange = (filterName) => {
        setState(prev => ({
            ...prev,
            searchBy: filterName,
            // Clear input fields when changing filter type for a better UX
            name: '',
            rollNum: '',
            parentsContact: '',
            error: ''
        }));
    };
    
  const fetchAllStudents = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/AllStudents/684166055d02df2c8772e55a`
      );
      // debugger // Keep or remove debugger as needed
       const sortedData = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setState(prev => ({
        ...prev,
        studentData: sortedData,
        filteredData: sortedData,
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

      {/* Checkboxes for search criteria - UPDATED */}
      <FormControl component="fieldset" margin="normal">
        <FormLabel component="legend">Search By:</FormLabel>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Checkbox checked={state.searchBy === 'Name'} onChange={() => handleFilterChange('Name')} />}
            label="Student Name"
          />
          <FormControlLabel
            control={<Checkbox checked={state.searchBy === 'RollNum'} onChange={() => handleFilterChange('RollNum')} />}
            label="Roll Number"
          />
          <FormControlLabel
            control={<Checkbox checked={state.searchBy === 'ParentsContact'} onChange={() => handleFilterChange('ParentsContact')} />}
            label="Parent Contact"
          />
        </Box>
      </FormControl>

      {/* Conditional rendering of TextFields - UPDATED */}
      <Box sx={{ mt: 2, maxWidth: '500px' }}>
        {state.searchBy === 'Name' && (
          <TextField
            label="Enter Student Name"
            variant="outlined"
            value={state.name}
            onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
            onKeyPress={handleKeyPress}
            fullWidth
          />
        )}
        {state.searchBy === 'RollNum' && (
          <TextField
            label="Enter Roll Number"
            variant="outlined"
            value={state.rollNum}
            onChange={(e) => setState(prev => ({ ...prev, rollNum: e.target.value }))}
            onKeyPress={handleKeyPress}
            fullWidth
          />
        )}
        {state.searchBy === 'ParentsContact' && (
          <TextField
            label="Enter Parent Contact"
            variant="outlined"
            value={state.parentsContact}
            onChange={(e) => setState(prev => ({ ...prev, parentsContact: e.target.value }))}
            onKeyPress={handleKeyPress}
            fullWidth
          />
        )}
      </Box>

      {state.error && !state.loading && <Typography color="error" sx={{ mt: 2 }}>{state.error}</Typography>}

      <Box sx={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button variant="contained" disabled={state.loading} onClick={handleSearch} startIcon={<SearchIcon />}>
          {state.loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
        <Button variant="contained" onClick={fetchAllStudents} startIcon={<VisibilityIcon />}>
          Show All Students
        </Button>
      </Box>

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
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Parent's Name</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Parent Contact</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Consultancy Date</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Admission Date</TableCell>
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
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.parentsName}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.parentsContact}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.consultancyDate}</TableCell>
                    <TableCell style={{ border: '1px solid #ccc' }}>{student.admissionDate}</TableCell>
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
            <TextField label="Parent's Name" value={state.selectedStudent?.parentsName || ''} fullWidth disabled />
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