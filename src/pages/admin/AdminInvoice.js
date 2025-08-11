import React, { Component } from 'react';
import axios from 'axios';
import {
    Button, TextField, CircularProgress, Typography, Radio, Box, RadioGroup,
    FormControlLabel, FormControl, FormLabel, Container, Paper, Grid,
    Select, MenuItem, InputLabel, Divider
} from '@mui/material';
import styled from 'styled-components';
import InvoiceDialog from './../../components/InvoiceDialog';
import SalarySlipDialog from './../../components/SalarySlipDialog';

// Styled-components for the results table (can be kept as is)
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 14px;
`;

const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
`;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 12px;
  background-color: #f2f2f2;
  text-align: center;
  font-weight: bold;
`;

class AdminInvoice extends Component {
    state = {
        // --- Primary Target ---
        searchTarget: 'student', // 'student' or 'teacher'

        // --- Student Search State ---
        studentSearchBy: 'rollNum',
        studentRollNum: '',
        studentName: '',
        studentParentContact: '',
        studentInvoiceID: '',
        studentFeeTypeFilter: 'All',

        // --- Teacher Search State ---
        teacherSearchBy: 'name',
        teacherName: '',
        teacherPhone: '',
        teacherCnic: '',
        teacherInvoiceID: '',

        // --- General State ---
        records: [],
        loading: false,
        error: '',

        // --- Dialog State ---
        showInvoice: false,
        invoiceData: {},
        showSalarySlip: false,
        salarySlipData: {},
    };

    // --- API Fetching Logic ---

    handleSearch = () => {
        if (this.state.searchTarget === 'student') {
            this.fetchStudentFee();
        } else {
            this.fetchTeacherSalaries();
        }
    };

    fetchStudentFee = async () => {
        const { studentRollNum, studentName, studentParentContact, studentInvoiceID, studentSearchBy, studentFeeTypeFilter } = this.state;
        this.setState({ loading: true, error: '', records: [] });
        let searchValue = '';
        switch (studentSearchBy) {
            case 'rollNum': searchValue = studentRollNum; break;
            case 'name': searchValue = studentName; break;
            case 'parentContact': searchValue = studentParentContact; break;
            case 'invoiceID': searchValue = studentInvoiceID; break;
            default: break;
        }
        const apiEndpoint = `${process.env.REACT_APP_BASE_URL}/fetchStudentFee/filter`;
        const payload = {
            searchBy: studentSearchBy,
            searchValue: searchValue,
            feeTypeFilter: studentFeeTypeFilter,
        };
        try {
            const response = await axios.post(apiEndpoint, payload);
            if (response.data && response.data.length > 0) {
                this.setState({ records: response.data, loading: false });
            } else {
                this.setState({ records: [], loading: false, error: 'No student fee records found.' });
            }
        } catch (err) {
            this.setState({ loading: false, error: 'Error fetching student fee data.' });
        }
    };

    fetchTeacherSalaries = async () => {
        const { teacherName, teacherPhone, teacherCnic, teacherInvoiceID, teacherSearchBy } = this.state;
        this.setState({ loading: true, error: '', records: [] });
        let searchValue = '';
        switch (teacherSearchBy) {
            case 'name': searchValue = teacherName; break;
            case 'phone': searchValue = teacherPhone; break;
            case 'cnic': searchValue = teacherCnic; break;
            case 'invoiceID': searchValue = teacherInvoiceID; break;
            default: break;
        }
        const apiEndpoint = `${process.env.REACT_APP_BASE_URL}/fetchTeacherSalaries/filter`;
        const payload = { searchBy: teacherSearchBy, searchValue: searchValue };
        try {
            const response = await axios.post(apiEndpoint, payload);
            if (response.data && response.data.length > 0) {
                this.setState({ records: response.data, loading: false });
            } else {
                this.setState({ records: [], loading: false, error: 'No teacher salary records found.' });
            }
        } catch (err) {
            this.setState({ loading: false, error: 'Error fetching teacher salary data.' });
        }
    };

    // --- Event Handlers ---

    handlePrimaryTargetChange = (e) => {
        this.setState({
            searchTarget: e.target.value,
            records: [],
            error: '',
        });
    };

    handleInputChange = (fieldName) => (e) => {
        this.setState({ [fieldName]: e.target.value });
    };
    
    handlePhoneInputChange = (fieldName) => (e) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        if (value.length <= 13) {
            this.setState({ [fieldName]: value });
        }
    };

    handleCnicInputChange = (e) => {
        const rawValue = e.target.value;
        const digitsOnly = rawValue.replace(/\D/g, '');

        if (digitsOnly.length > 13) {
            return;
        }

        let formattedCnic = digitsOnly;
        if (digitsOnly.length > 12) {
            formattedCnic = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
        } else if (digitsOnly.length > 5) {
            formattedCnic = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
        }
        
        this.setState({ teacherCnic: formattedCnic });
    };

    handleStudentFeeTypeFilterChange = (event) => {
        this.setState({ studentFeeTypeFilter: event.target.value }, this.fetchStudentFee);
    };

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    };

    // --- Dialog Handlers ---

    generateStudentInvoice = async (feeRecord) => {
        try {
            const studentResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/SingleStudent/${feeRecord.rollNum}`);
            if (studentResponse.data && studentResponse.data.length > 0) {
                const fullStudentData = studentResponse.data[0];
                const mergedData = { ...feeRecord, ...fullStudentData };
                this.setState({ invoiceData: mergedData, showInvoice: true });
            } else {
                this.setState({ invoiceData: feeRecord, showInvoice: true });
            }
        } catch (error) {
            this.setState({ invoiceData: feeRecord, showInvoice: true });
        }
    };

    generateTeacherSalarySlip = (salaryRecord) => {
        this.setState({ salarySlipData: salaryRecord, showSalarySlip: true });
    };

    handleCloseInvoice = () => this.setState({ showInvoice: false, invoiceData: {} });
    handleCloseSalarySlip = () => this.setState({ showSalarySlip: false, salarySlipData: {} });

    // --- Render Methods ---

    renderStudentSearch() {
        const { studentSearchBy, studentRollNum, studentName, studentParentContact, studentInvoiceID, studentFeeTypeFilter } = this.state;
        let label = '', value = '', onChange = null, type = 'text', inputProps = {};

        switch (studentSearchBy) {
            case 'rollNum':
                label = 'Enter Roll Number';
                value = studentRollNum;
                onChange = this.handleInputChange('studentRollNum');
                break;
            case 'name':
                label = 'Enter Student Name';
                value = studentName;
                onChange = this.handleInputChange('studentName');
                break;
            case 'parentContact':
                label = 'Enter Parent Contact';
                value = studentParentContact;
                onChange = this.handlePhoneInputChange('studentParentContact');
                type = 'tel';
                inputProps = { maxLength: 13 };
                break;
            case 'invoiceID':
                label = 'Enter Invoice ID';
                value = studentInvoiceID;
                onChange = this.handleInputChange('studentInvoiceID');
                break;
            default: break;
        }

        return (
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Search Student By</FormLabel>
                        <RadioGroup row value={studentSearchBy} onChange={this.handleInputChange('studentSearchBy')}>
                            <FormControlLabel value="rollNum" control={<Radio />} label="Roll Number" />
                            <FormControlLabel value="name" control={<Radio />} label="Name" />
                            <FormControlLabel value="parentContact" control={<Radio />} label="Parent Contact" />
                            <FormControlLabel value="invoiceID" control={<Radio />} label="Invoice ID" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label={label}
                        variant="outlined"
                        onKeyPress={this.handleKeyPress}
                        value={value}
                        onChange={onChange}
                        type={type}
                        inputProps={inputProps}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Filter by Fee Type</FormLabel>
                        <RadioGroup row value={studentFeeTypeFilter} onChange={this.handleStudentFeeTypeFilterChange}>
                            <FormControlLabel value="All" control={<Radio />} label="All" />
                            <FormControlLabel value="ConsultancyFees" control={<Radio />} label="Consultancy" />
                            <FormControlLabel value="AdmissionsFees" control={<Radio />} label="Admissions" />
                            <FormControlLabel value="MonthlyFees" control={<Radio />} label="Monthly" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    renderTeacherSearch() {
        const { teacherSearchBy, teacherName, teacherPhone, teacherCnic, teacherInvoiceID } = this.state;
        let label = '', value = '', onChange = null, type = 'text', inputProps = {};

        // FIX: Changed teacherSearchby to teacherSearchBy
        switch (teacherSearchBy) {
            case 'name':
                label = 'Enter Teacher Name';
                value = teacherName;
                onChange = this.handleInputChange('teacherName');
                break;
            case 'phone':
                label = 'Enter Teacher Phone';
                value = teacherPhone;
                onChange = this.handlePhoneInputChange('teacherPhone');
                type = 'tel';
                inputProps = { maxLength: 13 };
                break;
            case 'cnic':
                label = 'Enter Teacher CNIC';
                value = teacherCnic;
                onChange = this.handleCnicInputChange;
                type = 'tel';
                inputProps = { maxLength: 15 };
                break;
            case 'invoiceID':
                label = 'Enter Invoice ID';
                value = teacherInvoiceID;
                onChange = this.handleInputChange('teacherInvoiceID');
                break;
            default: break;
        }

        return (
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Search Teacher By</FormLabel>
                        <RadioGroup row value={teacherSearchBy} onChange={this.handleInputChange('teacherSearchBy')}>
                            <FormControlLabel value="name" control={<Radio />} label="Name" />
                            <FormControlLabel value="phone" control={<Radio />} label="Phone" />
                            <FormControlLabel value="cnic" control={<Radio />} label="CNIC" />
                            <FormControlLabel value="invoiceID" control={<Radio />} label="Invoice ID" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label={label}
                        variant="outlined"
                        onKeyPress={this.handleKeyPress}
                        value={value}
                        onChange={onChange}
                        type={type}
                        inputProps={inputProps}
                        fullWidth
                    />
                </Grid>
            </Grid>
        );
    }

    renderResultsTable() {
        const { records, searchTarget } = this.state;
        if (records.length === 0) return null;

        return (
            <Paper sx={{ width: '100%', overflow: 'hidden', mt: 4 }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom component="div">
                        {searchTarget === 'student' ? 'Student Fee Records' : 'Teacher Salary Records'}
                    </Typography>
                    <div style={{ overflowX: 'auto' }}>
                        {searchTarget === 'student' ? (
                            <Table>
                                <thead>
                                    <tr>
                                        <TableHeader>Invoice No</TableHeader>
                                        <TableHeader>Roll No</TableHeader>
                                        <TableHeader>Name</TableHeader>
                                        <TableHeader>Parent</TableHeader>
                                        <TableHeader>Fee Type</TableHeader>
                                        <TableHeader>Balance</TableHeader>
                                        <TableHeader>Paid</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Action</TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.invoiceID}>
                                            <TableCell>{record.invoiceID}</TableCell>
                                            <TableCell>{record.rollNum}</TableCell>
                                            <TableCell>{record.name}</TableCell>
                                            <TableCell>{record.parentName}</TableCell>
                                            <TableCell>
                                                {record.isConsultancyOrIsRegistrationOrMonthly === '0' ? 'Consultancy' : record.isConsultancyOrIsRegistrationOrMonthly === '1' ? 'Admission' : 'Monthly'}
                                            </TableCell>
                                            <TableCell style={{ color: record.netTotalFee - record.paidFee === 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                                {record.netTotalFee - record.paidFee}
                                            </TableCell>
                                            <TableCell style={{ color: 'green', fontWeight: 'bold' }}>{record.paidFee}</TableCell>
                                            <TableCell>
                                                <span style={{ fontSize: '1.5rem' }}>{record.netTotalFee - record.paidFee === 0 ? '✔️' : '❌'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" color="secondary" onClick={() => this.generateStudentInvoice(record)}>Invoice</Button>
                                            </TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <TableHeader>Invoice No</TableHeader>
                                        <TableHeader>Name</TableHeader>
                                        <TableHeader>Phone</TableHeader>
                                        <TableHeader>Month</TableHeader>
                                        <TableHeader>Net Salary</TableHeader>
                                        <TableHeader>Paid</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Action</TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.invoiceID}>
                                            <TableCell>{record.invoiceID}</TableCell>
                                            <TableCell>{record.name}</TableCell>
                                            <TableCell>{record.phone}</TableCell>
                                            <TableCell>{new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' })}</TableCell>
                                            <TableCell>{record.netSalary} PKR</TableCell>
                                            <TableCell style={{ color: 'green', fontWeight: 'bold' }}>{record.paidAmount} PKR</TableCell>
                                            <TableCell>
                                                <span style={{ fontSize: '1.5rem' }}>{record.isPaid === "1" ? '✔️' : '❌'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" color="secondary" onClick={() => this.generateTeacherSalarySlip(record)}>Salary Slip</Button>
                                            </TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Box>
            </Paper>
        );
    }

    render() {
        const { loading, error, searchTarget } = this.state;

        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Invoice & Salary Slip Generation
                </Typography>

                <Paper elevation={3} sx={{ p: 3 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Select Target</InputLabel>
                                <Select
                                    value={searchTarget}
                                    onChange={this.handlePrimaryTargetChange}
                                    label="Select Target"
                                >
                                    <MenuItem value="student">Student Invoice</MenuItem>
                                    <MenuItem value="teacher">Teacher Salary Slip</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                             <Divider />
                        </Grid>

                        <Grid item xs={12}>
                            {searchTarget === 'student' ? this.renderStudentSearch() : this.renderTeacherSearch()}
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleSearch}
                                disabled={loading}
                                fullWidth
                                size="large"
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Search Records'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {error && (
                    <Typography color="error" sx={{ mt: 3, textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}
                
                {this.renderResultsTable()}

                <InvoiceDialog open={this.state.showInvoice} onClose={this.handleCloseInvoice} data={this.state.invoiceData} />
                <SalarySlipDialog open={this.state.showSalarySlip} onClose={this.handleCloseSalarySlip} data={this.state.salarySlipData} />
            </Container>
        );
    }
}

export default AdminInvoice;