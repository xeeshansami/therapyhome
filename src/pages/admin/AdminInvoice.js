import React, { Component } from 'react';
import axios from 'axios';
import {
  Button, TextField, CircularProgress, Radio, Box,RadioGroup, FormControlLabel, FormControl, FormLabel, InputAdornment,
} from '@mui/material';
import styled from 'styled-components';
import InvoiceDialog from './../../components/InvoiceDialog'; // adjust path as needed

// Styling components (these remain the same)
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
    rollNum: '', // Value for Roll Number input
    name: '',    // Value for Name input
    parentsContact: '', // New: Value for Parents Contact input
    invoiceID: '', // New: Value for Invoice ID input
    searchBy: 'rollNum', // Default search option
    feeTypeFilter: 'All', // New: Default secondary filter option
    feeRecords: [],
    loading: false,
    error: '',
    showInvoice: false,
    invoiceData: {},
  };

  // --- START MODIFIED fetchStudentFee ---
  fetchStudentFee = async () => {
    const { rollNum, name, parentsContact, invoiceID, searchBy, feeTypeFilter } = this.state;
    this.setState({ loading: true, error: '', feeRecords: [] });

    let searchValue = ''; // This will hold the value for the primary search

    // Determine which input value corresponds to the selected 'searchBy' option
    switch (searchBy) {
      case 'rollNum':
        searchValue = rollNum;
        break;
      case 'name':
        searchValue = name;
        break;
      case 'parentsContact':
        searchValue = parentsContact;
        break;
      case 'invoiceID':
        searchValue = invoiceID;
        break;
      default:
        // This case should ideally not be reached if radio buttons are properly controlled
        this.setState({ loading: false, error: 'Invalid search criteria selected.' });
        return;
    }

    // Ensure a search value is provided for the primary search.
    // If not, clear the error and prevent API call.
    // if (!searchValue) {
    //   this.setState({ loading: false, error: 'Please enter a value to search.' });
    //   return;
    // }

    // Define the new POST API endpoint
    const apiEndpoint = `${process.env.REACT_APP_BASE_URL}/fetchStudentFee/filter`;

    // Construct the payload for the POST request
    const payload = {
      searchBy: searchBy,       // e.g., 'rollNum', 'name', 'parentsContact', 'invoiceID'
      searchValue: searchValue, // The actual value from the selected input field
      feeTypeFilter: feeTypeFilter, // e.g., 'All', 'ConsultancyFees', 'MonthlyFees'
    };

    try {
      // Make the POST request with the payload
      const response = await axios.post(apiEndpoint, payload);

      if (response.data && response.data.length > 0) {
        this.setState({ feeRecords: response.data, loading: false });
      } else {
        this.setState({ feeRecords: [], loading: false, error: 'No fee records found for the given criteria.' });
      }
    } catch (err) {
      console.error("Error fetching student fee data:", err);
      this.setState({ loading: false, error: 'Error fetching student fee data. Please try again.' });
    }
  };
  // --- END MODIFIED fetchStudentFee ---

  fetchAllStudentFee = async () => {
    this.setState({ loading: true, error: '', feeRecords: [] });

    try {
      const url = `${process.env.REACT_APP_BASE_URL}/AllFeeStudents`;
      const response = await axios.get(url);
      this.setState({ feeRecords: response.data, loading: false });
    } catch (err) {
      console.error("Error fetching all student fee data:", err);
      this.setState({ loading: false, error: 'Error fetching all student fee data.' });
    }
  };

  // New: handleKeyPress for search on Enter
  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.fetchStudentFee();
    }
  };

 // --- MODIFIED handleInputChange ---
  handleInputChange = (fieldName) => (e) => {
    let value = e.target.value;

    switch (fieldName) {
      case 'rollNum':
        // For rollNum, remove all spaces and restrict to alphanumeric characters
        value = value.replace(/\s/g, '');
        if (!/^[0-9a-zA-Z]*$/.test(value)) {
          // If after removing spaces, it contains invalid chars, don't update state
          return;
        }
        break;
      case 'parentsContact':
        // For parentsContact, allow only digits, plus signs, and hyphens, no letters or other symbols
        if (!/^[0-9+-]*$/.test(value)) {
          return;
        }
        break;
      case 'invoiceID':
        // For invoiceID, remove all spaces and restrict to alphanumeric and hyphens
        value = value.replace(/\s/g, '');
        if (!/^[0-9a-zA-Z-]*$/.test(value)) {
          return;
        }
        break;
      case 'name':
        // For name, allow letters and spaces, but remove any non-alphabetic/non-space characters
        value = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      default:
        // Default behavior for any other fieldName not explicitly handled
        if (!/^[0-9a-zA-Z\s-]*$/.test(value)) {
          return;
        }
    }

    this.setState({ [fieldName]: value });
  };

  // Modified generateInvoice function (remains largely the same as previous updates)
  generateInvoice = async (feeRecord) => {
    try {
      const studentResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/SingleStudent/${feeRecord.rollNum}`);
      if (studentResponse.data && studentResponse.data.length > 0) {
        const fullStudentData = studentResponse.data[0];
        const mergedData = {
          ...feeRecord,
          ...fullStudentData,
        };
        this.setState({ invoiceData: mergedData, showInvoice: true });
      } else {
        console.warn("Could not find full student data for invoice. Using only fee record.");
        this.setState({ invoiceData: feeRecord, showInvoice: true });
      }
    } catch (error) {
      console.error("Error fetching student data for invoice:", error);
      this.setState({ invoiceData: feeRecord, showInvoice: true });
    }
  };

  handleCloseInvoice = () => {
    this.setState({ showInvoice: false, invoiceData: {} });
  };
    handleFeeTypeFilterChange = (event) => {
    this.setState({ feeTypeFilter: event.target.value }, () => {
      // Re-run the search with the new filter immediately
      this.fetchStudentFee();
    });
  };

  render() {
    const { feeRecords, loading, error, searchBy, rollNum, name, parentsContact,feeTypeFilter, invoiceID, showInvoice, invoiceData } = this.state;

    // Determine the label and value for the single search TextField
    let textFieldLabel = '';
    let textFieldValue = '';
    let inputAdornment = null; // For the "THS" prefix

    switch (searchBy) {
      case 'rollNum':
        textFieldLabel = 'Enter Roll Number';
        textFieldValue = rollNum;
        inputAdornment = <InputAdornment position="start">THS</InputAdornment>;
        break;
      case 'name':
        textFieldLabel = 'Enter Student Name';
        textFieldValue = name;
        break;
      case 'parentsContact':
        textFieldLabel = 'Enter Parent Contact';
        textFieldValue = parentsContact;
        break;
      case 'invoiceID':
        textFieldLabel = 'Enter Invoice ID';
        textFieldValue = invoiceID;
        break;
      default:
        textFieldLabel = 'Select search type';
    }

    return (
      <AdminInvoiceContainer>
        <FormControl component="fieldset">
          <FormLabel component="legend">Search By</FormLabel>
          <RadioGroup
            row
            value={searchBy}
            onChange={(e) => {
              // Clear all input values when switching search type
              this.setState({
                searchBy: e.target.value,
                rollNum: '',
                name: '',
                parentsContact: '',
                invoiceID: ''
              });
            }}
          >
            <FormControlLabel value="rollNum" control={<Radio />} label="Roll Number" />
            <FormControlLabel value="name" control={<Radio />} label="Name" />
            <FormControlLabel value="parentsContact" control={<Radio />} label="Parent Contact" /> {/* New Radio Option */}
            <FormControlLabel value="invoiceID" control={<Radio />} label="Invoice ID" /> {/* New Radio Option */}
          </RadioGroup>
        </FormControl>

        {/* Single TextField for all search types */}
        <TextField
          label={textFieldLabel}
          variant="outlined"
          onKeyPress={this.handleKeyPress}
          value={textFieldValue}
          onChange={this.handleInputChange(searchBy)} // Use searchBy to set correct state field
          fullWidth
          style={{ marginTop: '20px' }}
          InputProps={{ // Apply InputAdornment only for Roll Number
            startAdornment: inputAdornment,
          }}
        />

         {/* This Box contains the Search and Fetch All Records buttons */}
        <Box sx={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.fetchStudentFee}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.fetchAllStudentFee}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Fetch All Records'}
          </Button>
        </Box>

        {/* --- Moved Fee Type Filter below the buttons --- */}
        <FormControl component="fieldset" style={{ marginTop: '20px' }}>
          <FormLabel component="legend">Filter by Fee Type</FormLabel>
          <RadioGroup
            row
            value={feeTypeFilter}
            onChange={this.handleFeeTypeFilterChange}
          >
            <FormControlLabel value="All" control={<Radio />} label="All" />
            <FormControlLabel value="ConsultancyFees" control={<Radio />} label="Consultancy Fees" />
            <FormControlLabel value="AdmissionsFees" control={<Radio />} label="Admissions Fees" />
            <FormControlLabel value="MonthlyFees" control={<Radio />} label="Monthly Fees" />
          </RadioGroup>
        </FormControl>
        {/* --- End Moved Fee Type Filter --- */}

        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

        {feeRecords.length > 0 && (
          <FeeRecordsContent>
            <h2>Fee Records for Student</h2>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Invoice No</TableHeader>
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
                    <TableCell>{feeRecord.invoiceID}</TableCell> {/* Display Invoice ID */}
                    <TableCell>{feeRecord.rollNum}</TableCell>
                    <TableCell>{feeRecord.name}</TableCell>
                    <TableCell>{feeRecord.parentName}</TableCell>
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

        {/* Invoice Dialog */}
        <InvoiceDialog open={showInvoice} onClose={this.handleCloseInvoice} data={invoiceData} />
      </AdminInvoiceContainer>
    );
  }
}

export default AdminInvoice;