import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InvoiceDialog from '../../components/InvoiceDialog';

// Fee type codes already used by the fee portal and the student registration flow.
const FEE_TYPES = [
    { value: 'All', label: 'All types' },
    { value: 'ConsultancyFees', label: 'Consultancy' },
    { value: 'AdmissionsFees', label: 'Admission / Registration' },
    { value: 'MonthlyFees', label: 'Monthly' },
];

const TYPE_LABEL = {
    '0': 'Consultancy',
    '1': 'Admission',
    '2': 'Monthly',
};

const SEARCH_FIELDS = [
    { value: 'rollNum', label: 'Roll Number' },
    { value: 'name', label: 'Student Name' },
    { value: 'parentContact', label: 'Parent Contact' },
    { value: 'invoiceID', label: 'Invoice No.' },
];

const money = (v) => `Rs. ${Number(v || 0).toLocaleString()}`;

const RecordRow = ({ record, onView }) => {
    const [open, setOpen] = useState(false);
    const items = Array.isArray(record.lineItems) ? record.lineItems : [];
    const paid = Number(record.paidFee) || 0;
    const net = Number(record.netTotalFee) || 0;
    const balance = net - paid;

    return (
        <>
            <TableRow hover>
                <TableCell sx={{ width: 48 }}>
                    {items.length > 0 && (
                        <IconButton
                            size="small"
                            onClick={() => setOpen(!open)}
                            aria-label={open ? 'Hide breakdown' : 'Show breakdown'}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell>{record.invoiceID || '—'}</TableCell>
                <TableCell>{record.rollNum || '—'}</TableCell>
                <TableCell>{record.name || '—'}</TableCell>
                <TableCell>{record.date || '—'}</TableCell>
                <TableCell>
                    <Chip
                        size="small"
                        variant="outlined"
                        label={TYPE_LABEL[record.isConsultancyOrIsRegistrationOrMonthly] || 'Other'}
                    />
                </TableCell>
                <TableCell align="right">{money(net)}</TableCell>
                <TableCell align="right">{money(paid)}</TableCell>
                <TableCell align="right" sx={{ color: balance > 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                    {money(balance)}
                </TableCell>
                <TableCell align="center">
                    <Button size="small" variant="outlined" startIcon={<ReceiptLongIcon />} onClick={() => onView(record)}>
                        Slip
                    </Button>
                </TableCell>
            </TableRow>

            {items.length > 0 && (
                <TableRow>
                    <TableCell sx={{ py: 0, border: 0 }} colSpan={10}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ my: 2, ml: 6 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Sessions / Services</Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Session / Service</TableCell>
                                            <TableCell align="right">Fee</TableCell>
                                            <TableCell align="right">Sessions</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.serviceName}</TableCell>
                                                <TableCell align="right">{Number(item.feePerSession || 0).toLocaleString()}</TableCell>
                                                <TableCell align="right">{item.sessions}</TableCell>
                                                <TableCell align="right">{Number(item.total || 0).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

const FeeRecords = () => {
    const [searchBy, setSearchBy] = useState('rollNum');
    const [searchValue, setSearchValue] = useState('');
    const [feeTypeFilter, setFeeTypeFilter] = useState('All');

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState({});

    const runSearch = useCallback(async (value, by, type) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/fetchStudentFee/filter`, {
                searchBy: by,
                searchValue: value,
                feeTypeFilter: type,
            });
            // The endpoint answers with { message } instead of [] when nothing matches.
            const data = Array.isArray(res.data) ? res.data : [];
            const sorted = [...data].sort(
                (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
            );
            setRecords(sorted);
            setPage(0);
        } catch (err) {
            console.error('Fee record search failed:', err);
            setRecords([]);
            setError('Unable to load fee records. Please try again.');
        } finally {
            setLoading(false);
            setSearched(true);
        }
    }, []);

    // Show the most recent records straight away rather than an empty screen.
    useEffect(() => {
        runSearch('', 'rollNum', 'All');
    }, [runSearch]);

    const handleSearch = () => runSearch(searchValue.trim(), searchBy, feeTypeFilter);

    const handleView = (record) => {
        setInvoiceData(record);
        setShowInvoice(true);
    };

    const totalNet = records.reduce((sum, r) => sum + (Number(r.netTotalFee) || 0), 0);
    const totalPaid = records.reduce((sum, r) => sum + (Number(r.paidFee) || 0), 0);

    const lastPage = Math.max(0, Math.ceil(records.length / rowsPerPage) - 1);
    const currentPage = Math.min(page, lastPage);
    const visible = records.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Fee Records</Typography>
                <Typography variant="body2" color="text.secondary">
                    Every fee slip generated for a student, searchable by roll number.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel id="search-by">Search by</InputLabel>
                        <Select
                            labelId="search-by"
                            label="Search by"
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                        >
                            {SEARCH_FIELDS.map((f) => (
                                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label={SEARCH_FIELDS.find((f) => f.value === searchBy)?.label}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{ flex: 1, minWidth: 0 }}
                    />

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="fee-type">Fee type</InputLabel>
                        <Select
                            labelId="fee-type"
                            label="Fee type"
                            value={feeTypeFilter}
                            onChange={(e) => setFeeTypeFilter(e.target.value)}
                        >
                            {FEE_TYPES.map((t) => (
                                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </Stack>
            </Paper>

            {records.length > 0 && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">RECORDS</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{records.length}</Typography>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">TOTAL BILLED</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{money(totalNet)}</Typography>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">TOTAL PAID</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{money(totalPaid)}</Typography>
                    </Paper>
                </Stack>
            )}

            <Paper variant="outlined">
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                        <Button variant="outlined" onClick={handleSearch}>Try Again</Button>
                    </Box>
                ) : records.length === 0 ? (
                    <Box sx={{ p: 5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>No fee records found</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {searched && searchValue
                                ? `Nothing matched "${searchValue}".`
                                : 'Fee records appear here once a slip has been generated.'}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell>Invoice No.</TableCell>
                                        <TableCell>Roll No.</TableCell>
                                        <TableCell>Student</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Net</TableCell>
                                        <TableCell align="right">Paid</TableCell>
                                        <TableCell align="right">Balance</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {visible.map((record) => (
                                        <RecordRow key={record._id || record.invoiceID} record={record} onView={handleView} />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={records.length}
                            rowsPerPage={rowsPerPage}
                            page={currentPage}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </>
                )}
            </Paper>

            <InvoiceDialog open={showInvoice} onClose={() => setShowInvoice(false)} data={invoiceData} />
        </Container>
    );
};

export default FeeRecords;
