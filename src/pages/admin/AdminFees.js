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
  Divider,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InvoiceDialog from '../../components/InvoiceDialog'; // Adjust path as needed
import { toMoney, lineTotal, sumLineItems } from '../../utils/feeCalc';

// Pre-existing hardcoded admin/school id, kept as-is so behaviour does not change.
const ADMIN_ID = '68795ab802f2887382d217b0';

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

let lineKeySeed = 0;
const nextLineKey = () => {
  lineKeySeed += 1;
  return `line-${lineKeySeed}`;
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
  const [saving, setSaving] = useState(false);

  // Every class in the system, for the session/service dropdown.
  const [allClasses, setAllClasses] = useState([]);

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
      lineItems: [],
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

  const fetchAllClasses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${ADMIN_ID}`);
      setAllClasses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setAllClasses([]);
    }
  };

  const fetchStudents = async (searchPayload = null) => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const url = searchPayload
        ? `${process.env.REACT_APP_BASE_URL}/students/search`
        : `${process.env.REACT_APP_BASE_URL}/AllStudents/${ADMIN_ID}`;
      const method = searchPayload ? 'post' : 'get';
      const response = await axios[method](url, searchPayload);

      const data = response.data?.length > 0 ? response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setState(prev => ({ ...prev, studentData: data, filteredData: data, loading: false, error: data.length === 0 ? 'No students found.' : '' }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Error fetching student data.' }));
    }
  };

  // --- Fee Calculation Logic ---

  const calculateNetAmount = (lineItems, isMonthly, student) => {
    // **MODE 1: Admission Fee** (Monthly checkbox is unchecked)
    // The net amount is simply the student's total admission fee.
    if (!isMonthly) {
      return student?.totalFee || 0;
    }

    // **MODE 2: Monthly Fee** (Monthly checkbox is checked)
    // Net fee is the sum of every session/service line on the slip.
    return sumLineItems(lineItems);
  };

  // --- Event Handlers ---

  const handleSearch = () => {
    const { searchBy, name, rollNum, parentContact } = state;
    const payload = { id: ADMIN_ID };
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

    // The monthly plan cost becomes its own editable line so the net fee stays
    // the sum of what is actually shown on the slip.
    const planItems = [];
    try {
      const plan = JSON.parse(student?.therapyPlan || '{}');
      if (plan?.perMonthCost) {
        planItems.push({
          key: nextLineKey(),
          classId: '',
          serviceName: 'Monthly Plan',
          feePerSession: toMoney(plan.perMonthCost),
          sessions: 1,
        });
      }
    } catch (err) {
      console.error("Could not read therapy plan:", err);
    }

    if (!classIds || classIds.length === 0) {
      const initialNetAmount = student.totalFee || 0;
      setState(prev => ({
        ...prev, openModal: true, selectedStudent: student, loading: false, isMonthlyFee: false,
        feeDetails: {
          ...prev.feeDetails,
          date: new Date().toISOString().split('T')[0],
          paid: '', remark: '',
          netAmount: initialNetAmount, balance: initialNetAmount,
          lineItems: planItems,
        }
      }));
      return;
    }

    try {
      const classDetailPromises = classIds.map(id => axios.get(`${process.env.REACT_APP_BASE_URL}/sclassList2/${id}`));
      const classDetailResponses = await Promise.all(classDetailPromises);
      const classDetailsList = classDetailResponses.map(res => res.data);

      // The class fee is only a starting value; it stays editable per student.
      const enrolledItems = classDetailsList.map(details => ({
        key: nextLineKey(),
        classId: details._id,
        serviceName: details.sclassName,
        feePerSession: parseFloat(details.sclassFee) || 0,
        sessions: 1,
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
          lineItems: [...planItems, ...enrolledItems],
        },
      }));

    } catch (err) {
      console.error("Error fetching class details:", err);
      setState(prev => ({ ...prev, loading: false, error: 'Could not fetch class details.' }));
    }
  };

  // Recompute net/balance from whatever the fee details now hold.
  const withTotals = (prev, nextFeeDetails, isMonthly) => {
    const newNetAmount = calculateNetAmount(nextFeeDetails.lineItems, isMonthly, prev.selectedStudent);
    const paidAmount = toMoney(nextFeeDetails.paid);
    return {
      ...prev,
      isMonthlyFee: isMonthly,
      feeDetails: { ...nextFeeDetails, netAmount: newNetAmount, balance: newNetAmount - paidAmount },
      errors: {},
    };
  };

  const handleFeeDetailChange = (e) => {
    const { name, value } = e.target;
    setState(prev => withTotals(prev, { ...prev.feeDetails, [name]: value }, prev.isMonthlyFee));
  };

  const handleLineItemChange = (key, field, value) => {
    setState(prev => {
      const lineItems = prev.feeDetails.lineItems.map(item => {
        if (item.key !== key) return item;
        if (field === 'classId') {
          // Picking a class seeds its fee, which the user can still override.
          const picked = allClasses.find(c => c._id === value);
          return {
            ...item,
            classId: value,
            serviceName: picked ? picked.sclassName : item.serviceName,
            feePerSession: picked ? (parseFloat(picked.sclassFee) || 0) : item.feePerSession,
          };
        }
        return { ...item, [field]: value };
      });
      return withTotals(prev, { ...prev.feeDetails, lineItems }, prev.isMonthlyFee);
    });
  };

  const handleAddLineItem = () => {
    setState(prev => {
      const lineItems = [
        ...prev.feeDetails.lineItems,
        { key: nextLineKey(), classId: '', serviceName: '', feePerSession: '', sessions: 1 },
      ];
      return withTotals(prev, { ...prev.feeDetails, lineItems }, prev.isMonthlyFee);
    });
  };

  const handleRemoveLineItem = (key) => {
    setState(prev => {
      const lineItems = prev.feeDetails.lineItems.filter(item => item.key !== key);
      return withTotals(prev, { ...prev.feeDetails, lineItems }, prev.isMonthlyFee);
    });
  };

  const handleMonthlyFeeToggle = (event) => {
    const checked = event.target.checked;
    setState(prev => withTotals(prev, prev.feeDetails, checked));
  };

  const validateForSave = () => {
    const { feeDetails, isMonthlyFee } = state;
    const errors = {};

    if (feeDetails.paid === '' || toMoney(feeDetails.paid) < 0 || toMoney(feeDetails.paid) > feeDetails.netAmount) {
      errors.paid = 'Paid amount is invalid.';
    }

    if (isMonthlyFee) {
      if (feeDetails.lineItems.length === 0) {
        errors.lineItems = 'Add at least one session or service.';
      }
      feeDetails.lineItems.forEach(item => {
        if (!String(item.serviceName || '').trim()) {
          errors.lineItems = 'Every row needs a session/service.';
        } else if (item.feePerSession === '' || toMoney(item.feePerSession) < 0) {
          errors.lineItems = `Enter a valid fee for "${item.serviceName}".`;
        } else if (!Number.isInteger(parseInt(item.sessions, 10)) || parseInt(item.sessions, 10) < 1) {
          errors.lineItems = `Sessions for "${item.serviceName}" must be 1 or more.`;
        }
      });
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSaveFee = async () => {
    if (saving) return; // guard against duplicate clicks
    if (!validateForSave()) return;

    const { feeDetails, selectedStudent, isMonthlyFee } = state;

    const lineItemsPayload = isMonthlyFee
      ? feeDetails.lineItems.map(item => ({
          sclassName: item.classId || undefined,
          serviceName: String(item.serviceName).trim(),
          feePerSession: toMoney(item.feePerSession),
          sessions: parseInt(item.sessions, 10),
          total: lineTotal(item),
        }))
      : [];

    const payload = {
      adminID: ADMIN_ID,
      ...selectedStudent,
      date: feeDetails.date,
      isPaid: '1',
      netTotalFee: feeDetails.netAmount,
      paidFee: feeDetails.paid,
      isConsultancyOrIsRegistrationOrMonthly: isMonthlyFee ? '2' : '1', // 2=Monthly, 1=Admission/Other
      invoiceID: generatedInvoiceNo,
      lineItems: lineItemsPayload,
      classBreakdown: lineItemsPayload, // kept for any existing consumer of this field
    };

    setSaving(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/StudentFeeReg`, payload);
      const mergedInvoiceData = { ...payload, ...response.data, balance: feeDetails.balance };
      setInvoiceData(mergedInvoiceData);
      setPopupMessage("Fee Invoice Generated Successfully.");
      setIsSuccess(true);
      setShowPopup(true);
      setState(prev => ({ ...prev, openModal: false, errors: {} }));
    } catch (error) {
      setPopupMessage('Error saving fee details: ' + (error.response?.data?.message || error.message));
      setIsSuccess(false);
      setShowPopup(true);
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (filterName) => {
    setState(prev => ({ ...prev, searchBy: filterName, name: '', rollNum: '', parentContact: '', error: '' }))
  };
  const formatFee = (fee) => fee ? `${Number(fee).toLocaleString()} PKR` : '0 PKR';

  useEffect(() => { fetchStudents(); fetchAllClasses(); }, []);

  const { lineItems } = state.feeDetails;
  const netFee = state.isMonthlyFee ? sumLineItems(lineItems) : state.feeDetails.netAmount;

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
          <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
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
      <Dialog open={state.openModal} onClose={() => setState(prev => ({ ...prev, openModal: false }))} maxWidth="md" fullWidth>
        <DialogTitle>Fee Report for {state.selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

            <FormControlLabel
              control={<Checkbox checked={state.isMonthlyFee} onChange={handleMonthlyFeeToggle} />}
              label="Generate Monthly Fee Invoice"
            />
            <Divider sx={{ my: 1 }} />

            {state.isMonthlyFee ? (
              <>
                <Typography variant="h6">Sessions / Services</Typography>
                <Typography variant="body2" color="text.secondary">
                  Fee per session is set per student, so the same class can be billed at a different rate for each student.
                </Typography>

                {lineItems.length === 0 ? (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', py: 1 }}>
                    No sessions added yet. Use "Add Session" below.
                  </Typography>
                ) : lineItems.map((item) => (
                  <Box key={item.key} sx={{ p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'stretch', md: 'center' }}
                    >
                      <FormControl sx={{ flex: 2, minWidth: 0 }}>
                        <InputLabel id={`service-${item.key}`}>Session / Service</InputLabel>
                        <Select
                          labelId={`service-${item.key}`}
                          label="Session / Service"
                          value={allClasses.some(c => c._id === item.classId) ? item.classId : ''}
                          onChange={(e) => handleLineItemChange(item.key, 'classId', e.target.value)}
                          displayEmpty
                          renderValue={(selected) => {
                            if (selected) {
                              const picked = allClasses.find(c => c._id === selected);
                              return picked ? picked.sclassName : item.serviceName;
                            }
                            return item.serviceName || <em>Select a class</em>;
                          }}
                        >
                          {allClasses.length === 0 && (
                            <MenuItem value="" disabled><em>No classes available</em></MenuItem>
                          )}
                          {allClasses.map((c) => (
                            <MenuItem key={c._id} value={c._id}>
                              {c.sclassName}{c.timingType ? ` — ${c.timingType}` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        label="Fee Per Session (PKR)"
                        type="number"
                        value={item.feePerSession}
                        onChange={(e) => handleLineItemChange(item.key, 'feePerSession', e.target.value)}
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{ flex: 1, minWidth: 0 }}
                      />

                      <TextField
                        label="Sessions"
                        type="number"
                        value={item.sessions}
                        onChange={(e) => handleLineItemChange(item.key, 'sessions', e.target.value)}
                        InputProps={{ inputProps: { min: 1, step: 1 } }}
                        sx={{ flex: 1, minWidth: 0 }}
                      />

                      <TextField
                        label="Total (PKR)"
                        value={lineTotal(item).toLocaleString()}
                        disabled
                        sx={{ flex: 1, minWidth: 0, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f0f0f0' } }}
                      />

                      <IconButton
                        onClick={() => handleRemoveLineItem(item.key)}
                        aria-label={`Remove ${item.serviceName || 'session'}`}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}

                <Box>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddLineItem}>
                    Add Session
                  </Button>
                </Box>

                {state.errors.lineItems && (
                  <Typography color="error" variant="body2">{state.errors.lineItems}</Typography>
                )}

                <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Net Fee
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Rs. {netFee.toLocaleString()}
                    </Typography>
                  </Stack>
                </Paper>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Admission fee mode. Tick "Generate Monthly Fee Invoice" to bill sessions and services.
              </Typography>
            )}

            <Divider sx={{ my: 1 }} />
            <TextField label="Date" type="date" name="date" value={state.feeDetails.date} onChange={handleFeeDetailChange} InputLabelProps={{ shrink: true }} />
            <TextField label="Paid Amount (PKR)" type="number" name="paid" value={state.feeDetails.paid} onChange={handleFeeDetailChange} error={!!state.errors.paid} helperText={state.errors.paid} />
            <TextField label="Net Amount (PKR)" value={state.feeDetails.netAmount} disabled sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f0f0f0' }}} />
            <TextField label="Balance (PKR)" value={state.feeDetails.balance} disabled sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f0f0f0' }}} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={() => setState(prev => ({ ...prev, openModal: false }))} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveFee}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Generating Fee Slip...' : 'Save & Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      <InvoiceDialog open={showInvoice} onClose={() => setShowInvoice(false)} data={invoiceData} />
      <CustomPopup open={showPopup} success={isSuccess} message={popupMessage} onConfirm={() => { setShowPopup(false); setShowInvoice(true); }} onClose={() => setShowPopup(false)} />
    </Box>
  );
};

export default AdminFees;
