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
  Box
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AdminFees = () => {
  const navigate = useNavigate();
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

  const handleSearch = async () => {
    setState(prev => ({ ...prev, loading: true, error: '', studentData: [], filteredData: [] }));
    try {
      const payload={
        id:"684166055d02df2c8772e55a",
        name:state.name,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/students/search`,payload
      );
      if (response.data?.length > 0) {
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
        totalFee: student.fee,
        netAmount: student.fee,
        balance: student.fee
      }
    }));
  };

  const handleCallConsultancy = () => {
    navigate("/Admin/addConsultancy");
  };

  const handleSaveFee = () => {
    const { feeDetails, selectedStudent } = state;
    const errors = {};

    if (!feeDetails.paid || feeDetails.paid < 0) {
      errors.paid = 'Paid Fee cannot be empty or negative';
    }
    if (!feeDetails.consultantFee || feeDetails.consultantFee < 0) {
      errors.consultantFee = 'Consultant Fee cannot be empty or negative';
    }
    if (feeDetails.paid > feeDetails.netAmount) {
      errors.paid = 'Paid Fee cannot be greater than Net Amount';
    }

    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      return;
    }

    const fields = {
      address: selectedStudent.address,
      adminID: '684166055d02df2c8772e55a',
      attendance: [],
      days: selectedStudent.days,
      fatherName: selectedStudent.fatherName,
      totalFee: '65',
      feeStructure: selectedStudent.feeStructure,
      HourMinut: selectedStudent.HourMinut,
      name: selectedStudent.name,
      parentContact: selectedStudent.parentContact,
      password: '',
      isPaid: "0",
      role: 'Student',
      rollNum: selectedStudent.role,
      teacher: "",
      date: feeDetails.date,
      netTotalFee: feeDetails.netAmount,
      consultantFee: feeDetails.consultantFee,
      paidFee: feeDetails.paid,
      sclassName: selectedStudent.sclassName,
      studentEmail: selectedStudent.studentEmail,
    };

    axios.post(`${process.env.REACT_APP_BASE_URL}/StudentFeeReg`, fields, {
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
      console.log('Fee details saved:', response.data);
      setState(prev => ({ ...prev, errors: {}, openModal: false }));
    })
    .catch(error => {
      console.error('Error saving fee details:', error);
    });
  };

  const handleCloseModal = () => {
    setState(prev => ({ ...prev, error: '', openModal: false }));
  };

  const handleFeeDetailChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;

    setState(prev => {
      const updatedFeeDetails = { ...prev.feeDetails, [name]: numericValue };

      if (name === 'consultantFee' || name === 'totalFee') {
        updatedFeeDetails.netAmount = parseFloat(updatedFeeDetails.totalFee) + parseFloat(updatedFeeDetails.consultantFee);
      }

      if (name === 'paid') {
        updatedFeeDetails.balance = updatedFeeDetails.netAmount - numericValue;
      } else if (name === 'consultantFee') {
        updatedFeeDetails.balance = updatedFeeDetails.netAmount - updatedFeeDetails.paid;
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

      {state.filteredData.length > 0 && (
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
                <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Total Fee (PKR)</TableCell>
                <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.filteredData.map((student) => (
                <TableRow key={student._id}>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>{student.rollNum}</TableCell>
                  <TableCell style={{ border: '1px solid #ccc' }}>{student.name}</TableCell>
                  <TableCell style={{ border: '1px solid #ccc' }}>{student.fatherName}</TableCell>
                  <TableCell style={{ border: '1px solid #ccc' }}>{student.parentsContact}</TableCell>
                  <TableCell style={{ border: '1px solid #ccc' }}>{student.feeStructure.join(', ')}</TableCell>
                  <TableCell style={{ border: '1px solid #ccc' }}>{student.days.join(', ')}</TableCell>
                  <TableCell style={{ border: '1px solid #ccc', fontWeight: 'bold' }}>
                    {formatFee(student.totalFee)}
                  </TableCell>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleOpenModal(student)}
                      disabled={student.status === 'Paid'}
                    >
                      Fee Issue
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleCallConsultancy}
                      disabled={student.status === 'Paid'}
                    >
                      Consultancy
                    </Button>
                  </Box>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={state.openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Fee Report for {state.selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Student Info</Typography>
            <TextField
              label="Name"
              variant="outlined"
              value={state.selectedStudent?.name || ''}
              fullWidth
              disabled
            />
            <TextField
              label="Father's Name"
              variant="outlined"
              value={state.selectedStudent?.fatherName || ''}
              fullWidth
              disabled
            />
            <TextField
              label="Class"
              variant="outlined"
              value={state.selectedStudent?.sclassName?.sclassName || ''}
              fullWidth
              disabled
            />
            <TextField
              label="Teacher"
              variant="outlined"
              value={state.selectedStudent?.teacherName || ''}
              fullWidth
              disabled
            />
            <Typography variant="h6" style={{ marginTop: 20 }}>Fee Info</Typography>
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
              label="Consultant Fee"
              type="number"
              name="consultantFee"
              value={state.feeDetails.consultantFee}
              onChange={handleFeeDetailChange}
              fullWidth
              error={!!state.errors.consultantFee}
              helperText={state.errors.consultantFee}
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
              label="Total Fee"
              variant="outlined"
              value={state.feeDetails.totalFee}
              fullWidth
              disabled
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
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveFee} color="primary">
            Save Fee
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminFees;