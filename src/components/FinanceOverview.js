import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import {
    Box,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PaymentsIcon from '@mui/icons-material/Payments';
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

const num = (v) => Number(v) || 0;
const money = (v) => `Rs. ${num(v).toLocaleString()}`;

const monthKey = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const Tile = ({ icon: Icon, accent, label, value, caption, loading, prefix }) => (
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
                        <CountUp end={value} duration={1.2} separator="," prefix={prefix || ''} />
                    </Typography>
                )}
                {caption && (
                    <Typography variant="caption" color="text.secondary">{caption}</Typography>
                )}
            </Box>
        </Stack>
    </Paper>
);

const ChartCard = ({ title, subtitle, loading, empty, height = 280, children }) => (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {subtitle}
            </Typography>
        )}
        <Box sx={{ height }}>
            {loading ? (
                <Skeleton variant="rounded" width="100%" height="100%" />
            ) : empty ? (
                <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No data for this yet.</Typography>
                </Box>
            ) : children}
        </Box>
    </Paper>
);

// Fee and salary figures for the dashboard, derived from the records the system
// already stores. Nothing here is a fabricated metric.
const FinanceOverview = () => {
    const theme = useTheme();
    const [fees, setFees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const base = process.env.REACT_APP_BASE_URL;
            const [feeRes, salRes] = await Promise.all([
                axios.post(`${base}/fetchStudentFee/filter`, { searchBy: 'rollNum', searchValue: '', feeTypeFilter: 'All' })
                    .then((r) => r.data).catch(() => null),
                axios.post(`${base}/fetchTeacherSalaries/filter`, { searchBy: 'name', searchValue: '' })
                    .then((r) => r.data).catch(() => null),
            ]);
            if (cancelled) return;
            // Both endpoints answer with { message } instead of [] when empty.
            setFees(Array.isArray(feeRes) ? feeRes : []);
            setSalaries(Array.isArray(salRes) ? salRes : []);
            setFailed(feeRes === null && salRes === null);
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, []);

    // A student counts as owing if their fee records together leave a balance.
    const studentDues = useMemo(() => {
        const byStudent = {};
        fees.forEach((r) => {
            const key = r.rollNum || r._id;
            if (!key) return;
            byStudent[key] = byStudent[key] || { billed: 0, paid: 0 };
            byStudent[key].billed += num(r.netTotalFee);
            byStudent[key].paid += num(r.paidFee);
        });
        const all = Object.values(byStudent);
        const owing = all.filter((s) => s.billed - s.paid > 0);
        return {
            total: all.length,
            owing: owing.length,
            settled: all.length - owing.length,
            outstanding: owing.reduce((sum, s) => sum + (s.billed - s.paid), 0),
            collected: all.reduce((sum, s) => sum + s.paid, 0),
        };
    }, [fees]);

    const salaryStats = useMemo(() => {
        const paidRecords = salaries.filter((s) => String(s.isPaid) === '1');
        return {
            count: salaries.length,
            paidCount: paidRecords.length,
            paidAmount: salaries.reduce((sum, s) => sum + num(s.paidAmount), 0),
            netAmount: salaries.reduce((sum, s) => sum + num(s.netSalary), 0),
        };
    }, [salaries]);

    // Fees collected against salaries paid, month by month.
    const monthly = useMemo(() => {
        const acc = {};
        fees.forEach((r) => {
            const k = monthKey(r.date || r.createdAt);
            if (!k) return;
            acc[k] = acc[k] || { month: k, feesBilled: 0, feesPaid: 0, salariesPaid: 0 };
            acc[k].feesBilled += num(r.netTotalFee);
            acc[k].feesPaid += num(r.paidFee);
        });
        salaries.forEach((s) => {
            const k = monthKey(s.date || s.createdAt);
            if (!k) return;
            acc[k] = acc[k] || { month: k, feesBilled: 0, feesPaid: 0, salariesPaid: 0 };
            acc[k].salariesPaid += num(s.paidAmount);
        });
        return Object.values(acc).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
    }, [fees, salaries]);

    const duesSplit = useMemo(() => ([
        { name: 'Fully paid', value: studentDues.settled, color: '#3DBE72' },
        { name: 'With dues', value: studentDues.owing, color: '#F43F5E' },
    ].filter((d) => d.value > 0)), [studentDues]);

    const axisStyle = { fontSize: 12, fill: theme.palette.text.secondary };
    const tooltipStyle = {
        borderRadius: 10,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
    };

    if (failed) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Fee and salary figures are unavailable right now.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Fees &amp; Salaries</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                From the fee slips and salary slips already recorded.
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Tile
                        icon={PendingActionsIcon} accent="#F43F5E" label="Students With Dues"
                        value={studentDues.owing} caption={`of ${studentDues.total} billed`} loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Tile
                        icon={GroupsIcon} accent="#3DBE72" label="Fully Paid Students"
                        value={studentDues.settled} caption="no balance left" loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Tile
                        icon={PriceCheckIcon} accent="#7C3AED" label="Fees Collected"
                        value={studentDues.collected} prefix="Rs. "
                        caption={`${money(studentDues.outstanding)} outstanding`} loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Tile
                        icon={PaymentsIcon} accent="#F59E0B" label="Salaries Paid"
                        value={salaryStats.paidAmount} prefix="Rs. "
                        caption={`${salaryStats.paidCount} of ${salaryStats.count} slips`} loading={loading}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2.5}>
                <Grid item xs={12} md={8}>
                    <ChartCard
                        title="Money In and Out"
                        subtitle="Fees billed, fees collected and salaries paid, by month"
                        loading={loading}
                        empty={monthly.length === 0}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
                                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={70} />
                                <RTooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="feesBilled" name="Fees billed" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={22} />
                                <Bar dataKey="feesPaid" name="Fees collected" fill="#3DBE72" radius={[6, 6, 0, 0]} maxBarSize={22} />
                                <Bar dataKey="salariesPaid" name="Salaries paid" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={4}>
                    <ChartCard
                        title="Students by Payment Status"
                        subtitle="Counted across all their fee slips"
                        loading={loading}
                        empty={duesSplit.length === 0}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={duesSplit} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                                    {duesSplit.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Pie>
                                <RTooltip formatter={(v, n) => [`${v} student${v === 1 ? '' : 's'}`, n]} contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FinanceOverview;
