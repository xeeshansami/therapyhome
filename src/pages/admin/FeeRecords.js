import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Skeleton,
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
    useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RTooltip,
    XAxis,
    YAxis,
} from 'recharts';
import InvoiceDialog from '../../components/InvoiceDialog';

// Fee type codes already used by the fee portal and the registration flow.
const FEE_TYPES = [
    { value: 'All', label: 'All types' },
    { value: 'ConsultancyFees', label: 'Consultancy' },
    { value: 'AdmissionsFees', label: 'Admission / Registration' },
    { value: 'MonthlyFees', label: 'Monthly' },
];

const TYPE_LABEL = { '0': 'Consultancy', '1': 'Admission', '2': 'Monthly' };
const TYPE_COLOR = { '0': '#7C3AED', '1': '#F59E0B', '2': '#3DBE72', other: '#94A3B8' };

const SEARCH_FIELDS = [
    { value: 'rollNum', label: 'Roll Number' },
    { value: 'name', label: 'Student Name' },
    { value: 'parentContact', label: 'Parent Contact' },
    { value: 'invoiceID', label: 'Invoice No.' },
];

const money = (v) => `Rs. ${Number(v || 0).toLocaleString()}`;
const num = (v) => Number(v) || 0;

const StatCard = ({ icon: Icon, accent, label, value, loading }) => (
    <Paper variant="outlined" sx={{ p: 2.25, height: '100%' }}>
        <Stack direction="row" spacing={1.75} alignItems="center">
            <Box
                sx={{
                    width: 42, height: 42, flex: '0 0 42px', borderRadius: '12px',
                    display: 'grid', placeItems: 'center',
                    bgcolor: `${accent}1f`, color: accent,
                }}
            >
                <Icon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    {label}
                </Typography>
                {loading ? (
                    <Skeleton variant="text" width={90} height={30} />
                ) : (
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        <CountUp end={value} duration={1.2} separator="," prefix={label === 'Records' ? '' : 'Rs. '} />
                    </Typography>
                )}
            </Box>
        </Stack>
    </Paper>
);

const ChartCard = ({ title, subtitle, loading, empty, children }) => (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {subtitle}
            </Typography>
        )}
        <Box sx={{ height: 260 }}>
            {loading ? (
                <Skeleton variant="rounded" width="100%" height="100%" />
            ) : empty ? (
                <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Nothing to chart yet.</Typography>
                </Box>
            ) : children}
        </Box>
    </Paper>
);

const RecordRow = ({ record, onView }) => {
    const [open, setOpen] = useState(false);
    const items = Array.isArray(record.lineItems) ? record.lineItems : [];
    const paid = num(record.paidFee);
    const net = num(record.netTotalFee);
    const balance = net - paid;

    return (
        <>
            <TableRow hover>
                <TableCell sx={{ width: 48 }}>
                    {items.length > 0 && (
                        <IconButton size="small" onClick={() => setOpen(!open)} aria-label={open ? 'Hide breakdown' : 'Show breakdown'}>
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
                                                <TableCell align="right">{num(item.feePerSession).toLocaleString()}</TableCell>
                                                <TableCell align="right">{item.sessions}</TableCell>
                                                <TableCell align="right">{num(item.total).toLocaleString()}</TableCell>
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

const TableSkeleton = () => (
    <Box sx={{ p: 2 }}>
        {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={44} sx={{ mb: 1.25 }} />
        ))}
    </Box>
);

const FeeRecords = () => {
    const theme = useTheme();

    const [searchBy, setSearchBy] = useState('rollNum');
    const [searchValue, setSearchValue] = useState('');
    const [feeTypeFilter, setFeeTypeFilter] = useState('All');

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => { runSearch('', 'rollNum', 'All'); }, [runSearch]);

    const handleSearch = () => runSearch(searchValue.trim(), searchBy, feeTypeFilter);

    const handleView = (record) => {
        setInvoiceData(record);
        setShowInvoice(true);
    };

    const totals = useMemo(() => {
        const billed = records.reduce((s, r) => s + num(r.netTotalFee), 0);
        const paid = records.reduce((s, r) => s + num(r.paidFee), 0);
        return { billed, paid, outstanding: billed - paid };
    }, [records]);

    // Billed amount split by the fee type already stored on each record.
    const byType = useMemo(() => {
        const acc = {};
        records.forEach((r) => {
            const key = r.isConsultancyOrIsRegistrationOrMonthly;
            const label = TYPE_LABEL[key] || 'Other';
            acc[label] = acc[label] || { name: label, value: 0, color: TYPE_COLOR[key] || TYPE_COLOR.other };
            acc[label].value += num(r.netTotalFee);
        });
        return Object.values(acc).filter((d) => d.value > 0);
    }, [records]);

    // Billed vs paid per month, taken from each record's own date.
    const byMonth = useMemo(() => {
        const acc = {};
        records.forEach((r) => {
            const d = new Date(r.date || r.createdAt);
            if (Number.isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            acc[key] = acc[key] || { month: key, billed: 0, paid: 0 };
            acc[key].billed += num(r.netTotalFee);
            acc[key].paid += num(r.paidFee);
        });
        return Object.values(acc).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
    }, [records]);

    const lastPage = Math.max(0, Math.ceil(records.length / rowsPerPage) - 1);
    const currentPage = Math.min(page, lastPage);
    const visible = records.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

    const axisStyle = { fontSize: 12, fill: theme.palette.text.secondary };

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
                        <Select labelId="search-by" label="Search by" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                            {SEARCH_FIELDS.map((f) => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
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
                        <Select labelId="fee-type" label="Fee type" value={feeTypeFilter} onChange={(e) => setFeeTypeFilter(e.target.value)}>
                            {FEE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
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

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={ReceiptIcon} accent="#2563EB" label="Records" value={records.length} loading={loading} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={AccountBalanceWalletIcon} accent="#7C3AED" label="Total Billed" value={totals.billed} loading={loading} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={PaymentsIcon} accent="#3DBE72" label="Total Paid" value={totals.paid} loading={loading} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={PendingActionsIcon} accent="#F43F5E" label="Outstanding" value={totals.outstanding} loading={loading} />
                </Grid>
            </Grid>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} md={7}>
                    <ChartCard
                        title="Billed vs Paid"
                        subtitle="By month, from the date on each record"
                        loading={loading}
                        empty={byMonth.length === 0}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byMonth} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
                                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={70} />
                                <RTooltip
                                    formatter={(v) => money(v)}
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: `1px solid ${theme.palette.divider}`,
                                        background: theme.palette.background.paper,
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="billed" name="Billed" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="paid" name="Paid" fill="#3DBE72" radius={[6, 6, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={5}>
                    <ChartCard
                        title="Billed by Fee Type"
                        subtitle="Share of the amount billed"
                        loading={loading}
                        empty={byType.length === 0}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={byType}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="55%"
                                    outerRadius="80%"
                                    paddingAngle={2}
                                >
                                    {byType.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Pie>
                                <RTooltip
                                    formatter={(v) => money(v)}
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: `1px solid ${theme.palette.divider}`,
                                        background: theme.palette.background.paper,
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>
            </Grid>

            <Paper variant="outlined">
                {loading ? (
                    <TableSkeleton />
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
