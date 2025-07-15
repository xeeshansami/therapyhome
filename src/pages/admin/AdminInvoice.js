import React, { Component } from 'react';
import axios from 'axios';
import {
  Button, TextField, CircularProgress, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
} from '@mui/material';
import styled from 'styled-components';

// Styling components
const AdminInvoiceContainer = styled.div`
  padding: 20px;
  width: 100%;
`;

const FeeRecordsContent = styled.div`
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

class AdminInvoice extends Component {
  state = {
    rollNum: '',
    name: '',
    searchBy: 'roll',
    feeRecords: [],
    loading: false,
    error: '',
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
    this.setState({ loading: true, error: '', feeRecords: [] });

    try {
      let url = `${process.env.REACT_APP_BASE_URL}/AllFeeStudents`;
      const response = await axios.get(url);
      this.setState({ feeRecords: response.data, loading: false });
    } catch (err) {
      this.setState({ loading: false, error: 'Error fetching all student fee data' });
    }
  };

  handleRollNumChange = (e) => {
    const value = e.target.value;
    if (/^[0-9a-zA-Z\s]*$/.test(value)) {
      this.setState({ rollNum: value });
    }
  };

  handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[0-9a-zA-Z\s]*$/.test(value)) {
      this.setState({ name: value });
    }
  };
   generateInvoice = (feeRecord) => {
    // For now, let's just log the feeRecord to the console.
    // In a real application, you would implement your invoice generation logic here,
    // e.g., opening a modal, navigating to a new page, or making another API call.
    console.log("Generating invoice for:", feeRecord);
    alert(`Generate invoice for Roll Number: ${feeRecord.rollNum}, Name: ${feeRecord.name}`);
  };

  render() {
    const { feeRecords, loading, error, searchBy, rollNum, name } = this.state;

    return (
      <AdminInvoiceContainer>
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
          style={{ marginTop: '20px', marginLeft: '20px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Fetch All Records'}
        </Button>

        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

        {feeRecords.length > 0 && (
          <FeeRecordsContent>
            <h2>Fee Records for Student</h2>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Roll Number</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Father's Name</TableHeader>
                  <TableHeader>Parent Contact</TableHeader>
                  <TableHeader>Monthly Fee's</TableHeader>
                  <TableHeader>Admission Fee's</TableHeader>
                  <TableHeader>Consultancy Fee's</TableHeader>
                  <TableHeader>Balance Due</TableHeader>
                  <TableHeader>Paid Amount</TableHeader>
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
                    <TableCell>{feeRecord.parentsContact}</TableCell>
                    <TableCell>{feeRecord.isConsultancyOrIsRegistrationOrMonthly === '2' ? (feeRecord.netTotalFee ? feeRecord.netTotalFee : "N/A") : "N/A"} </TableCell>
                    <TableCell>{feeRecord.isConsultancyOrIsRegistrationOrMonthly === '1' ? (feeRecord.netTotalFee ? feeRecord.netTotalFee : "N/A") : "N/A"} </TableCell>
                    <TableCell>{feeRecord.isConsultancyOrIsRegistrationOrMonthly === '0' ? (feeRecord.netTotalFee ? feeRecord.netTotalFee : "N/A") : "N/A"} </TableCell>
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
          </FeeRecordsContent>
        )}
      </AdminInvoiceContainer>
    );
  }
}

export default AdminInvoice;