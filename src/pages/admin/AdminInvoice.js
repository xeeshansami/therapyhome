import React, { Component } from 'react';
import axios from 'axios';
import stampImage from '../../assets/stamp.png';
import appIcon from '../../assets/logo.png';
import {
  Button, TextField, CircularProgress, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Box
} from '@mui/material';
import html2pdf from 'html2pdf.js';
import styled from 'styled-components';
// Custom backdrop styling for blur effect
const CustomBackdrop = styled('div')(({ theme }) => ({
  position: 'fixed', // Covers the entire screen
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backdropFilter: 'blur(5px)', // Apply the blur effect
  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Opaque white with slight transparency
  zIndex: theme.zIndex.modal - 1, // Ensure it's behind the dialog
  pointerEvents: 'none', // Prevent interactions with the backdrop
}));

// Styling components
const InvoiceContainer = styled.div`
  padding: 20px;
  width: 100%;
`;

const InvoiceContent = styled.div`
  margin-top: 20px;
  font-family: Arial, sans-serif;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 14px;
`;

const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
`;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f2f2f2;
  text-align: center;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
`;

const ActionButton = styled(Button)`
  margin-top: 10px;
  margin-right: 10px;
`;

class AdminInvoice extends Component {
  state = {
    rollNum: '',
    name: '',
    searchBy: 'roll',
    feeRecords: [],
    loading: false,
    error: '',
    selectedFeeRecord: null,
  };

  fetchStudentFee = async () => {
    const { rollNum, name, searchBy } = this.state;
    this.setState({ loading: true, error: '', feeRecords: [] });

    try {
      let url = `${process.env.REACT_APP_BASE_URL}/fetchStudentFee/search/`;
      if (searchBy === 'roll') {
        url += rollNum;
      } else {
        url += name;
      }
      const response = await axios.get(url);
      this.setState({ feeRecords: response.data, loading: false });
    } catch (err) {
      this.setState({ loading: false, error: 'Error fetching student fee data' });
    }
  };

  fetchAllStudentFee = async () => {
    const { rollNum, name, searchBy } = this.state;
    this.setState({ loading: true, error: '', feeRecords: [] });

    try {
      let url = `${process.env.REACT_APP_BASE_URL}/AllFeeStudents`;
      const response = await axios.get(url);
      this.setState({ feeRecords: response.data, loading: false });
    } catch (err) {
      this.setState({ loading: false, error: 'Error fetching student fee data' });
    }
  };

