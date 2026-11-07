import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Skeleton, Stack, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import SeeNotice from '../../components/SeeNotice';
import FinanceOverview from '../../components/FinanceOverview';
import AttendanceToday from '../../components/AttendanceToday';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const list = (v) => (Array.isArray(v) ? v : []);
const formatNumber = (n) => Number(n || 0).toLocaleString();

/** One figure on the dashboard: icon + label, the number, then a short explanation. */
const StatCard = ({ icon: Icon, label, value, detail, note, loading }) => (
    <Paper
        variant="outlined"
        sx={{
            p: { xs: 2.25, md: 2.75 },
            height: '100%',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            transition: 'border-color .15s ease, box-shadow .15s ease',
            '&:hover': { borderColor: 'primary.main', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.primary.main, 0.12)}` },
        }}
    >
        <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
                sx={{
                    width: 32, height: 32, borderRadius: '8px', display: 'grid', placeItems: 'center',
                    color: 'primary.dark', bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                }}
            >
                <Icon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
                {label}
            </Typography>
        </Stack>
        {loading ? (
            <Skeleton variant="text" width={110} height={48} />
        ) : (
            <Typography sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 800, lineHeight: 1.15, color: 'text.primary' }}>
                {value}
            </Typography>
        )}
        {detail && <Typography variant="body2" color="text.secondary">{detail}</Typography>}
        {note && <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.85, mt: 'auto', pt: 0.5 }}>{note}</Typography>}
    </Paper>
);

const SectionCard = ({ title, subtitle, children }) => (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: '14px' }}>
        {title && (
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
                {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
            </Box>
        )}
        {children}
    </Paper>
);

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList, loading: studentsLoading } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);
    const adminID = currentUser._id;

    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
    const [monthTotal, setMonthTotal] = useState(null);
    const [todayTotal, setTodayTotal] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [pendingConsultations, setPendingConsultations] = useState(null);

    const loadFees = useCallback(async (month) => {
        const base = process.env.REACT_APP_BASE_URL;
        const [monthly, daily] = await Promise.allSettled([
            axios.get(`${base}/TotalStudentsFeeCollections`, { params: { month } }),
            axios.get(`${base}/TotalDailyStudentsFeeCollections`),
        ]);
        setMonthTotal(monthly.status === 'fulfilled' ? monthly.value.data.totalFee || 0 : 0);
        setTodayTotal(daily.status === 'fulfilled' ? daily.value.data.totalFee || 0 : 0);
    }, []);

    const refresh = useCallback(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, 'Sclass'));
        dispatch(getAllTeachers(adminID));
        loadFees(selectedMonth);
        axios.get(`${process.env.REACT_APP_BASE_URL}/consultations/${adminID}`, { params: { status: 'pending' } })
            .then(({ data }) => setPendingConsultations(Array.isArray(data) ? data.length : 0))
            .catch(() => setPendingConsultations(0));
        setUpdatedAt(new Date());
    }, [adminID, dispatch, loadFees, selectedMonth]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { refresh(); }, [adminID]);

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        setMonthTotal(null);
        loadFees(event.target.value);
    };

    const figures = useMemo(() => {
        const students = list(studentsList);
        const staff = list(teachersList);
        // Older records may still be consultant students; new consultations are counted separately.
        const legacyConsultations = students.filter((s) => s.isConsultantStudent).length;
        const consultations = legacyConsultations + (pendingConsultations || 0);
        const teachers = staff.filter((t) => String(t.role || '').toLowerCase() === 'teacher').length;
        const interns = staff.filter((t) => /^intern$/i.test(String(t.role || '').trim())).length;
        return {
            admitted: students.length - legacyConsultations,
            consultations,
            staff: staff.length,
            teachers,
            interns,
            classes: list(sclassesList).length,
        };
    }, [studentsList, teachersList, sclassesList, pendingConsultations]);

    const cards = [
        { icon: SchoolOutlinedIcon, label: 'Students', value: formatNumber(figures.admitted), detail: `${formatNumber(figures.consultations)} awaiting admission`, note: 'Students admitted through Add Student.' },
        { icon: AssignmentIndOutlinedIcon, label: 'Consultations', value: pendingConsultations === null ? null : formatNumber(figures.consultations), detail: 'Seen, not yet admitted', note: 'Admit them from the Consultations page.' },
        { icon: BadgeOutlinedIcon, label: 'Staff', value: formatNumber(figures.staff), detail: `${formatNumber(figures.teachers)} teachers${figures.interns ? ` · ${formatNumber(figures.interns)} interns` : ''}`, note: 'Everyone on the staff list, all designations.' },
        { icon: ClassOutlinedIcon, label: 'Classes', value: formatNumber(figures.classes), detail: 'Therapy programmes offered', note: 'Each class sets its own session fee.' },
        { icon: TodayOutlinedIcon, label: 'Collected Today', value: todayTotal === null ? null : `Rs. ${formatNumber(todayTotal)}`, detail: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }), note: 'Payments recorded on fee slips today.' },
        { icon: CalendarMonthOutlinedIcon, label: `Collected in ${selectedMonth}`, value: monthTotal === null ? null : `Rs. ${formatNumber(monthTotal)}`, detail: 'Fee slips dated this month', note: 'Change the month at the top of the page.' },
    ];

    return (
        <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, md: 3.5 }, maxWidth: 1600, mx: 'auto' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1.75} alignItems="center">
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', display: 'grid', placeItems: 'center', color: 'primary.dark', bgcolor: (t) => alpha(t.palette.primary.main, 0.12) }}>
                        <SpaceDashboardOutlinedIcon />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, lineHeight: 1.15 }}>Dashboard</Typography>
                        <Typography variant="body2" color="text.secondary">Students, staff, classes and fee collection at a glance</Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <FormControl size="small" sx={{ minWidth: 170, flex: { xs: 1, md: 'none' } }}>
                        <InputLabel id="dashboard-month">Month</InputLabel>
                        <Select labelId="dashboard-month" label="Month" value={selectedMonth} onChange={handleMonthChange}>
                            {MONTHS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>Refresh</Button>
                </Stack>
            </Stack>
            {updatedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -2, mb: 2 }}>
                    Counted {updatedAt.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
            )}

            <Grid container spacing={2.5}>
                {cards.map((card) => (
                    <Grid item xs={12} sm={6} lg={4} key={card.label}>
                        <StatCard {...card} loading={card.value === null || (studentsLoading && !list(studentsList).length)} />
                    </Grid>
                ))}
                <Grid item xs={12}>
                    <AttendanceToday refreshKey={updatedAt ? updatedAt.getTime() : 0} />
                </Grid>
                <Grid item xs={12}>
                    <FinanceOverview />
                </Grid>
                <Grid item xs={12}>
                    <SectionCard>
                        <SeeNotice />
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminHomePage;
