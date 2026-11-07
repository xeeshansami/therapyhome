import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Avatar, // Import Avatar component
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  Stack,
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SalarySlipDialog from '../../components/SalarySlipDialog';
import { isUnpaidIntern } from '../../utils/staffForm';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { DEDUCTION_TYPES, DEFAULT_PAYROLL_POLICY, suggestedAmount, ruleText, totalDeductions, dailyRate } from '../../utils/payroll';

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
          {success ? "View Salary Slip" : "Close"}
        </Button>
      </div>
    </div>
  );
};

// --- Main Component ---
const TeachersSalary = () => {
  // --- UI Control States ---
  const [showSalarySlip, setShowSalarySlip] = useState(false);
  const [salarySlipData, setSalarySlipData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedSlipNo, setGeneratedSlipNo] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  // --- Main Component State ---
  const [state, setState] = useState({
    searchBy: 'Name',
    name: '',
    phone: '',
    teacherData: [],
    filteredData: [],
    error: '',
    errors: {},
    loading: false,
    openModal: false,
    selectedTeacher: null,
    salaryDetails: {
      date: new Date().toISOString().split('T')[0],
      baseSalary: 0,
      bonus: '',
      deductions: '',
      netSalary: 0,
      paidAmount: 0,
      remark: '',
    },
  });

  // --- API & Data Fetching ---
  const API_BASE_URL = process.env.REACT_APP_BASE_URL;
  const { currentUser } = useSelector((s) => s.user);
  const SCHOOL_ID = currentUser?._id || '68795ab802f2887382d217b0';
  // Deduction policy from Settings (defaults until it loads).
  const [policy, setPolicy] = useState(DEFAULT_PAYROLL_POLICY);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BASE_URL}/Admin/${SCHOOL_ID}/settings`)
      .then(({ data }) => data?.payrollPolicy && setPolicy({ ...DEFAULT_PAYROLL_POLICY, ...data.payrollPolicy }))
      .catch(() => {});
  }, [SCHOOL_ID]);

  const fetchNextSlipNo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/salary-slips/next-number`);
      setGeneratedSlipNo(response.data?.invoiceNum || `TSAL${Date.now()}`);
    } catch (error) {
      console.error("Error fetching next salary slip number:", error);
      setGeneratedSlipNo(`Error-${Date.now()}`);
    }
  };

  const fetchAllTeachers = async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await axios.get(`${API_BASE_URL}/Teachers/${SCHOOL_ID}`);
      // Unpaid interns never receive payroll payments, so they are not listed here.
      const data = response.data?.length > 0
        ? response.data.filter((t) => !isUnpaidIntern(t)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setState(prev => ({
        ...prev,
        teacherData: data,
        filteredData: data,
        loading: false,
        error: data.length === 0 ? 'No Staff found.' : ''
      }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Error fetching teacher data.' }));
    }
  };

  // --- Salary Calculation Logic ---
  const calculateNetSalary = (details) => {
    const base = parseFloat(details.baseSalary) || 0;
    const bonus = parseFloat(details.bonus) || 0;
    const deductions = parseFloat(details.deductions) || 0;
    return base + bonus - deductions;
  };

  // --- Event Handlers ---
  const handleSearch = () => {
    const { searchBy, name, phone, teacherData } = state;
    let filtered = [];
    if (searchBy === 'Name' && name.trim()) {
      filtered = teacherData.filter(teacher =>
        teacher.name.toLowerCase().includes(name.trim().toLowerCase())
      );
    } else if (searchBy === 'Phone' && phone.trim()) {
      filtered = teacherData.filter(teacher =>
        teacher.phone.includes(phone.trim())
      );
    } else {
      filtered = teacherData;
    }
    setState(prev => ({ ...prev, filteredData: filtered, error: filtered.length === 0 ? 'No matching Staff found.' : '' }));
  };

  const handleShowAll = () => {
    setState(prev => ({
      ...prev,
      filteredData: prev.teacherData,
      name: '',
      phone: '',
      error: ''
    }));
  };

  const handleOpenModal = async (teacher) => {
    setState(prev => ({ ...prev, loading: true }));
    await fetchNextSlipNo();
    try {
      const response = await axios.get(`${API_BASE_URL}/Teacher/${teacher._id}`);
      const detailedTeacher = response.data;
      const baseSalary = parseFloat(detailedTeacher.salary) || 0;
      setState(prev => ({
        ...prev,
        openModal: true,
        selectedTeacher: detailedTeacher,
        loading: false,
        errors: {},
        salaryDetails: {
          ...prev.salaryDetails,
          date: new Date().toISOString().split('T')[0],
          baseSalary: baseSalary,
          bonus: '',
          deductions: '',
          deductionItems: [],
          netSalary: baseSalary,
          paidAmount: baseSalary,
          remark: '',
        },
      }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Could not fetch teacher details.' }));
    }
  };

  const handleSalaryDetailChange = (e) => {
    const { name, value } = e.target;
    setState(prev => {
      const newSalaryDetails = { ...prev.salaryDetails, [name]: value };
      const newNetSalary = calculateNetSalary(newSalaryDetails);
      const newPaidAmount = (name !== 'paidAmount') ? newNetSalary : value;
      return {
        ...prev,
        salaryDetails: { ...newSalaryDetails, netSalary: newNetSalary, paidAmount: newPaidAmount },
        errors: {}
      };
    });
  };

  // --- Deduction rows: amounts follow the policy and stay editable ---
  const applyDeductionItems = (items) => {
    setState(prev => {
      const total = totalDeductions(items);
      const details = { ...prev.salaryDetails, deductionItems: items, deductions: items.length ? String(total) : prev.salaryDetails.deductions };
      const net = calculateNetSalary(details);
      return { ...prev, salaryDetails: { ...details, netSalary: net, paidAmount: net }, errors: {} };
    });
  };

  const addDeductionRow = () => {
    const base = state.salaryDetails.baseSalary;
    applyDeductionItems([...(state.salaryDetails.deductionItems || []), { type: 'absent', count: 1, amount: suggestedAmount('absent', 1, base, policy), note: '' }]);
  };

  const updateDeductionRow = (index, field, value) => {
    const base = state.salaryDetails.baseSalary;
    const items = (state.salaryDetails.deductionItems || []).map((row, i) => {
      if (i !== index) return row;
      const next = { ...row, [field]: value };
      // Changing the type or count re-applies the policy; typing an amount overrides it.
      if ((field === 'type' || field === 'count') && next.type !== 'other') next.amount = suggestedAmount(next.type, next.count, base, policy);
      if (field === 'type' && value === 'other') { next.count = 0; next.amount = ''; }
      return next;
    });
    applyDeductionItems(items);
  };

  const removeDeductionRow = (index) => applyDeductionItems((state.salaryDetails.deductionItems || []).filter((_, i) => i !== index));

  const handleSaveSalary = async () => {
    const { salaryDetails, selectedTeacher } = state;
    if (salaryDetails.paidAmount === '' || isNaN(parseFloat(salaryDetails.paidAmount))) {
      setState(prev => ({ ...prev, errors: { paidAmount: 'Paid amount is invalid.' } }));
      return;
    }

    const payload = {
      adminID: SCHOOL_ID,
      cnic: selectedTeacher.cnic,
      email: selectedTeacher.email,
      teachSclass: selectedTeacher.teachSclass,
      maritalStatus: selectedTeacher.maritalStatus,
      gender: selectedTeacher.gender,
      teacherID: selectedTeacher._id,
      name: selectedTeacher.name,
      phone: selectedTeacher.phone,
      emergencyContact: selectedTeacher.emergencyContact,
      date: salaryDetails.date,
      salary: selectedTeacher.salary,
      baseSalary: salaryDetails.baseSalary,
      bonus: parseFloat(salaryDetails.bonus) || 0,
      deductions: parseFloat(salaryDetails.deductions) || 0,
      // The server totals these rows and works out the net itself.
      deductionItems: (salaryDetails.deductionItems || []).map((r) => ({ type: r.type, count: Number(r.count) || 0, amount: Number(r.amount) || 0, note: r.note || '' })),
      netSalary: salaryDetails.netSalary,
      isPaid: "1",
      paidAmount: parseFloat(salaryDetails.paidAmount),
      remark: salaryDetails.remark,
      invoiceID: generatedSlipNo,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/teacherSalaryReg`, payload);
      debugger
      setSalarySlipData({ ...payload, ...response.data });
      setShowInvoice(true); // Show invoice dialog instead of navigating away immediately
      setPopupMessage("Salary Issued Successfully.");
      setIsSuccess(true);
      setShowPopup(true);
      setState(prev => ({ ...prev, openModal: false, errors: {} }));
      fetchAllTeachers();
    } catch (error) {
      debugger
      setPopupMessage('Error issuing salary: ' + (error.response?.data?.message || error.message));
      setIsSuccess(false);
      setShowPopup(true);
    }
  };

  const handleFilterChange = (filterName) => {
    setState(prev => ({ ...prev, searchBy: filterName, name: '', phone: '', error: '' }))
  };

  const formatCurrency = (amount) => amount ? `${Number(amount).toLocaleString()} PKR` : '0 PKR';

  useEffect(() => { fetchAllTeachers(); }, []);

  // --- Render Method ---
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Teachers Salary Portal</Typography>

      <FormControl component="fieldset" margin="normal">
        <FormLabel component="legend">Search By:</FormLabel>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {['Name', 'Phone'].map(filter => (
            <FormControlLabel key={filter}
              control={<Checkbox checked={state.searchBy === filter} onChange={() => handleFilterChange(filter)} />}
              label={filter}
            />
          ))}
        </Box>
      </FormControl>
      <Box sx={{ mt: 1, maxWidth: '500px' }}>
        {state.searchBy === 'Name' && <TextField label="Enter Teacher Name" value={state.name} onChange={e => setState(prev => ({ ...prev, name: e.target.value }))} onKeyPress={e => e.key === 'Enter' && handleSearch()} fullWidth />}
        {state.searchBy === 'Phone' && <TextField label="Enter Phone Number" value={state.phone} onChange={e => setState(prev => ({ ...prev, phone: e.target.value }))} onKeyPress={e => e.key === 'Enter' && handleSearch()} fullWidth />}
      </Box>
      {state.error && <Typography color="error" sx={{ mt: 2 }}>{state.error}</Typography>}
      <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
        <Button variant="contained" disabled={state.loading} onClick={handleSearch} startIcon={<SearchIcon />}>Search</Button>
        <Button variant="outlined" onClick={handleShowAll} disabled={state.loading} startIcon={<VisibilityIcon />}>Show All</Button>
      </Box>

      {state.loading ? <CircularProgress sx={{ display: 'block', margin: '40px auto' }} /> : (
        state.filteredData.length > 0 ? (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead><TableRow sx={{ backgroundColor: '#f5f5f5' }}>{['Photo', 'Name', 'Phone', 'Basic Salary', 'Joining Date', 'Actions'].map(head => <TableCell key={head} sx={{ fontWeight: 'bold' }}>{head}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {state.filteredData.map((teacher) => (
                  <TableRow key={teacher._id} hover>
                    <TableCell>
                      <Avatar src={teacher.photo} alt={teacher.name}>
                        {/* Fallback if photo is missing, shows first letter of name */}
                        {teacher.name ? teacher.name[0] : ''}
                      </Avatar>
                    </TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>{formatCurrency(teacher.salary)}</TableCell>
                    <TableCell>{new Date(teacher.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="contained" color="success" onClick={() => handleOpenModal(teacher)} disabled={state.loading}>Issue Salary</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (!state.error && <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>No teacher records to display.</Typography>)
      )}

      {/* --- Salary Dialog --- */}
      <Dialog open={state.openModal} onClose={() => setState(prev => ({ ...prev, openModal: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Salary for {state.selectedTeacher?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Date" type="date" name="date" value={state.salaryDetails.date} onChange={handleSalaryDetailChange} InputLabelProps={{ shrink: true }} />
            <TextField label="Basic Salary" value={state.salaryDetails.baseSalary} disabled InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000' } }} />
            <TextField label="Bonus" type="number" name="bonus" value={state.salaryDetails.bonus} onChange={handleSalaryDetailChange} InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} />
            <Box sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: '12px', p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Attendance deductions</Typography>
                  <Typography variant="caption" color="text.secondary">
                    1 day of pay = PKR {Math.round(dailyRate(state.salaryDetails.baseSalary, policy)).toLocaleString()} (basic ÷ {policy.workingDaysPerMonth} days, set in Settings)
                  </Typography>
                </Box>
                <Button size="small" startIcon={<AddIcon />} onClick={addDeductionRow}>Add deduction</Button>
              </Stack>
              {(state.salaryDetails.deductionItems || []).map((row, i) => {
                const meta = DEDUCTION_TYPES.find((t) => t.value === row.type) || DEDUCTION_TYPES[0];
                return (
                  <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }} sx={{ mt: 1.5 }}>
                    <FormControl size="small" sx={{ minWidth: 170 }}>
                      <InputLabel id={`ded-type-${i}`}>Type</InputLabel>
                      <Select labelId={`ded-type-${i}`} label="Type" value={row.type} onChange={(e) => updateDeductionRow(i, 'type', e.target.value)}>
                        {DEDUCTION_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                    {row.type === 'other' ? (
                      <TextField size="small" label="Reason" value={row.note} onChange={(e) => updateDeductionRow(i, 'note', e.target.value)} sx={{ flex: 1 }} />
                    ) : (
                      <TextField size="small" type="number" label={meta.countLabel} value={row.count} onChange={(e) => updateDeductionRow(i, 'count', e.target.value)}
                        inputProps={{ min: 0, step: 1 }} helperText={ruleText(row.type, policy)} sx={{ flex: 1 }} />
                    )}
                    <TextField size="small" type="number" label="Amount" value={row.amount} onChange={(e) => updateDeductionRow(i, 'amount', e.target.value)}
                      inputProps={{ min: 0 }} InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} sx={{ width: { sm: 160 } }} />
                    <IconButton aria-label="Remove deduction" color="error" onClick={() => removeDeductionRow(i)}><DeleteOutlineIcon /></IconButton>
                  </Stack>
                );
              })}
            </Box>
            <TextField
              label="Total Deductions"
              type="number"
              name="deductions"
              value={state.salaryDetails.deductions}
              onChange={handleSalaryDetailChange}
              InputProps={{ readOnly: (state.salaryDetails.deductionItems || []).length > 0, startAdornment: <InputAdornment position="start">PKR</InputAdornment> }}
              helperText={(state.salaryDetails.deductionItems || []).length > 0 ? 'Total of the rows above. Edit a row to change it.' : 'Enter an amount, or add deduction rows above.'}
            />
            <Divider sx={{ my: 1 }} />
            <TextField label="Net Salary" value={state.salaryDetails.netSalary} disabled InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f0f0f0' } }} />
            <TextField label="Paid Amount" type="number" name="paidAmount" value={state.salaryDetails.paidAmount} onChange={handleSalaryDetailChange} error={!!state.errors.paidAmount} helperText={state.errors.paidAmount} InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} />
            <TextField label="Remark" name="remark" value={state.salaryDetails.remark} onChange={handleSalaryDetailChange} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={() => setState(prev => ({ ...prev, openModal: false }))}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSalary}>Save & Issue</Button>
        </DialogActions>
      </Dialog>

      <CustomPopup
        open={showPopup}
        success={isSuccess}
        message={popupMessage}
        onConfirm={() => { setShowPopup(false); }}
        onClose={() => setShowPopup(false)}
      />
      <SalarySlipDialog open={showInvoice} onClose={() => setShowInvoice(false)} data={salarySlipData} />
    </Box>

  );
};

export default TeachersSalary;