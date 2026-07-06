import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  CircularProgress,
  Backdrop,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import logo from '../assets/logo.png';

// ---------------------------------------------------------------------------
// Role selection screen. All logic preserved verbatim: the auth-redirect
// effect, navigateHandler, loader + Popup. Only the presentation is new.
// ---------------------------------------------------------------------------

const MotionDiv = motion.div;

const roles = [
  {
    key: 'Admin',
    title: 'Admin',
    desc: 'Login as an administrator to access and manage TherapyHome.',
    icon: ShieldCheck,
    gradient: 'linear-gradient(135deg, #4d44e0, #7b2ff7)',
  },
  {
    key: 'Teacher',
    title: 'Staff',
    desc: 'Login as staff to create courses, sessions, and track student records.',
    icon: Users,
    gradient: 'linear-gradient(135deg, #11b3a4, #2f6fed)',
  },
];

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { status, currentUser, currentRole } = useSelector((state) => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const navigateHandler = (user) => {
    if (user === 'Admin') {
      navigate('/Adminlogin');
    } else if (user === 'Student') {
      navigate('/Studentlogin');
    } else if (user === 'Teacher') {
      navigate('/Teacherlogin');
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
    } else if (status === 'error') {
      setLoader(false);
      setMessage('Network Error');
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  const pageBg = isDark
    ? 'radial-gradient(1000px 500px at 50% -10%, rgba(122,110,255,0.22), transparent 60%), #0f1526'
    : 'radial-gradient(1000px 500px at 50% -10%, rgba(122,110,255,0.18), transparent 60%), #f6f7fc';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: pageBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        overflowX: 'hidden',
      }}
    >
      <Container maxWidth="md">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Stack alignItems="center" spacing={2} sx={{ mb: 5, textAlign: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="TherapyHome"
              sx={{ height: 72, filter: 'drop-shadow(0 16px 30px rgba(77,68,224,0.3))' }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome to TherapyHome
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 460 }}>
              Choose how you'd like to sign in and we'll take you to your workspace.
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
          >
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <MotionDiv
                  key={r.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8 }}
                  style={{ flex: 1, maxWidth: 340, cursor: 'pointer' }}
                  onClick={() => navigateHandler(r.key)}
                >
                  <Box
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateHandler(r.key)}
                    sx={{
                      height: '100%',
                      borderRadius: 5,
                      p: 4,
                      textAlign: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: isDark ? 'rgba(29,38,64,0.6)' : 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(14px)',
                      boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.4)' : '0 20px 50px rgba(45,55,99,0.12)',
                      transition: 'box-shadow .25s ease, border-color .25s ease',
                      '&:hover': { borderColor: theme.palette.primary.main },
                      outline: 'none',
                      '&:focus-visible': { boxShadow: `0 0 0 3px ${theme.palette.primary.main}55` },
                    }}
                  >
                    <Box
                      sx={{
                        width: 68,
                        height: 68,
                        mx: 'auto',
                        mb: 2.5,
                        borderRadius: '20px',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        background: r.gradient,
                        boxShadow: '0 14px 30px rgba(77,68,224,0.35)',
                      }}
                    >
                      <Icon size={30} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {r.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                      {r.desc}
                    </Typography>
                    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ color: 'primary.main' }}>
                      <Typography variant="button" sx={{ fontWeight: 700 }}>
                        Continue
                      </Typography>
                      <ArrowRight size={17} />
                    </Stack>
                  </Box>
                </MotionDiv>
              );
            })}
          </Stack>
        </MotionDiv>

        <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color="inherit" />
          &nbsp;Please Wait
        </Backdrop>
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      </Container>
    </Box>
  );
};

export default ChooseUser;
