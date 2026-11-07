import { useEffect, useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    AppBar,
    Tooltip,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Navigate, Route, Routes } from 'react-router-dom';
import GlobalSearch from '../../components/GlobalSearch';
import SettingsLauncher from '../../components/SettingsLauncher';
import Logout from '../Logout';
import SideBar, { sidebarBackground } from './SideBar';
import AdminProfile from './AdminProfile';
import AdminSettings from './AdminSettings';
import AdminInvoice from './AdminInvoice';
import AdminFees from './AdminFees';
import FeeRecords from './FeeRecords';
import TeachersSalary from './TeachersSalary';
import TermsPage from './studentRelated/TermsPage';
import AdminHomePage from './AdminHomePage';

import AddStudent from './studentRelated/AddStudent';
import AddConsultancy from './studentRelated/AddConsultancy';
import ShowConsultations from './studentRelated/ShowConsultations';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';

export const SIDEBAR_WIDTH = 264;

const AdminDashboard = () => {
    // Desktop: the sidebar opens and closes completely and the page reflows.
    // Phones/tablets: it slides over the page and closes after choosing a link.
    const isNarrow = useMediaQuery((t) => t.breakpoints.down('md'));
    const [open, setOpen] = useState(!isNarrow);
    useEffect(() => { setOpen(!isNarrow); }, [isNarrow]);
    const toggleDrawer = () => setOpen((o) => !o);
    const closeOnMobile = () => { if (isNarrow) setOpen(false); };
    const shifted = open && !isNarrow;

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={(theme) => ({
                        zIndex: theme.zIndex.drawer - (isNarrow ? 1 : -1),
                        width: shifted ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
                        ml: shifted ? `${SIDEBAR_WIDTH}px` : 0,
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        transition: theme.transitions.create(['width', 'margin'], { duration: theme.transitions.duration.standard }),
                    })}
                >
                    <Toolbar sx={{ gap: 1.5, pr: { xs: 1.5, sm: 3 } }}>
                        <Tooltip title={open ? 'Close menu' : 'Open menu'}>
                            <IconButton edge="start" color="inherit" aria-label={open ? 'close menu' : 'open menu'} onClick={toggleDrawer}>
                                {open && !isNarrow ? <MenuOpenIcon /> : <MenuIcon />}
                            </IconButton>
                        </Tooltip>
                        <Box sx={{ minWidth: 0, mr: { xs: 0, md: 2 } }}>
                            <Typography component="h1" noWrap sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' }, lineHeight: 1.2 }}>
                                Therapy Home
                            </Typography>
                            <Typography noWrap variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                Admin Panel
                            </Typography>
                        </Box>
                        <GlobalSearch />
                        <Box sx={{ flexGrow: 1 }} />
                        <SettingsLauncher />
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant={isNarrow ? 'temporary' : 'persistent'}
                    open={open}
                    onClose={() => setOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={(theme) => ({
                        width: shifted ? SIDEBAR_WIDTH : 0,
                        flexShrink: 0,
                        transition: theme.transitions.create('width', { duration: theme.transitions.duration.standard }),
                        '& .MuiDrawer-paper': {
                            width: SIDEBAR_WIDTH,
                            boxSizing: 'border-box',
                            border: 'none',
                            background: sidebarBackground(theme),
                            boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
                        },
                    })}
                >
                    <SideBar onNavigate={closeOnMobile} />
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path="/dashboard" element={<AdminHomePage />} />
                        <Route path="/profile" element={<AdminProfile />} />
                        <Route path="/settings" element={<AdminSettings />} />
                        <Route path="/complains" element={<SeeComplains />} />

                        {/* Notice */}
                        <Route path="/addnotice" element={<AddNotice />} />
                        <Route path="/notices" element={<ShowNotices />} />

                        {/* AdminInvoice */}
                        <Route path="/Invoice" element={<AdminInvoice />} />

                        {/* AdminFees */}
                        <Route path="/Fees" element={<AdminFees />} />
                        <Route path="/FeeRecords" element={<FeeRecords />} />

                        {/* TeachersSalary */}
                        <Route path="/TeachersSalary" element={<TeachersSalary />} />
                        <Route path="/terms" element={<TermsPage />} />
                        
                        {/* Subject */}
                        <Route path="/subjects" element={<ShowSubjects />} />
                        <Route path="/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />
                        <Route path="/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/class/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class */}
                        <Route path="/addclass" element={<AddClass />} />
                        <Route path="/classes" element={<ShowClasses />} />
                        <Route path="/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student */}
                        <Route path="/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/students" element={<ShowStudents />} />
                        <Route path="/addConsultancy" element={<AddConsultancy />} />
                        <Route path="/consultations" element={<ShowConsultations />} />
                        <Route path="/students/student/:id" element={<ViewStudent />} />
                        <Route path="/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* Teacher */}
                        <Route path="/teachers" element={<ShowTeachers />} />
                        <Route path="/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/teachers/addteacher/:id" element={<AddTeacher />} />

                        <Route path="/logout" element={<Logout />} />
                        
                        {/* Fallback for any unmatched route within Admin dashboard */}
                        <Route path='*' element={<Navigate to="/" />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default AdminDashboard

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        minWidth: 0,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
    captionStyled: {
        fontSize: '12.2rem', // Adjust font size as needed
        color: 'black', // Caption text color
        margin: 0, // Remove default margins
        textAlign: 'center', // Center text
        marginBottom: '2rem', // Space between caption and grid
    },
    captionStyledToolbar: {
        fontSize: '1.2rem', // Adjust font size as needed
        color: 'black', // Caption text color
        margin: 0, // Remove default margins
        textAlign: 'center', // Center text
        marginBottom: '2rem', // Space between caption and grid
    },
    StyledLogo: {
        height: "50px",     // Adjust the height as needed for the icon size
        width: "50px",      // Adjust the width to match height
        display: "block",  // Remove any inline spacing issues
        objectFit: "contain" // Ensure the image fits within the dimensions while maintaining its aspect ratio
    },
}