import React from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Grid,
    Box,
    Button,
    Typography,
    Stack,
    Card,
    CardContent,
    Avatar,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    CalendarCheck,
    Users,
    ClipboardList,
    BarChart3,
    Wallet,
    ShieldCheck,
    ArrowRight,
    Star,
    Sparkles,
} from 'lucide-react';
import logo from '../assets/logo.png';

// ---------------------------------------------------------------------------
// Premium SaaS landing page (UI only). No business logic — the single action
// is the "Login / Get started" link to /choose, preserved from the original.
// ---------------------------------------------------------------------------

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
    }),
};

const features = [
    { icon: CalendarCheck, title: 'Session scheduling', desc: 'Organize classes, therapy sessions and appointments with an intuitive calendar-first workflow.' },
    { icon: Users, title: 'Students & staff', desc: 'Onboard students and faculty in seconds, manage roles, and keep every profile in one place.' },
    { icon: ClipboardList, title: 'Attendance tracking', desc: 'Capture attendance effortlessly and turn it into meaningful, exportable records.' },
    { icon: BarChart3, title: 'Performance insights', desc: 'Assess progress with rich charts, marks and feedback that everyone can understand.' },
    { icon: Wallet, title: 'Fees & invoicing', desc: 'Generate professional invoices, track fees and reconcile payments without spreadsheets.' },
    { icon: ShieldCheck, title: 'Role-based access', desc: 'Admin, staff and reception each get a tailored, secure workspace out of the box.' },
];

