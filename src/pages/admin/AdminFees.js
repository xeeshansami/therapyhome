import React, { useState, useEffect } from 'react';
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
  FormControl,
  FormLabel,
  Divider
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InvoiceDialog from '../../components/InvoiceDialog'; // Adjust path as needed

// --- Helper Components & Functions ---

const CustomPopup = ({ open, success, message, onConfirm, onClose }) => {
  if (!open) return null;
  const popupOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1301,
  };
  const popupStyle = {
    background: 'white', padding: '25px 40px', borderRadius: '10px',
    textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.25)',
    minWidth: '320px', maxWidth: '500px',
  };
  return (
    <div style={popupOverlayStyle}>
      <div style={popupStyle}>
        <h2 style={{ color: success ? '#2e7d32' : '#d32f2f', marginTop: 0 }}>{success ? "Success!" : "Error"}</h2>
        <p>{message}</p>
        <Button variant="contained" color={success ? 'success' : 'primary'} onClick={success ? onConfirm : onClose}>
          {success ? "View Invoice" : "Close"}
        </Button>
      </div>
    </div>
  );
};

// --- Main Component ---

const AdminFees = () => {
  const navigate = useNavigate();

  // UI Control States
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedInvoiceNo, setGeneratedInvoiceNo] = useState('');

  // Main Component State
  const [state, setState] = useState({
    searchBy: 'Name',
    name: '',
    rollNum: '',
    parentContact: '',
    studentData: [],
    filteredData: [],
    error: '',
    errors: {},
    loading: false,
    openModal: false,
    selectedStudent: null,
    isMonthlyFee: false,
    feeDetails: {
      date: new Date().toISOString().split('T')[0],
      paid: '',
      remark: '',
      netAmount: 0,
      balance: 0,
      classFees: [], 
    },
  });

  // --- API & Data Fetching ---

  const fetchNextInvoiceNo = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/invoices/next-number`);
      setGeneratedInvoiceNo(response.data?.invoiceNum || `THS${Date.now()}`);
    } catch (error) {
      console.error("Error fetching next invoice number:", error);
      setGeneratedInvoiceNo(`Error-${Date.now()}`);
    }
  };

  const fetchStudents = async (searchPayload = null) => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const url = searchPayload 
        ? `${process.env.REACT_APP_BASE_URL}/students/search`
        : `${process.env.REACT_APP_BASE_URL}/AllStudents/68946290703454aaf4bae0de`;
      const method = searchPayload ? 'post' : 'get';
      const response = await axios[method](url, searchPayload);
      
      const data = response.data?.length > 0 ? response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setState(prev => ({ ...prev, studentData: data, filteredData: data, loading: false, error: data.length === 0 ? 'No students found.' : '' }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Error fetching student data.' }));
    }
  };

  // --- Fee Calculation Logic ---

  const calculateNetAmount = (classFees, isMonthly, student) => {
    // **MODE 1: Admission Fee** (Monthly checkbox is unchecked)
    // The net amount is simply the student's total admission fee.
    if (!isMonthly) {
      return student?.totalFee || 0;
    }

    // **MODE 2: Monthly Fee** (Monthly checkbox is checked)
    // The net amount is the sum of the monthly plan and all class fees.
    let total = 0;
    
    // Start with the base monthly fee from the therapy plan
    const plan = JSON.parse(student?.therapyPlan || '{}');
    total += plan?.perMonthCost || 0;

    // Add costs from all session and program classes
    classFees.forEach(item => {
      if (item.type === 'Session') {
        total += (item.numberOfSessions * item.fee);
      } else { // 'Program' or other fixed-fee types
        total += item.fee;
      }
    });
    
    return total;
  };

  // --- Event Handlers ---

  const handleSearch = () => {
    const { searchBy, name, rollNum, parentContact } = state;
    const payload = { id: "68946290703454aaf4bae0de" };
    let searchValue = '';
    if (searchBy === 'Name') {
      payload.name = name;
      searchValue = name;
    } else if (searchBy === 'RollNum') {
      payload.rollNum = rollNum;
      searchValue = rollNum;
    } else if (searchBy === 'ParentContact') {
      payload.parentContact = parentContact;
      searchValue = parentContact;
    }
    if (!searchValue.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a value to search.' }));
      return;
    }
    fetchStudents(payload);
  };
  
  const handleOpenModal = async (student) => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    await fetchNextInvoiceNo();
    
    const classIds = student.className || [];
    if (!classIds || classIds.length === 0) {
      // If no classes, proceed with only admission fee
      setState(prev => ({
        ...prev, openModal: true, selectedStudent: student, loading: false, isMonthlyFee: false,
        feeDetails: {
          ...prev.feeDetails,
          netAmount: student.totalFee || 0, balance: student.totalFee || 0, classFees: [],
        }
      }));
      return;
    }

    try {
      debugger
      const classDetailPromises = classIds.map(id => axios.get(`${process.env.REACT_APP_BASE_URL}/sclassList2/${id}`));
      const classDetailResponses = await Promise.all(classDetailPromises);
      const classDetailsList = classDetailResponses.map(res => res.data);

      const classFees = classDetailsList.map(details => ({
        classId: details._id,
        className: details.sclassName,
        type: details.timingType,
        fee: parseFloat(details.sclassFee) || 0,
        numberOfSessions: 1,
      }));

      // **UPDATED**: Initial net amount is the admission fee
      const initialNetAmount = student.totalFee || 0;

      setState(prev => ({
        ...prev,
        openModal: true,
        selectedStudent: student,
        loading: false,
        isMonthlyFee: false, // Start in "Admission Fee" mode
        feeDetails: {
          ...prev.feeDetails,
          date: new Date().toISOString().split('T')[0],
          paid: '', remark: '',
          netAmount: initialNetAmount,
          balance: initialNetAmount,
          classFees: classFees,
        },
      }));

    } catch (err) {
      console.error("Error fetching class details:", err);
      setState(prev => ({ ...prev, loading: false, error: 'Could not fetch class details.' }));
    }
  };

  const handleFeeDetailChange = (e, classIdToUpdate) => {
    const { name, value } = e.target;
    setState(prev => {
      let newFeeDetails = { ...prev.feeDetails };

      if (name === 'numberOfSessions' && classIdToUpdate) {
        newFeeDetails.classFees = newFeeDetails.classFees.map(item => 
          item.classId === classIdToUpdate ? { ...item, numberOfSessions: parseInt(value, 10) || 0 } : item
        );
      } else {
        newFeeDetails[name] = value;
      }
      
      const newNetAmount = calculateNetAmount(newFeeDetails.classFees, prev.isMonthlyFee, prev.selectedStudent);
      const paidAmount = name === 'paid' ? (parseFloat(value) || 0) : (newFeeDetails.paid || 0);
      const newBalance = newNetAmount - paidAmount;

      return { 
        ...prev, 
        feeDetails: { ...newFeeDetails, netAmount: newNetAmount, balance: newBalance },
        errors: {} 
      };
    });
  };
  
  const handleMonthlyFeeToggle = (event) => {
    const checked = event.target.checked;
    setState(prev => {
      const newNetAmount = calculateNetAmount(prev.feeDetails.classFees, checked, prev.selectedStudent);
      const newBalance = newNetAmount - (prev.feeDetails.paid || 0);
      return {
        ...prev,
        isMonthlyFee: checked,
        feeDetails: { ...prev.feeDetails, netAmount: newNetAmount, balance: newBalance }
      };
    });
  };

  const handleSaveFee = async () => {
    const { feeDetails, selectedStudent, isMonthlyFee } = state;
    if (feeDetails.paid === '' || feeDetails.paid < 0 || parseFloat(feeDetails.paid) > feeDetails.netAmount) {
        setState(prev => ({ ...prev, errors: { paid: 'Paid amount is invalid.' } }));
        return;
    }
    
    const payload = {
        adminID: '68946290703454aaf4bae0de',
        ...selectedStudent,
        date: feeDetails.date,
        isPaid:'1',
        netTotalFee: feeDetails.netAmount,
        paidFee: feeDetails.paid,
        isConsultancyOrIsRegistrationOrMonthly: isMonthlyFee ? '2' : '1', // 2=Monthly, 1=Admission/Other
        invoiceID: generatedInvoiceNo,
        classBreakdown: isMonthlyFee ? feeDetails.classFees : [], // Only send breakdown for monthly fees
    };
    try {
        debugger
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/StudentFeeReg`, payload);
        debugger
        const mergedInvoiceData = { ...payload, ...response.data, balance: feeDetails.balance };
        setInvoiceData(mergedInvoiceData);
        setPopupMessage("Fee Invoice Generated Successfully.");
        setIsSuccess(true);
        setShowPopup(true);
        setState(prev => ({ ...prev, openModal: false, errors: {} }));
    } catch (error) {
      debugger
        setPopupMessage('Error saving fee details: ' + (error.response?.data?.message || error.message));
        setIsSuccess(false);
        setShowPopup(true);
    }
  };

  const handleFilterChange = (filterName) => {
    setState(prev => ({ ...prev, searchBy: filterName, name: '', rollNum: '', parentContact: '', error: '' }))
  };
  const formatFee = (fee) => fee ? `${Number(fee).toLocaleString()} PKR` : '0 PKR';
  
  useEffect(() => { fetchStudents(); }, []);

  // --- Render Method ---
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Student Fee Portal</Typography>
      
      {/* Search and Table components */}
      <FormControl component="fieldset" margin="normal">
        <FormLabel component="legend">Search By:</FormLabel>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {['Name', 'RollNum', 'ParentContact'].map(filter => (
            <FormControlLabel key={filter}
              control={<Checkbox checked={state.searchBy === filter} onChange={() => handleFilterChange(filter)} />}
              label={filter.replace('Num', ' Number').replace('Contact', ' Contact')}
            />
          ))}
        </Box>
      </FormControl>
      <Box sx={{ mt: 1, maxWidth: '500px' }}>
        {state.searchBy === 'Name' && <TextField label="Enter Student Name" value={state.name} onChange={e => setState(prev => ({ ...prev, name: e.target.value }))} onKeyPress={e => e.key === 'Enter' && handleSearch()} fullWidth />}
        {state.searchBy === 'RollNum' && <TextField label="Enter Roll Number" value={state.rollNum} onChange={e => setState(prev => ({ ...prev, rollNum: e.target.value }))} onKeyPress={e => e.key === 'Enter' && handleSearch()} fullWidth />}
        {state.searchBy === 'ParentContact' && <TextField label="Enter Parent Contact" value={state.parentContact} onChange={e => setState(prev => ({ ...prev, parentContact: e.target.value }))} onKeyPress={e => e.key === 'Enter' && handleSearch()} fullWidth />}
      </Box>
      {state.error && <Typography color="error" sx={{ mt: 2 }}>{state.error}</Typography>}
      <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
        <Button variant="contained" disabled={state.loading} onClick={handleSearch} startIcon={<SearchIcon />}>Search</Button>
        <Button variant="outlined" onClick={() => fetchStudents()} startIcon={<VisibilityIcon />}>Show All</Button>
      </Box>

      {state.loading ? <CircularProgress sx={{ display: 'block', margin: '40px auto' }} /> : (
        state.filteredData.length > 0 ? (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead><TableRow sx={{ backgroundColor: '#f5f5f5' }}>{['Roll No.', 'Name', 'Parent Contact', 'Admission Date', 'Actions'].map(head => <TableCell key={head} sx={{ fontWeight: 'bold' }}>{head}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {state.filteredData.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>{student.rollNum}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.parentContact}</TableCell>
                    <TableCell>{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="contained" color="success" onClick={() => handleOpenModal(student)} disabled={state.loading}>Fee Issue</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : ( !state.error && <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>No student records to display.</Typography> )
      )}
      
      {/* --- Fee Dialog (Updated) --- */}
      <Dialog open={state.openModal} onClose={() => setState(prev => ({ ...prev, openModal: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Fee Report for {state.selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            
            <FormControlLabel 
              control={<Checkbox checked={state.isMonthlyFee} onChange={handleMonthlyFeeToggle} />} 
              label="Generate Monthly Fee Invoice" 
            />
            <Divider sx={{ my: 1 }} />

            {state.feeDetails.classFees.map((classItem, index) => (
              <Box key={index} sx={{ p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
                <Typography variant="h6" gutterBottom>{classItem.className}</Typography>
                {classItem.type === 'Session' ? (
                  <TextField 
                    label="Number of Sessions" type="number" name="numberOfSessions"
                    value={classItem.numberOfSessions}
                    onChange={(e) => handleFeeDetailChange(e, classItem.classId)}
                    // **UPDATED**: Disabled when in admission fee mode
                    disabled={!state.isMonthlyFee}
                    InputProps={{ inputProps: { min: 1 } }} fullWidth
                  />
                ) : (
                  <TextField 
                    label="Program Fee (PKR)" value={classItem.fee}
                    disabled fullWidth
                  />
                )}
              </Box>
            ))}

            <Divider sx={{ my: 1 }} />
            <TextField label="Date" type="date" name="date" value={state.feeDetails.date} onChange={(e) => handleFeeDetailChange(e, null)} InputLabelProps={{ shrink: true }} />
            <TextField label="Paid Amount (PKR)" type="number" name="paid" value={state.feeDetails.paid} onChange={(e) => handleFeeDetailChange(e, null)} error={!!state.errors.paid} helperText={state.errors.paid} />
            <TextField label="Net Amount (PKR)" value={state.feeDetails.netAmount} disabled sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f0f0f0' }}} />
            <TextField label="Balance (PKR)" value={state.feeDetails.balance} disabled sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f0f0f0' }}} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={() => setState(prev => ({ ...prev, openModal: false }))}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFee}>Save & Generate</Button>
        </DialogActions>
      </Dialog>
      
      <InvoiceDialog open={showInvoice} onClose={() => setShowInvoice(false)} data={invoiceData} />
      <CustomPopup open={showPopup} success={isSuccess} message={popupMessage} onConfirm={() => { setShowPopup(false); setShowInvoice(true); }} onClose={() => setShowPopup(false)} />
    </Box>
  );
};

export default AdminFees;