  handlePaid = () => {
    const selectedStudent = this.state;

    // Call the API to save fee details
    const fields = {
      address: selectedStudent.address,
      adminID: '684166055d02df2c8772e55a',
      attendance: [],
      days: selectedStudent.days,
      fatherName: selectedStudent.fatherName,
      totalFee: selectedStudent.totalFee,
      feeStructure: selectedStudent.feeStructure,
      HourMinut: selectedStudent.HourMinut,
      name: selectedStudent.name,
      parentsContact: selectedStudent.parentsContact,
      password: '',
      role: 'Student',
      rollNum: selectedStudent.rollNum,
      isPaid: "1",
      teacher: "",
      date: selectedStudent.date,
      netTotalFee: selectedStudent.netAmount,
      consultantFee: selectedStudent.consultantFee,
      paidFee: selectedStudent.paid,
      sclassName: selectedStudent.sclassName,
      studentEmail: selectedStudent.studentEmail,
    };

    // API call to save the fee details
    axios.put(`${process.env.REACT_APP_BASE_URL}/StudentUpdateFee`, fields, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        alert('Student fee has been paid successfully!');
        this.setState({ selectedStudent: null, feeDetails: {} });
      })
      .catch(error => {
        alert('An error occurred while saving the fee details. Please try again.');
      });
  };

  handleDownload = () => {
    const { selectedFeeRecord } = this.state;
    if (!selectedFeeRecord) return;

    const element = document.getElementById(`invoice-${selectedFeeRecord.id}`);
    const opt = {
      margin: 0.5,
      filename: `invoice-${selectedFeeRecord.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().from(element).set(opt).save();
  };

  viewInvoicePDF = (selectedFeeRecord) => {
    const element = document.getElementById(`invoice-${selectedFeeRecord.id}`);
    const opt = {
      margin: 0.5,
      filename: `invoice-${selectedFeeRecord.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().from(element).set(opt).outputPdf('datauristring').then((pdfData) => {
      const newWindow = window.open();
      newWindow.document.write('<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>');
    });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  handleDownload = () => {
    const { selectedFeeRecord } = this.state;
    if (!selectedFeeRecord) return;

    const element = document.getElementById(`invoice-${selectedFeeRecord.id}`);
    const opt = {
      margin: 0.5,
      filename: `student_invoice-${selectedFeeRecord.rollNum}-${selectedFeeRecord.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().from(element).set(opt).save();
  };


  handleRollNumChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      this.setState({ rollNum: value });
    }
  };

  handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      this.setState({ name: value });
    }
  };

  generateInvoice = (feeRecord) => {
    // this.setState({ selectedFeeRecord: feeRecord });
    this.setState({ selectedFeeRecord: feeRecord, dialogOpen: true });
  };

  render() {
    const { feeRecords, loading, error, searchBy, rollNum, name, selectedFeeRecord, dialogOpen } = this.state;

    return (
      <InvoiceContainer>
        <FormControl component="fieldset">
          <FormLabel component="legend">Search By</FormLabel>
          <RadioGroup
            row
            value={searchBy}
            onChange={(e) => this.setState({ searchBy: e.target.value })}
          >
            <FormControlLabel value="roll" control={<Radio />} label="Roll Number" />
            <FormControlLabel value="name" control={<Radio />} label="Name" />
          </RadioGroup>
        </FormControl>

        {searchBy === 'roll' ? (
          <TextField
            label="Enter Roll Number"
            variant="outlined"
            value={rollNum}
            onChange={this.handleRollNumChange}
            fullWidth
            style={{ marginTop: '20px' }}
          />
        ) : (
          <TextField
            label="Enter Name"
            variant="outlined"
            value={name}
            onChange={this.handleNameChange}
            fullWidth
            style={{ marginTop: '20px' }}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={this.fetchStudentFee}
          disabled={loading}
          style={{ marginTop: '20px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
        <Button

          variant="contained"
          color="primary"
          onClick={this.fetchAllStudentFee}
          disabled={loading}
          style={{ marginTop: '20px',marginLeft:'20px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Fetch All Records'}
        </Button>

        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

        {feeRecords.length > 0 && (
          <InvoiceContent>
            <h2>Fee Records for Student</h2>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Roll Number</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Father's Name</TableHeader>
                  <TableHeader>Teacher</TableHeader>
                  <TableHeader>Parent Contact</TableHeader>
                  <TableHeader>Fee Structure</TableHeader>
                  <TableHeader>Days</TableHeader>
                  <TableHeader>Student Fee (PKR)</TableHeader>
                  <TableHeader>Consultant Fee (PKR)</TableHeader>
                  <TableHeader>Net Amount (PKR)</TableHeader>
                  <TableHeader>Balance (PKR)</TableHeader>
                  <TableHeader>Paid Amount (PKR)</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Action</TableHeader>
                </tr>
              </thead>
              <tbody>
                {feeRecords.map((feeRecord) => (
                  <tr key={feeRecord.id}>
                    <TableCell>{feeRecord.rollNum}</TableCell>
                    <TableCell>{feeRecord.name}</TableCell>
                    <TableCell>{feeRecord.fatherName}</TableCell>
                    <TableCell>{feeRecord.teacherName || 'N/A'}</TableCell>
                    <TableCell>{feeRecord.parentsContact}</TableCell>
                    <TableCell>{feeRecord.feeStructure.join(', ')}</TableCell>
                    <TableCell>{feeRecord.days.join(', ')}</TableCell>
                    <TableCell>{feeRecord.totalFee} PKR</TableCell>
                    <TableCell>{feeRecord.consultantFee} PKR</TableCell>
                    <TableCell>{feeRecord.netTotalFee} PKR</TableCell>
                    <TableCell
                      style={{
                        color: feeRecord.netTotalFee - feeRecord.paidFee === 0 ? 'green' : 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      {feeRecord.netTotalFee - feeRecord.paidFee} PKR
                    </TableCell>
                    <TableCell style={{ color: 'green', fontWeight: 'bold' }}>
                      {feeRecord.paidFee} PKR
                    </TableCell>
                    <TableCell
                      style={{
                        color: feeRecord.netTotalFee - feeRecord.paidFee === 0 ? 'green' : 'red',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {feeRecord.netTotalFee - feeRecord.paidFee === 0 ? '✔️' : '❌'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => this.generateInvoice(feeRecord)}
                      >
                        Generate Invoice
                      </Button>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </InvoiceContent>
        )}


        <Dialog
          open={dialogOpen}
          onClose={this.handleDialogClose}
          fullScreen
          slotProps={{
            backdrop: {
              sx: {
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
              },
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque for better readability
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              maxWidth: '80%',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <DialogTitle>Invoice</DialogTitle>
            <DialogContent>
              {selectedFeeRecord && (
                <InvoiceContent
                  id={`invoice-${selectedFeeRecord.id}`}
                  style={{
                    fontFamily: 'Calibri, sans-serif',
                    fontStyle: 'normal',
                    position: 'relative',
                    paddingBottom: '200px', // Leave space for footer elements
                    margin: '20px', // Add margin around the content
                  }}
                >
                  {/* Header */}
                  <header
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px', // Add spacing below header
                    }}
                  >
                    <span>
                      <img
                        alt="THERAPYHOME"
                        src={appIcon}
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <p><strong>Invoice #:</strong> 101138</p>
                      <p><strong>Date:</strong> January 1, 2012</p>
                    </div>
                  </header>

                  {/* Address */}
                  <address style={{
                    marginBottom: '20px', fontFamily: 'Calibri',
                    fontStyle: 'bold',
                  }}>
                    <p>THERAPY HOME</p>
                    <p>PlotR #386, Sector 11-C/1</p>
                    <p>North Karachi Twp</p>
                    <p>Karachi, Pakistan</p>
                    <p>+92-341-2030258</p>
                  </address>

                  <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Student Fee Record</h2>
                  <p><strong>Student Name:</strong> {selectedFeeRecord.name}</p>
                  <p><strong>Father Name:</strong> {selectedFeeRecord.fatherName}</p>

                  {/* Table */}
                  <Table style={{ marginBottom: '30px' }}> {/* Add margin below table */}
                    <thead>
                      <tr>
                        <TableHeader>Roll Number</TableHeader>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Father's Name</TableHeader>
                        {/* <TableHeader>Teacher</TableHeader> */}
                        <TableHeader>Parent Contact</TableHeader>
                        <TableHeader>Fee Structure</TableHeader>
                        <TableHeader>Days</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <TableCell>{selectedFeeRecord.rollNum}</TableCell>
                        <TableCell>{selectedFeeRecord.name}</TableCell>
                        <TableCell>{selectedFeeRecord.fatherName}</TableCell>
                        {/* <TableCell>{selectedFeeRecord.teacherName || 'N/A'}</TableCell> */}
                        <TableCell>{selectedFeeRecord.parentsContact}</TableCell>
                        <TableCell>{selectedFeeRecord.feeStructure.join(', ')}</TableCell>
                        <TableCell>{selectedFeeRecord.days.join(', ')}</TableCell>
                      </tr>
                    </tbody>
                  </Table>

                  {/* Payment Summary */}
                  <div
                    style={{
                      display: 'flex', // Use flexbox for alignment
                      justifyContent: 'space-between', // Space between the two divs
                      marginBottom: '50px', // Add spacing below the row
                    }}
                  >
                    {/* Left-aligned content */}
                    <div style={{ textAlign: 'left', paddingRight: '20px' }}>
                      <p>
                        Student Fee: <strong>{selectedFeeRecord.totalFee} PKR</strong>
                      </p>
                      <p>
                        Consultant Fee: <strong style={{ color: 'green' }}>{selectedFeeRecord.consultantFee} PKR</strong>
                      </p>
                      <p>
                        Fee Of Month: <strong style={{ color: 'red' }}>
                          {selectedFeeRecord.netTotalFee - selectedFeeRecord.date} PKR
                        </strong>
                      </p>
                    </div>

                    {/* Right-aligned content */}
                    <div style={{ textAlign: 'right', paddingRight: '20px' }}>
                      <p>
                        Total Amount: <strong>{selectedFeeRecord.netTotalFee} PKR</strong>
                      </p>
                      <p>
                        Paid Amount: <strong style={{ color: 'green' }}>{selectedFeeRecord.paidFee} PKR</strong>
                      </p>
                      <p>
                        Balance Amount: <strong style={{ color: 'red' }}>
                          {selectedFeeRecord.netTotalFee - selectedFeeRecord.paidFee} PKR
                        </strong>
                      </p>
                    </div>
                  </div>


                  {/* Stamp */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={stampImage}
                      alt="Stamp"
                      style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '10px' }}
                    />
                    <p>Authorized Stamp</p>
                  </div>

                  {/* Signature */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <p>________________________</p>
                    <p>Authorized Signature</p>
                  </div>
                </InvoiceContent>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="primary">
                Close
              </Button>
              <Button onClick={() => this.viewInvoicePDF(selectedFeeRecord)} color="primary">
                View
              </Button>
              <Button onClick={this.handleDownload} color="secondary">
                Download Invoice
              </Button>
            </DialogActions>
          </Box>
        </Dialog>


      </InvoiceContainer>



    );
  }
}

export default AdminInvoice;
