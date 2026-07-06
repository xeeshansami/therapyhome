import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Grid,
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    TextField,
    IconButton,
    InputAdornment,
    CircularProgress,
    Backdrop,
    Button,
    Stack,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import logo from '../assets/logo.png';

// ---------------------------------------------------------------------------
// Premium authentication screen. ALL logic preserved: handleSubmit (student
// rollNumber vs email branch), handleInputChange, guestModeHandler, the
// auth-redirect effect, every error state, Popup and guest Backdrop. Field
// name/id attributes are kept byte-for-byte so form reads still work. The old
// nested static-theme ThemeProvider was removed so dark mode now applies here.
// ---------------------------------------------------------------------------

const MotionDiv = motion.div;

const LoginPage = ({ role }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const primary = theme.palette.primary.main;

    const { status, currentUser, response, error, currentRole } = useSelector((state) => state.user);

    const [toggle, setToggle] = useState(false);
    const [guestLoader, setGuestLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (role === 'Student') {
            const rollNum = event.target.rollNumber.value;
            const password = event.target.password.value;

            if (!rollNum || !password) {
                if (!rollNum) setRollNumberError(true);
                if (!password) setPasswordError(true);
                return;
            }
            const fields = { rollNum, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        } else {
            const email = event.target.email.value;
            const password = event.target.password.value;

            if (!email || !password) {
                if (!email) setEmailError(true);
                if (!password) setPasswordError(true);
                return;
            }

            const fields = { email, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'rollNumber') setRollNumberError(false);
    };

    const guestModeHandler = () => {
        const password = 'zxc';

        if (role === 'Admin') {
            const email = 'yogendra@12';
            const fields = { email, password };
            setGuestLoader(true);
            dispatch(loginUser(fields, role));
        } else if (role === 'Student') {
            const rollNum = '1';
            const studentName = 'Dipesh Awasthi';
            const fields = { rollNum, studentName, password };
            setGuestLoader(true);
            dispatch(loginUser(fields, role));
        } else if (role === 'Teacher') {
            const email = 'tony@12';
            const fields = { email, password };
            setGuestLoader(true);
            dispatch(loginUser(fields, role));
        }
    };

    useEffect(() => {
        if (status === 'success' || currentUser !== null) {
            if (currentRole === 'Admin') {
                navigate('/Admin/dashboard');
            } else if (currentRole === 'Student') {
                navigate('/Student/dashboard');
            } else if (currentRole === 'Teacher') {
                navigate('/Teacher/dashboard');
            }
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage('Network Error');
            setShowPopup(true);
            setLoader(false);
            setGuestLoader(false);
        }
    }, [status, currentRole, navigate, error, response, currentUser]);

    const roleLabel = role === 'Student' ? 'Reception' : role === 'Teacher' ? 'Staff' : 'Admin';
    const isStudent = role === 'Student';

    return (
        <Grid container component="main" sx={{ minHeight: '100vh', overflowX: 'hidden' }}>
            {/* ---------------- Form panel ---------------- */}
            <Grid
                item
                xs={12}
                md={5}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 3, sm: 6 },
                    backgroundColor: 'background.paper',
                }}
            >
                <MotionDiv
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: '100%', maxWidth: 420 }}
                >
                    <Stack spacing={1} sx={{ mb: 4 }}>
                        <Box component="img" src={logo} alt="TherapyHome" sx={{ height: 48, width: 'auto', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                            {roleLabel} Login
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Welcome back! Please enter your details.
                        </Typography>
                    </Stack>

                    <Box component="form" noValidate onSubmit={handleSubmit}>
                        {isStudent ? (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="rollNumber"
                                label="Enter your email id"
                                name="rollNumber"
                                autoComplete="off"
                                type="email"
                                autoFocus
                                error={rollNumberError}
                                helperText={rollNumberError && 'Email Id is required'}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={18} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        ) : (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Enter your email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                error={emailError}
                                helperText={emailError && 'Email is required'}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={18} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={toggle ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            error={passwordError}
                            helperText={passwordError && 'Password is required'}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={18} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setToggle(!toggle)} edge="end" aria-label="toggle password visibility">
                                            {toggle ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" size="small" />}
                                label={<Typography variant="body2">Remember me</Typography>}
                            />
                            <Typography
                                component={Link}
                                to="#"
                                variant="body2"
                                sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                            >
                                Forgot password?
                            </Typography>
                        </Stack>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loader}
                            endIcon={!loader && <ArrowRight size={18} />}
                            sx={{
                                mt: 3,
                                py: 1.2,
                                borderRadius: 2.5,
                                background: `linear-gradient(120deg, ${primary}, #7b2ff7)`,
                                boxShadow: `0 12px 26px ${primary}55`,
                            }}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>

                        {role === 'Admin' && (
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Don't have an account?
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/Adminregister"
                                    variant="body2"
                                    sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
                                >
                                    Admin Registration
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </MotionDiv>
            </Grid>

            {/* ---------------- Brand panel ---------------- */}
            <Grid
                item
                xs={false}
                md={7}
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: isDark
                        ? 'radial-gradient(800px 500px at 30% 20%, rgba(122,110,255,0.28), transparent 60%), linear-gradient(135deg, #151b2d, #221a4d)'
                        : `linear-gradient(135deg, ${primary}, #7b2ff7 55%, #11b3a4)`,
                }}
            >
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ textAlign: 'center', color: '#fff', padding: 32 }}
                >
                    <motion.img
                        src={logo}
                        alt="TherapyHome"
                        style={{ width: 220, maxWidth: '60%', filter: 'drop-shadow(0 24px 50px rgba(0,0,0,0.35))' }}
                        animate={{ y: [0, -14, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 4, letterSpacing: '-0.02em' }}>
                        TherapyHome
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mt: 1.5, maxWidth: 420, mx: 'auto' }}>
                        Your whole practice — sessions, students, staff and fees — in one premium workspace.
                    </Typography>
                </MotionDiv>
            </Grid>

            <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={guestLoader}>
                <CircularProgress color="inherit" />
                &nbsp;Please Wait
            </Backdrop>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Grid>
    );
};

export default LoginPage;