const stats = [
    { value: '10k+', label: 'Sessions managed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'Avg. rating' },
    { value: '24/7', label: 'Support' },
];

const testimonials = [
    { name: 'Dr. Amina Khan', role: 'Clinic Director', quote: 'TherapyHome replaced three tools we used to juggle. Scheduling and invoicing finally live in one place.' },
    { name: 'Bilal Ahmed', role: 'Lead Therapist', quote: 'Attendance and progress tracking take minutes now. The dashboards make reviews genuinely easy.' },
    { name: 'Sara Malik', role: 'Front Desk', quote: 'Onboarding a new student is a two-minute job. The interface feels modern and stays out of my way.' },
];

const Homepage = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const primary = theme.palette.primary.main;

    const pageBg = isDark
        ? 'radial-gradient(1200px 600px at 80% -10%, rgba(122,110,255,0.18), transparent 60%), radial-gradient(900px 500px at -10% 20%, rgba(17,179,164,0.12), transparent 55%), #0f1526'
        : 'radial-gradient(1200px 600px at 80% -10%, rgba(122,110,255,0.16), transparent 60%), radial-gradient(900px 500px at -10% 20%, rgba(17,179,164,0.10), transparent 55%), #f6f7fc';

    return (
        <Box sx={{ minHeight: '100vh', background: pageBg, overflowX: 'hidden' }}>
            {/* ---------------- Top nav ---------------- */}
            <Box
                component="header"
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backdropFilter: 'blur(12px)',
                    backgroundColor: isDark ? 'rgba(15,21,38,0.6)' : 'rgba(255,255,255,0.6)',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1.2}>
                            <Box component="img" src={logo} alt="TherapyHome" sx={{ height: 36, width: 'auto' }} />
                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                                TherapyHome
                            </Typography>
                        </Stack>
                        <Button
                            component={Link}
                            to="/choose"
                            variant="contained"
                            endIcon={<ArrowRight size={18} />}
                            sx={{ borderRadius: 999, px: 2.5 }}
                        >
                            Login
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* ---------------- Hero ---------------- */}
            <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
                <Grid container spacing={{ xs: 5, md: 4 }} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <MotionBox variants={fadeUp} initial="hidden" animate="show">
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    display: 'inline-flex',
                                    px: 1.5,
                                    py: 0.6,
                                    mb: 2.5,
                                    borderRadius: 999,
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(77,68,224,0.06)',
                                }}
                            >
                                <Sparkles size={15} color={primary} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    The all-in-one therapy &amp; class management platform
                                </Typography>
                            </Stack>

                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 800,
                                    lineHeight: 1.05,
                                    letterSpacing: '-0.03em',
                                    fontSize: { xs: '2.4rem', sm: '3rem', md: '3.4rem' },
                                    mb: 2,
                                }}
                            >
                                Run your practice{' '}
                                <Box
                                    component="span"
                                    sx={{
                                        background: `linear-gradient(120deg, ${primary}, #7b2ff7 60%, #11b3a4)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    beautifully.
                                </Box>
                            </Typography>

                            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 520, mb: 4 }}>
                                Streamline scheduling and class organization, onboard students and faculty,
                                track attendance, assess performance and handle fees — all from one premium workspace.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    component={Link}
                                    to="/choose"
                                    size="large"
                                    variant="contained"
                                    endIcon={<ArrowRight size={18} />}
                                    sx={{ borderRadius: 999, px: 3.5, py: 1.2 }}
                                >
                                    Get started
                                </Button>
                                <Button
                                    component={Link}
                                    to="/choose"
                                    size="large"
                                    variant="outlined"
                                    sx={{ borderRadius: 999, px: 3.5, py: 1.2 }}
                                >
                                    Sign in
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 3 }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} color="#ffb400" fill="#ffb400" />
                                ))}
                                <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                                    Loved by modern clinics &amp; academies
                                </Typography>
                            </Stack>
                        </MotionBox>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                        >
                            {/* Glass hero card with floating logo */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: 460,
                                    borderRadius: 5,
                                    p: { xs: 3, md: 5 },
                                    border: `1px solid ${theme.palette.divider}`,
                                    background: isDark ? 'rgba(29,38,64,0.55)' : 'rgba(255,255,255,0.65)',
                                    backdropFilter: 'blur(16px)',
                                    boxShadow: isDark
                                        ? '0 30px 80px rgba(0,0,0,0.5)'
                                        : '0 30px 80px rgba(45,55,99,0.18)',
                                }}
                            >
                                <MotionBox
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                    sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}
                                >
                                    <Box
                                        component="img"
                                        src={logo}
                                        alt="TherapyHome"
                                        sx={{ width: '62%', filter: 'drop-shadow(0 20px 40px rgba(77,68,224,0.35))' }}
                                    />
                                </MotionBox>
                                <Grid container spacing={1.5}>
                                    {stats.map((s) => (
                                        <Grid item xs={6} key={s.label}>
                                            <Box
                                                sx={{
                                                    borderRadius: 3,
                                                    p: 2,
                                                    textAlign: 'center',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                                                }}
                                            >
                                                <Typography variant="h5" sx={{ fontWeight: 800, color: primary }}>
                                                    {s.value}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {s.label}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </MotionBox>
                    </Grid>
                </Grid>
            </Container>

            {/* ---------------- Features ---------------- */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <MotionBox
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    sx={{ textAlign: 'center', mb: 6 }}
                >
                    <Typography variant="overline" sx={{ color: primary, fontWeight: 700, letterSpacing: '0.12em' }}>
                        EVERYTHING YOU NEED
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mt: 1, fontSize: { xs: '1.9rem', md: '2.5rem' } }}>
                        One platform for your whole practice
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 620, mx: 'auto', mt: 1.5 }}>
                        Purpose-built modules that work together — no more stitching spreadsheets and disconnected tools.
                    </Typography>
                </MotionBox>

                <Grid container spacing={3}>
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={f.title}>
                                <MotionCard
                                    variants={fadeUp}
                                    custom={i}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true, amount: 0.3 }}
                                    whileHover={{ y: -6 }}
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 4,
                                        border: `1px solid ${theme.palette.divider}`,
                                        backgroundColor: 'background.paper',
                                        transition: 'box-shadow .25s ease',
                                        '&:hover': {
                                            boxShadow: isDark ? '0 18px 40px rgba(0,0,0,0.45)' : '0 18px 40px rgba(45,55,99,0.12)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                width: 52,
                                                height: 52,
                                                borderRadius: 3,
                                                display: 'grid',
                                                placeItems: 'center',
                                                mb: 2,
                                                color: '#fff',
                                                background: `linear-gradient(135deg, ${primary}, #7b2ff7)`,
                                                boxShadow: `0 10px 22px ${primary}44`,
                                            }}
                                        >
                                            <Icon size={24} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                                            {f.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                            {f.desc}
                                        </Typography>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>

            {/* ---------------- Testimonials ---------------- */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <MotionBox
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    sx={{ textAlign: 'center', mb: 6 }}
                >
                    <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '1.9rem', md: '2.5rem' } }}>
                        Trusted by teams that care
                    </Typography>
                </MotionBox>
                <Grid container spacing={3}>
                    {testimonials.map((t, i) => (
                        <Grid item xs={12} md={4} key={t.name}>
                            <MotionCard
                                variants={fadeUp}
                                custom={i}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.3 }}
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    borderRadius: 4,
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: 'background.paper',
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                                        {[...Array(5)].map((_, s) => (
                                            <Star key={s} size={15} color="#ffb400" fill="#ffb400" />
                                        ))}
                                    </Stack>
                                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                                        “{t.quote}”
                                    </Typography>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar sx={{ bgcolor: primary, fontWeight: 700 }}>
                                            {t.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t.role}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* ---------------- CTA banner ---------------- */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
                <MotionBox
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                    sx={{
                        borderRadius: 6,
                        p: { xs: 4, md: 7 },
                        textAlign: 'center',
                        color: '#fff',
                        background: `linear-gradient(120deg, ${primary}, #7b2ff7 55%, #11b3a4)`,
                        boxShadow: `0 30px 70px ${primary}55`,
                    }}
                >
                    <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '1.8rem', md: '2.4rem' }, mb: 1.5 }}>
                        Ready to get organized?
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 4, maxWidth: 560, mx: 'auto' }}>
                        Sign in to your workspace and bring your whole practice into one place today.
                    </Typography>
                    <Button
                        component={Link}
                        to="/choose"
                        size="large"
                        variant="contained"
                        endIcon={<ArrowRight size={18} />}
                        sx={{
                            borderRadius: 999,
                            px: 4,
                            py: 1.3,
                            backgroundColor: '#fff',
                            color: primary,
                            '&:hover': { backgroundColor: '#f2f2ff' },
                        }}
                    >
                        Login to TherapyHome
                    </Button>
                </MotionBox>
            </Container>

            {/* ---------------- Footer ---------------- */}
            <Box component="footer" sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 4 }}>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.2}>
                            <Box component="img" src={logo} alt="TherapyHome" sx={{ height: 28 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>TherapyHome</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            © {new Date().getFullYear()} TherapyHome. All rights reserved.
                        </Typography>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default Homepage;
